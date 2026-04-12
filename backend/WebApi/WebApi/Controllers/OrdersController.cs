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
    private List<OrderItemsOrderDataDto> orderItemsDto = new List<OrderItemsOrderDataDto>();
    private List<OrderResponseDto> orderResponse = new List<OrderResponseDto>();
    private readonly string statusBasket = OrdersEnum.Basket.GetDescription();
    private readonly string statusProcessing = OrdersEnum.Processing.GetDescription();
    private readonly string statusCompleted = OrdersEnum.Completed.GetDescription();

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
                Message = $"Данного производителя не существует",
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
            var orderProducts = await dbContext.Products.ToListAsync();
            var orderOrderData = await dbContext.Orders.ToListAsync();
            var orderUsers = await dbContext.Users.ToListAsync();
            var orderAddresses = await dbContext.Addresses.ToListAsync();
            var orderOrderItems = await dbContext.OrderItems.ToListAsync();

            addressesDto = FillingAddressesOrderData(orderAddresses);
            orderItemsDto = FillingOrderItemsOrderData(orderOrderItems, currentUserLogin);

            var orderData = await dbContext.Orders
                .Select(o => new OrderDataDto()
                {
                    Id = o.Id,
                    LoginUser = o.Users.Login,
                    Status = o.Status,
                    OrderDate = o.OrderDate,
                    OrderItems = orderItemsDto,
                }).Where(o => o.LoginUser == currentUserLogin).ToListAsync();

            var totalPriceAllOrders = orderData.Sum(o => o.OrderItems.Sum(oi => oi.TotalPrice));
            orderResponse.Add(new OrderResponseDto()
            {
                Orders = orderData,
                Addresses = addressesDto,
                TotalPrice = totalPriceAllOrders
            });

            return Ok(orderResponse);
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

    private List<AddressesOrderDataDto> FillingAddressesOrderData(List<AddressesModel> addresses)
    {
        foreach (var address in addresses)
        {
            if (address.IsShop)
            {
                addressesDto.Add(new AddressesOrderDataDto()
                {
                    Id = address.Id,
                    City = address.City,
                    Street = address.Street,
                    House = address.House
                });
            }
        }

        return addressesDto;
    }

    private List<OrderItemsOrderDataDto> FillingOrderItemsOrderData(List<OrderItemsModel> orderItems,
        string currentUserLogin)
    {
        foreach (var items in orderItems)
        {
            if (items.Orders_Id != null)
            {
                if (items.Orders != null && items.Orders.Users != null && items.Orders.Users.Login == currentUserLogin)
                {
                    if (items.Products != null)
                        orderItemsDto.Add(new OrderItemsOrderDataDto()
                        {
                            Id = items.Id,
                            Quantity = items.Quantity,
                            Price = items.PriceAtMoment,
                            NameProduct = items.Products.Name
                        });
                }
            }
            else
            {
                throw new NullReferenceException();
            }
        }

        return orderItemsDto;
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
}