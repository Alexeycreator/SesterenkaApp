using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApi.Methods;
using WebApi.Models.DataBase;

namespace WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class ManufacturersController(ServerDbContext dbContext) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ManufacturersModel>>> GetManufacturers()
    {
        return await dbContext.Manufacturers.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ManufacturersModel>> GetManufacturer(int id)
    {
        var manufacturer = await dbContext.Manufacturers.FindAsync(id);
        if (manufacturer == null)
        {
            return NotFound(new
            {
                StatusCode = 404,
                Message = $"Данного производителя не существует",
                Timestamp = DateTime.UtcNow
            });
        }

        return Ok(manufacturer);
    }
}