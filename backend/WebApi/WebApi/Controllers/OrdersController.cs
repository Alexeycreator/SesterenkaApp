using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NLog;
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
    private Logger loggerOrdersController = LogManager.GetCurrentClassLogger();

    [HttpGet]
    public async Task<ActionResult<IEnumerable<OrdersModel>>> GetOrdersAsync()
    {
        return await dbContext.Orders.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<OrdersModel>> GetOrderByIdAsync(int id)
    {
        var order = await dbContext.Orders.FindAsync(id);
        if (order == null)
        {
            loggerOrdersController.Error($"Данного заказа с id = {id} не существует");
            return NotFound(new
            {
                StatusCode = 404,
                Message = $"Данного заказа не существует",
                Timestamp = DateTime.Now
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
        catch (Exception ex)
        {
            loggerOrdersController.Error($"Внутренняя ошибка сервера: {ex.Message}");
            return StatusCode(500, new { message = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }

    [HttpGet("current-order")]
    public async Task<IActionResult> GetCurrentOrderAsync(int id)
    {
        try
        {
            var currentOrder = await dbContext.Orders.FindAsync(id);
            if (currentOrder != null)
            {
                loggerOrdersController.Info($"Текущий заказ ({id}) найден");
                AddressesOrderDataDto address = new AddressesOrderDataDto();
                List<CurrentOrderProductsDto> products = new List<CurrentOrderProductsDto>();

                var addressesDb = await dbContext.Addresses.FindAsync(currentOrder.Addresses_Id);
                if (addressesDb != null)
                {
                    loggerOrdersController.Info($"Заполнение адресов для заказа...");
                    address.Id = addressesDb.Id;
                    address.City = addressesDb.City;
                    address.House = addressesDb.House;
                    address.Street = addressesDb.Street;
                }

                loggerOrdersController.Info($"Заполнение прошло успешно");

                var orderItems = await dbContext.OrderItems
                    .Include(oi => oi.Products)
                    .Include(oi => oi.Products.Categories)
                    .Include(oi => oi.Products.Manufacturers)
                    .Where(oi => oi.Orders_Id == id)
                    .ToListAsync();
                if (orderItems.Count > 0)
                {
                    loggerOrdersController.Info($"Товары в корзине есть");
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
                currentOrderDto.NameOrder = currentOrder.NameOrder;
                currentOrderDto.Address = address;
                currentOrderDto.Products = products;
                currentOrderDto.CountProducts = products.Count;
                currentOrderDto.TotalPriceOrder = products.Sum(p => p.Price * p.Quantity);
                loggerOrdersController.Info($"Сформирован DTO для ответа клиенту");
            }
            else
            {
                loggerOrdersController.Error($"Текущий заказ ({id}) не найден");
                return NotFound(new { message = $"Текущий заказ ({id}) не найден" });
            }

            return Ok(currentOrderDto);
        }
        catch (Exception ex)
        {
            loggerOrdersController.Error($"Внутренняя ошибка сервера: {ex.Message}");
            return StatusCode(500, new { message = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }

    private List<AddressesOrderDataDto> FillingAddressesOrderData(List<AddressesModel> addresses)
    {
        loggerOrdersController.Info($"Заполнение коллекции адресов магазинов...");
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

        if (addressesDto.Count > 0)
        {
            loggerOrdersController.Info($"Данные успешно заполнены");
        }
        else
        {
            loggerOrdersController.Warn($"Данные пустые");
        }

        return addressesDto;
    }

    [HttpPost("create-order")]
    public async Task<IActionResult> CreateOrderAsync([FromBody] AddOrderDto? request)
    {
        try
        {
            if (request == null)
            {
                loggerOrdersController.Error($"Данные пустые");
                return BadRequest(new { message = $"Данные пустые" });
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
                                loggerOrdersController.Error($"Товар с ID {product.Id} не найден");
                                return BadRequest(new { message = $"Товар с ID {product.Id} не найден" });
                            }

                            var stocks = await dbContext.Stocks
                                .Where(s => s.Products_Id == productDb.Id)
                                .ToListAsync();
                            var totalStock = stocks.Sum(s => s.Quantity);
                            if (totalStock < product.Quantity)
                            {
                                loggerOrdersController.Error(
                                    $"Недостаточно товара '{productDb.Name}' на складе. Доступно: {totalStock} шт. (в заказе {product.Quantity} шт.)");
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
                    else
                    {
                        loggerOrdersController.Warn($"Заказ не найден");
                    }

                    await dbContext.SaveChangesAsync();
                    loggerOrdersController.Info($"Все изменения внесены в БД");
                }
                else
                {
                    loggerOrdersController.Error($"Пользователя {request.UserLogin} не существует");
                    return NotFound(new { message = $"Пользователя {request.UserLogin} не существует" });
                }
            }
            else
            {
                loggerOrdersController.Error($"Магазина с таким адресом не найдено");
                return NotFound(new { message = $"Магазина с таким адресом не найдено" });
            }

            return Ok();
        }
        catch (DbUpdateException ex)
        {
            loggerOrdersController.Error($"Ошибка базы данных: {ex.Message}");
            return StatusCode(500, new { message = $"Ошибка базы данных: {ex.Message}" });
        }
        catch (Exception ex)
        {
            loggerOrdersController.Error($"Внутренняя ошибка сервера: {ex.Message}");
            return StatusCode(500, new { message = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }

    [HttpPut("update-status-order")]
    public async Task<IActionResult> UpdateStatusOrderAsync([FromBody] UpdateStatusOrderDto? request)
    {
        try
        {
            if (request == null)
            {
                loggerOrdersController.Error($"Данные пустые");
                return BadRequest(new { message = "Данные пустые" });
            }

            var order = await dbContext.Orders.FindAsync(request.Id);
            if (order == null)
            {
                loggerOrdersController.Error($"Такого заказа ({request.Id}) не существует");
                return NotFound(new { message = "Такого заказа не существует" });
            }

            order.Status = request.Status;
            loggerOrdersController.Info($"Статус заказа обновлен");
            await dbContext.SaveChangesAsync();
            loggerOrdersController.Info($"Все изменения успешно внесены в БД");

            return Ok(new { message = "Статус заказа успешно обновлен" });
        }
        catch (Exception ex)
        {
            loggerOrdersController.Error($"Внутренняя ошибка сервера: {ex.Message}");
            return StatusCode(500, new { message = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }
}