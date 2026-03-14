using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApi.Methods;
using WebApi.Models.DataBase;

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
}