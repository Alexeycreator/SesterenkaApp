using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NLog;
using WebApi.Methods;
using WebApi.Models.DataBase;
using WebApi.Models.DTOs.Catalog;
using WebApi.Models.DTOs.OrderItem;
using WebApi.Services.EnumFlags;

namespace WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class OrderItemsController(ServerDbContext dbContext) : ControllerBase
{
    private readonly string statusBasket = OrdersEnum.Basket.GetDescription();
    private readonly string statusProcessing = OrdersEnum.Processing.GetDescription();
    private readonly string statusCompleted = OrdersEnum.Completed.GetDescription();
    private Logger loggerOrderItemsController = LogManager.GetCurrentClassLogger();

    [HttpGet]
    public async Task<ActionResult<IEnumerable<OrderItemsModel>>> GetOrderItemsAsync()
    {
        return await dbContext.OrderItems.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<OrderItemsModel>> GetOrderItemAsync(int id)
    {
        var orderItem = await dbContext.OrderItems.FindAsync(id);
        if (orderItem == null)
        {
            loggerOrderItemsController.Error($"Данной позиции заказа с id = {id} не существует");
            return NotFound(new
            {
                StatusCode = 404,
                Message = $"Данной позиции заказа не существует",
                Timestamp = DateTime.Now
            });
        }

        return Ok(orderItem);
    }

    [HttpPost("orderItem-data")]
    public async Task<IActionResult> GetOrderItemDataAsync([FromBody] UserRequestDto? request)
    {
        try
        {
            if (request == null)
            {
                loggerOrderItemsController.Error($"Данные не предоставлены");
                return BadRequest(new { message = $"Данные не предоставлены" });
            }

            var user = await dbContext.Users.FirstOrDefaultAsync(u => u.Login == request.LoginUser);
            if (user != null)
            {
                var order = await dbContext.Orders
                    .Where(o => o.Status == statusBasket && o.Users != null && o.Users.Login == request.LoginUser)
                    .FirstOrDefaultAsync();
                if (order != null)
                {
                    loggerOrderItemsController.Info($"Найден заказ пользователя {request.LoginUser}");
                    var orderItems = await dbContext.OrderItems
                        .Where(oi =>
                            oi.Orders != null && oi.Orders.Users != null &&
                            oi.Orders.Users.Login == request.LoginUser &&
                            oi.Orders_Id == order.Id)
                        .Select(oi => new OrderItemDataDto
                        {
                            Id = oi.Id,
                            ProductId = oi.Products.Id,
                            Quantity = oi.Quantity,
                            PriceAtMoment = oi.PriceAtMoment,
                            NameProducts = oi.Products != null ? oi.Products.Name : "Товар не найден",
                            PartNumber = oi.Products != null ? oi.Products.PartNumber : "N/A",
                            ImageProduct = oi.Products != null ? oi.Products.Image : "",
                            NameCategories = oi.Products != null && oi.Products.Categories != null
                                ? oi.Products.Categories.Name
                                : "Категория не указана",
                            NameManufacturers = oi.Products != null && oi.Products.Manufacturers != null
                                ? oi.Products.Manufacturers.Name
                                : "Бренд не указан"
                        })
                        .ToListAsync();

                    return Ok(new
                    {
                        items = orderItems,
                        totalQuantity = orderItems.Sum(i => i.Quantity),
                        totalAmount = orderItems.Sum(i => i.TotalPrice)
                    });
                }

                loggerOrderItemsController.Error($"Заказ пользователя {request.LoginUser} не найден");
                return NotFound(new { message = $"Заказ пользователя {request.LoginUser} не найден" });
            }

            loggerOrderItemsController.Error($"Пользователь {request.LoginUser} не найден в системе");
            return NotFound(new { message = $"Пользователь {request.LoginUser} не найден в системе" });
        }
        catch (Exception ex)
        {
            loggerOrderItemsController.Error($"Внутренняя ошибка сервера: {ex.Message}");
            return StatusCode(500, new { message = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }

    [HttpGet("orderItem-data/{orderId}")]
    public async Task<IActionResult> GetOrderItemDataAsync(int orderId)
    {
        try
        {
            var basketItems = await dbContext.OrderItems
                .Where(oi => oi.Orders_Id == orderId)
                .Select(oi => new OrderItemDataDto
                {
                    Id = oi.Id,
                    Quantity = oi.Quantity,
                    PriceAtMoment = oi.PriceAtMoment,
                    NameProducts = oi.Products != null ? oi.Products.Name : "Товар не найден",
                    PartNumber = oi.Products != null ? oi.Products.PartNumber : "N/A",
                    ImageProduct = oi.Products != null ? oi.Products.Image : "",
                    NameCategories = oi.Products != null && oi.Products.Categories != null
                        ? oi.Products.Categories.Name
                        : "Категория не указана",
                    NameManufacturers = oi.Products != null && oi.Products.Manufacturers != null
                        ? oi.Products.Manufacturers.Name
                        : "Бренд не указан"
                })
                .ToListAsync();

            return Ok(new
            {
                items = basketItems,
                totalQuantity = basketItems.Sum(i => i.Quantity),
                totalAmount = basketItems.Sum(i => i.TotalPrice)
            });
        }
        catch (Exception ex)
        {
            loggerOrderItemsController.Error($"Внутренняя ошибка сервера: {ex.Message}");
            return StatusCode(500, new { message = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }

    [HttpPost]
    public async Task<IActionResult> AddToOrderItemsAsync([FromBody] AddToOrderItemsDto? request)
    {
        try
        {
            if (request == null || request.Product_Id <= 0)
            {
                loggerOrderItemsController.Error($"Данные не предоставлены");
                return BadRequest(new { message = $"Данные не предоставлены" });
            }

            var product = await dbContext.Products.FindAsync(request.Product_Id);
            if (product == null)
            {
                loggerOrderItemsController.Error($"Товара с id = {request.Product_Id} не найден в системе");
                return NotFound(new { message = "Товар не найден в системе" });
            }

            var user = await dbContext.Users.FirstOrDefaultAsync(u => u.Login == request.UserLogin);
            if (user != null)
            {
                var ordersUser = await dbContext.Orders.Where(ou =>
                        ou.Users_Id == user.Id && ou.Status != statusProcessing && ou.Status != statusCompleted)
                    .ToListAsync();

                if (ordersUser.Count == 0)
                {
                    loggerOrderItemsController.Info($"Создание заказа пользователя {request.UserLogin}");
                    var order = new OrdersModel()
                    {
                        OrderDate = DateTime.Now,
                        Status = statusBasket,
                        Users_Id = user.Id,
                        NameOrder = GenerateOrderNumber()
                    };
                    dbContext.Orders.Add(order);
                    loggerOrderItemsController.Info($"Заказ успешно добавлен в БД");
                    await dbContext.SaveChangesAsync();
                    loggerOrderItemsController.Info($"Все изменения внесены в БД");
                }

                var orderId = ordersUser.Where(os => os.Status == statusBasket && os.Users_Id == user.Id)
                    .Select(os => os.Id).FirstOrDefault();

                var existOrderItem =
                    await dbContext.OrderItems.FirstOrDefaultAsync(oi =>
                        oi.Products_Id == request.Product_Id && oi.Orders_Id == orderId);
                if (existOrderItem != null)
                {
                    existOrderItem.Quantity += request.Quantity;
                    dbContext.OrderItems.Update(existOrderItem);
                    loggerOrderItemsController.Info(
                        $"Обновление количества товара с id = {request.Product_Id} в корзине");
                }
                else
                {
                    loggerOrderItemsController.Info($"Добавление товара в корзину");
                    var orderItem = new OrderItemsModel()
                    {
                        Quantity = request.Quantity,
                        PriceAtMoment = product.Price,
                        Orders_Id = orderId,
                        Products_Id = request.Product_Id
                    };
                    dbContext.OrderItems.Add(orderItem);
                    loggerOrderItemsController.Info($"Товары добавлены в корзину");
                }
            }

            await dbContext.SaveChangesAsync();
            loggerOrderItemsController.Info($"Все изменения внесены в БД");
            return Ok();
        }
        catch (DbUpdateException ex)
        {
            loggerOrderItemsController.Error($"Ошибка базы данных: {ex.Message}");
            return StatusCode(500, new { message = $"Ошибка базы данных: {ex.Message}" });
        }
        catch (Exception ex)
        {
            loggerOrderItemsController.Error($"Внутренняя ошибка сервера: {ex.Message}");
            return StatusCode(500, new { message = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }

    private string GenerateOrderNumber()
    {
        var now = DateTime.Now;
        var timestamp = now.ToString("yyyyMMdd-HHmmss");
        var random = new Random().Next(1000, 9999);

        return $"{timestamp}-{random}";
    }

    [HttpDelete("delete-product-in-order-items")]
    public async Task<IActionResult> DeleteOrderItemAsync(int orderId, int productId, int userId)
    {
        try
        {
            var orderItem = await dbContext.OrderItems.FindAsync(productId);
            if (orderItem == null)
            {
                loggerOrderItemsController.Error($"Товар с id = {productId} не найден в корзине");
                return NotFound(new { message = "Товар не найден в корзине" });
            }

            var order = await dbContext.Orders.FirstOrDefaultAsync(o =>
                o.Id == orderId && o.Users_Id == userId && o.Status == statusBasket);
            if (order == null)
            {
                loggerOrderItemsController.Error($"Корзина не найдена");
                return NotFound(new { message = "Корзина не найдена" });
            }

            dbContext.OrderItems.Remove(orderItem);
            loggerOrderItemsController.Info($"Товар с id = {productId} удален из корзины");
            await dbContext.SaveChangesAsync();
            loggerOrderItemsController.Info($"Все изменения внесены в БД");

            var remainingItems = await dbContext.OrderItems
                .AnyAsync(oi => oi.Orders_Id == orderId);
            if (!remainingItems)
            {
                loggerOrderItemsController.Info($"В корзине нет товаров..." + Environment.NewLine +
                                                $"Удаление заказа...");
                dbContext.Orders.Remove(order);
                loggerOrderItemsController.Info($"Заказ успешно удален");
                await dbContext.SaveChangesAsync();
                loggerOrderItemsController.Info($"Все изменения внесены в БД");

                var anyItems = await dbContext.OrderItems.AnyAsync();
                if (!anyItems)
                {
                    loggerOrderItemsController.Info($"Таблица корзины товаров пустая..." + Environment.NewLine +
                                                    $"Обнуление счетчика Id...");
                    await dbContext.Database.ExecuteSqlRawAsync(
                        "DBCC CHECKIDENT ('dbo.OrderItems', RESEED, 0)");
                    loggerOrderItemsController.Info($"Счетчик успешно обнулен");
                }
            }

            return Ok(new { message = "Товар успешно удален из корзины" });
        }
        catch (Exception ex)
        {
            loggerOrderItemsController.Error($"Внутренняя ошибка сервера: {ex.Message}");
            return StatusCode(500, new { message = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }

    [HttpPut("product/{id}")]
    public async Task<IActionResult> UpdateOrderItemQuantityAsync(int id,
        [FromBody] UpdateOrderItemQuantityDto? request)
    {
        try
        {
            if (request == null)
            {
                loggerOrderItemsController.Error($"Пустые данные");
                return BadRequest(new { message = "Пустые данные" });
            }

            var orderItem = await dbContext.OrderItems.FindAsync(id);
            if (orderItem == null)
            {
                loggerOrderItemsController.Error($"Товар с id = {id} в корзине не найден");
                return NotFound(new { message = "Товар в корзине не найден" });
            }

            var stock = await dbContext.Stocks
                .Where(s => s.Products_Id == orderItem.Products_Id)
                .SumAsync(s => s.Quantity);

            if (stock < request.Quantity)
            {
                loggerOrderItemsController.Warn($"Недостаточно товара на складе. Доступно: {stock} шт.");
                return BadRequest(new
                {
                    message = $"Недостаточно товара на складе. Доступно: {stock} шт."
                });
            }

            orderItem.Quantity = request.Quantity;
            loggerOrderItemsController.Info($"Обновление количества товара в заказе");
            await dbContext.SaveChangesAsync();
            loggerOrderItemsController.Info($"Все изменения внесены в БД");

            if (orderItem.Orders_Id != null)
            {
                return Ok(await GetOrderItemDataAsync(orderItem.Orders_Id.Value));
            }

            return Ok();
        }
        catch (Exception ex)
        {
            loggerOrderItemsController.Error($"Внутренняя ошибка сервера: {ex.Message}");
            return StatusCode(500, new { message = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }

    [HttpGet("get-number-order")]
    public async Task<IActionResult> GetNumberOrderAsync(int userId)
    {
        try
        {
            var order = await dbContext.Orders.FirstOrDefaultAsync(
                o => o.Users_Id == userId && o.Status == statusBasket);
            return order == null ? Ok(-1) : Ok(order.Id);
        }
        catch (Exception ex)
        {
            loggerOrderItemsController.Error($"Внутренняя ошибка сервера: {ex.Message}");
            return StatusCode(500, new { message = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }
}