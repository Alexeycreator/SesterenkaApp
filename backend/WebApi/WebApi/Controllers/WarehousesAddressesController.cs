using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApi.Methods;
using WebApi.Models.DataBase;

namespace WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class WarehousesAddressesController (ServerDbContext dbContext) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<WarehousesAddressesModel>>> GetWarehousesAddresses()
    {
        return await dbContext.WarehousesAddresses.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ManufacturersModel>> GetWarehousesAddress(int id)
    {
        var warehousesAddress = await dbContext.WarehousesAddresses.FindAsync(id);
        if (warehousesAddress == null)
        {
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