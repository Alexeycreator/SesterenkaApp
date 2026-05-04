using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApi.Methods;
using WebApi.Models.DataBase;
using WebApi.Models.DTOs.Order;
using WebApi.Services.EnumFlags;

namespace WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class OrdersController(ServerDbContext dbContext) : ControllerBase
{
    private List<AddressesOrderDataDto> addressesDto = new List<AddressesOrderDataDto>();
    private readonly string statusBasket = OrdersEnum.Basket.GetDescription();
    private readonly string statusProcessing = OrdersEnum.Processing.GetDescription();
    private CurrentOrderDto currentOrderDto = new CurrentOrderDto();

    [HttpGet]
    public async Task<ActionResult<IEnumerable<OrdersModel>>> GetOrdersAsync()
    {
        return await dbContext.Orders.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<OrdersModel>> GetOrderAsync(int id)
    {
        var order = await dbContext.Orders.FindAsync(id);
        if (order == null)
        {
            return NotFound(new
            {
                StatusCode = 404,
                Message = $"Данного заказа не существует",
                Timestamp = DateTime.UtcNow
            });
        }

        return Ok(order);
    }

    [HttpGet("order-data")]
    public async Task<IActionResult> GetOrderDataAsync(string currentUserLogin)
    {
        try
        {
            var addresses = await dbContext.Addresses.ToListAsync();
            var addressesDto = FillingAddressesOrderData(addresses);
        
            var orderDataList = await dbContext.Orders
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Products)
                .Include(o => o.Users)
                .Where(o => o.Users.Login == currentUserLogin)
                .Select(o => new OrderDataDto
                {
                    Id = o.Id,
                    NameOrder = o.NameOrder,
                    LoginUser = o.Users.Login,
                    Status = o.Status,
                    OrderDate = o.OrderDate,
                    OrderItems = o.OrderItems.Select(oi => new OrderItemsOrderDataDto
                    {
                        Id = oi.Id,
                        Quantity = oi.Quantity,
                        Price = oi.PriceAtMoment,
                        NameProduct = oi.Products != null ? oi.Products.Name : string.Empty,
                    }).ToList()
                })
                .ToListAsync();

            if (!orderDataList.Any())
            {
                return Ok(new List<OrderResponseDto>());
            }

            var totalPriceAllOrders = orderDataList.Sum(o => o.OrderItems.Sum(oi => oi.TotalPrice));
        
            var orderResponse = new OrderResponseDto
            {
                Orders = orderDataList,
                Addresses = addressesDto,
                TotalPrice = totalPriceAllOrders
            };

            return Ok(new List<OrderResponseDto> { orderResponse });
        }
        catch (NullReferenceException ex)
        {
            return StatusCode(500, new { message = "Ошибка при обновлении", error = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Ошибка при обновлении", error = ex.Message });
        }
    }

    [HttpGet("current-order")]
    public async Task<IActionResult> GetCurrentOrder(int id)
    {
        try
        {
            var currentOrder = await dbContext.Orders.FindAsync(id);
            if (currentOrder != null)
            {
                AddressesOrderDataDto address = new AddressesOrderDataDto();
                List<CurrentOrderProductsDto> products = new List<CurrentOrderProductsDto>();

                var addressesDb = await dbContext.Addresses.FindAsync(currentOrder.Addresses_Id);
                if (addressesDb != null)
                {
                    address.Id = addressesDb.Id;
                    address.City = addressesDb.City;
                    address.House = addressesDb.House;
                    address.Street = addressesDb.Street;
                }

                var orderItems = await dbContext.OrderItems
                    .Include(oi => oi.Products)
                    .Include(oi => oi.Products.Categories)
                    .Include(oi => oi.Products.Manufacturers)
                    .Where(oi => oi.Orders_Id == id)
                    .ToListAsync();
                if (orderItems.Count > 0)
                {
                    foreach (var product in orderItems)
                    {
                        if (product.Products != null && product.Products.Categories != null &&
                            product.Products.Manufacturers != null)
                        {
                            double totalPriceProducts = product.PriceAtMoment * product.Quantity;
                            products.Add(new CurrentOrderProductsDto()
                            {
                                Id = product.Products.Id,
                                Quantity = product.Quantity,
                                NameProduct = product.Products.Name,
                                Price = product.PriceAtMoment,
                                Categories = product.Products.Categories.Name,
                                Manufacturers = product.Products.Manufacturers.Name,
                                PartNumber = product.Products.PartNumber,
                                TotalPriceProduct = totalPriceProducts,
                                Image = product.Products.Image,
                            });
                        }
                    }
                }

                currentOrderDto.Id = currentOrder.Id;
                currentOrderDto.DateOrder = currentOrder.OrderDate;
                currentOrderDto.Status = currentOrder.Status;
                currentOrderDto.Address = address;
                currentOrderDto.Products = products;
                currentOrderDto.CountProducts = products.Count;
                currentOrderDto.TotalPriceOrder = products.Sum(p => p.Price * p.Quantity);
            }
            else
            {
                return NotFound();
            }

            return Ok(currentOrderDto);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Ошибка при обновлении", error = ex.Message });
        }
    }

    private List<AddressesOrderDataDto> FillingAddressesOrderData(List<AddressesModel> addresses)
    {
        foreach (var address in addresses.Where(address => address.IsShop))
        {
            addressesDto.Add(new AddressesOrderDataDto()
            {
                Id = address.Id,
                City = address.City,
                Street = address.Street,
                House = address.House
            });
        }

        return addressesDto;
    }

    [HttpPost("create-order")]
    public async Task<IActionResult> CreateOrder([FromBody] AddOrderDto? request)
    {
        try
        {
            if (request == null)
            {
                return BadRequest();
            }

            var user = await dbContext.Users.FirstOrDefaultAsync(u => u.Login == request.UserLogin);
            var address = await dbContext.Addresses.FirstOrDefaultAsync(a => a.Id == request.AddressId);
            if (address != null && address.IsShop)
            {
                if (user != null)
                {
                    var order = await dbContext.Orders.Where(o => o.Users_Id == user.Id && o.Status == statusBasket)
                        .FirstOrDefaultAsync();
                    if (order != null)
                    {
                        order.Status = statusProcessing;
                        foreach (var product in request.OrderItems)
                        {
                            var productDb = await dbContext.Products.FindAsync(product.Id);
                            if (productDb == null)
                            {
                                return BadRequest(new { message = $"Товар с ID {product.Id} не найден" });
                            }

                            var stocks = await dbContext.Stocks
                                .Where(s => s.Products_Id == productDb.Id)
                                .ToListAsync();
                            var totalStock = stocks.Sum(s => s.Quantity);
                            if (totalStock < product.Quantity)
                            {
                                return BadRequest(new
                                {
                                    message =
                                        $"Недостаточно товара '{productDb.Name}' на складе. Доступно: {totalStock} шт. (в заказе {product.Quantity} шт.)"
                                });
                            }

                            int remainingToDeduct = product.Quantity;
                            foreach (var stock in stocks.OrderBy(s => s.Quantity))
                            {
                                if (remainingToDeduct <= 0)
                                {
                                    break;
                                }

                                var deductQuantity = Math.Min(stock.Quantity, remainingToDeduct);
                                stock.Quantity -= deductQuantity;
                                remainingToDeduct -= deductQuantity;

                                dbContext.Entry(stock).State = EntityState.Modified;
                            }
                        }

                        order.Addresses_Id = request.AddressId;
                    }

                    await dbContext.SaveChangesAsync();
                }
            }
            else
            {
                return NotFound();
            }

            return Ok();
        }
        catch (DbUpdateException ex)
        {
            return StatusCode(500, new { message = $"Ошибка базы данных: {ex.Message}" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }

    [HttpPut("update-status-order")]
    public async Task<IActionResult> UpdateStatusOrder([FromBody] UpdateStatusOrderDto? request)
    {
        try
        {
            if (request == null)
            {
                return BadRequest(new { message = "Данные пустые" });
            }

            var order = await dbContext.Orders.FindAsync(request.Id);
            if (order == null)
            {
                return NotFound(new { message = "Такого заказа не существует" });
            }

            order.Status = request.Status;
            await dbContext.SaveChangesAsync();

            return Ok(new { message = "Статус заказа успешно обновлен" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }
}