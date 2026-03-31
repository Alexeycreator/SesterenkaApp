using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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
            return NotFound(new
            {
                StatusCode = 404,
                Message = $"Данной позиции заказа не существует",
                Timestamp = DateTime.UtcNow
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
                return NotFound();
            }
            var user = await dbContext.Users.FirstOrDefaultAsync(u => u.Login == request.LoginUser);
            if (user != null)
            {
                var order = await dbContext.Orders
                    .Where(o => o.Status == statusBasket && o.Users != null && o.Users.Login == request.LoginUser)
                    .FirstOrDefaultAsync();
                if (order != null)
                {
                    var orderItems = await dbContext.OrderItems
                        .Where(oi =>
                            oi.Orders != null && oi.Orders.Users != null && oi.Orders.Users.Login == request.LoginUser &&
                            oi.Orders_Id == order.Id)
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
                        items = orderItems,
                        totalQuantity = orderItems.Sum(i => i.Quantity),
                        totalAmount = orderItems.Sum(i => i.TotalPrice)
                    });
                }
                else
                {
                    return NotFound();
                }
            }
            else
            {
                return NotFound();
            }
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }

    [HttpGet("orderItem-data/{orderId}")]
    public async Task<IActionResult> GetOrderItemDataAsync(int orderId)
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

    [HttpPost]
    public async Task<IActionResult> AddToOrderItemsAsync([FromBody] AddToOrderItemsDto? request)
    {
        try
        {
            if (request == null || request.Product_Id <= 0)
            {
                return BadRequest();
            }

            var product = await dbContext.Products.FindAsync(request.Product_Id);
            if (product == null)
            {
                return NotFound();
            }

            var user = await dbContext.Users.FirstOrDefaultAsync(u => u.Login == request.UserLogin);
            if (user != null)
            {
                var ordersUser = await dbContext.Orders.Where(ou =>
                        ou.Users_Id == user.Id && ou.Status != statusProcessing && ou.Status != statusCompleted)
                    .ToListAsync();

                if (ordersUser.Count == 0)
                {
                    var order = new OrdersModel()
                    {
                        OrderDate = DateTime.Now,
                        Status = statusBasket,
                        Users_Id = user.Id
                    };
                    dbContext.Orders.Add(order);
                    await dbContext.SaveChangesAsync();
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
                }
                else
                {
                    var orderItem = new OrderItemsModel()
                    {
                        Quantity = request.Quantity,
                        PriceAtMoment = product.Price,
                        Orders_Id = orderId,
                        Products_Id = request.Product_Id
                    };
                    dbContext.OrderItems.Add(orderItem);
                }
            }

            await dbContext.SaveChangesAsync();
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

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteOrderItemAsync(int id)
    {
        var orderItem = await dbContext.OrderItems.FirstOrDefaultAsync(o => o.Products_Id == id);
        if (orderItem == null)
        {
            return NotFound();
        }

        dbContext.OrderItems.Remove(orderItem);
        await dbContext.SaveChangesAsync();
        var anyItems = await dbContext.OrderItems.AnyAsync();
        if (!anyItems)
        {
            await dbContext.Database.ExecuteSqlRawAsync(
                "DBCC CHECKIDENT ('dbo.OrderItems', RESEED, 0)");
        }

        return Ok();
    }

    [HttpPut("product/{id}")]
    public async Task<IActionResult> UpdateOrderItemQuantityAsync(int id,
        [FromBody] UpdateOrderItemQuantityDto? request)
    {
        try
        {
            if (request == null)
            {
                return BadRequest(new { message = "Некорректные данные" });
            }

            var orderItem = await dbContext.OrderItems.FindAsync(id);
            if (orderItem == null)
            {
                return NotFound(new { message = "Товар в корзине не найден" });
            }

            var stock = await dbContext.Stocks
                .Where(s => s.Products_Id == orderItem.Products_Id)
                .SumAsync(s => s.Quantity);

            if (stock < request.Quantity)
            {
                return BadRequest(new
                {
                    message = $"Недостаточно товара на складе. Доступно: {stock} шт."
                });
            }

            orderItem.Quantity = request.Quantity;
            await dbContext.SaveChangesAsync();

            if (orderItem.Orders_Id != null)
            {
                return Ok(await GetOrderItemDataAsync(orderItem.Orders_Id.Value));
            }

            return Ok();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Ошибка при обновлении", error = ex.Message });
        }
    }
}