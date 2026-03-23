using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApi.Methods;
using WebApi.Models.DataBase;
using WebApi.Models.DTOs.Basket;
using WebApi.Models.DTOs.Product;

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
    
    [HttpGet("basket-data")]
    public async Task<IActionResult> GetBasketData()
    {
        var basketItems = await dbContext.OrderItems
            .Select(oi => new BasketDataDto
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
    
    [HttpGet("basket-data/{orderId}")]
    public async Task<IActionResult> GetBasketData(int orderId)
    {
        var basketItems = await dbContext.OrderItems
            .Where(oi => oi.Orders_Id == orderId)
            .Select(oi => new BasketDataDto
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
}