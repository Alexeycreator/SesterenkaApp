using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NLog;
using WebApi.Methods;
using WebApi.Models.DataBase;

namespace WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class WarehousesController(ServerDbContext dbContext) : ControllerBase
{
    private Logger loggerWarehousesController = LogManager.GetCurrentClassLogger();

    [HttpGet]
    public async Task<ActionResult<IEnumerable<WarehousesModel>>> GetWarehousesAsync()
    {
        return await dbContext.Warehouses.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<WarehousesModel>> GetWarehousesByIdAsync(int id)
    {
        var warehouse = await dbContext.Warehouses.FindAsync(id);
        if (warehouse == null)
        {
            loggerWarehousesController.Error($"Данного склада с id = {id} не существует");
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