using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApi.Methods;
using WebApi.Models.DataBase;
using WebApi.Models.DTOs.Catalog;
using WebApi.Models.DTOs.OrderItem;

namespace WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class OrderItemsController(ServerDbContext dbContext) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<OrderItemsModel>>> GetOrderItems()
    {
        return await dbContext.OrderItems.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<OrderItemsModel>> GetOrderItem(int id)
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

    [HttpGet("orderItem-data")]
    public async Task<IActionResult> GetOrderItemData()
    {
        var basketItems = await dbContext.OrderItems
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

    [HttpGet("orderItem-data/{orderId}")]
    public async Task<IActionResult> GetOrderItemData(int orderId)
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
    public async Task<IActionResult> AddToOrderItems([FromBody] AddToOrderItemsDto? request)
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

            var existOrderItem =
                await dbContext.OrderItems.FirstOrDefaultAsync(oi => oi.Products_Id == request.Product_Id);
            if (existOrderItem != null)
            {
                existOrderItem.Quantity += request.Quantity;
                dbContext.OrderItems.Update(existOrderItem);
            }
            else
            {
                var orderItem = new OrderItemsModel
                {
                    Quantity = request.Quantity,
                    PriceAtMoment = product.Price,
                    //Orders_Id = cart.Id,
                    Products_Id = request.Product_Id
                };
                dbContext.OrderItems.Add(orderItem);
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
    public async Task<IActionResult> DeleteOrderItem(int id)
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
    public async Task<IActionResult> UpdateOrderItemQuantity(int id, [FromBody] UpdateOrderItemQuantityDto? request)
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
                return Ok(await GetOrderItemData(orderItem.Orders_Id.Value));
            }

            return Ok();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Ошибка при обновлении", error = ex.Message });
        }
    }
}