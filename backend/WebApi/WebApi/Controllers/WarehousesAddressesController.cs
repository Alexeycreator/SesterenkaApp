using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NLog;
using WebApi.Methods;
using WebApi.Models.DataBase;

namespace WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class WarehousesAddressesController(ServerDbContext dbContext) : ControllerBase
{
    private Logger loggerWarehousesAddressesController = LogManager.GetCurrentClassLogger();

    [HttpGet]
    public async Task<ActionResult<IEnumerable<WarehousesAddressesModel>>> GetWarehousesAddressesAsync()
    {
        return await dbContext.WarehousesAddresses.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ManufacturersModel>> GetWarehousesAddressByIdAsync(int id)
    {
        var warehousesAddress = await dbContext.WarehousesAddresses.FindAsync(id);
        if (warehousesAddress == null)
        {
            loggerWarehousesAddressesController.Error($"Данного производителя с id = {id} не существует");
            return NotFound(new
            {
                StatusCode = 404,
                Message = $"Данного производителя не существует",
                Timestamp = DateTime.UtcNow
            });
        }

        return Ok(warehousesAddress);
    }
}