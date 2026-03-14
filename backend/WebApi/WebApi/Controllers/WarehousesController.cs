using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApi.Methods;
using WebApi.Models.DataBase;

namespace WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class WarehousesController(ServerDbContext dbContext) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<WarehousesModel>>> GetWarehouses()
    {
        return await dbContext.Warehouses.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<WarehousesModel>> GetWarehouse(int id)
    {
        var warehouse = await dbContext.Warehouses.FindAsync(id);
        if (warehouse == null)
        {
            return NotFound(new
            {
                StatusCode = 404,
                Message = $"Данного склада не существует",
                Timestamp = DateTime.UtcNow
            });
        }

        return Ok(warehouse);
    }
}