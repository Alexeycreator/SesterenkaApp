using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApi.Methods;
using WebApi.Models.DataBase;

namespace WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class CarModificationsController(ServerDbContext dbContext) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<CarModificationsModel>>> GetCarModificationsAsync()
    {
        return await dbContext.CarModifications.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CarModificationsModel>> GetCarModificationByIdAsync(int id)
    {
        var carModification = await dbContext.CarModifications.FindAsync(id);
        if (carModification == null)
        {
            return NotFound(new
            {
                StatusCode = 404,
                Message = $"Данной модификации машины не существует",
                Timestamp = DateTime.UtcNow
            });
        }

        return Ok(carModification);
    }
}