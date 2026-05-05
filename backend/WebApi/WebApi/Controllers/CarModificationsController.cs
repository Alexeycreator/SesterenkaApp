using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NLog;
using WebApi.Methods;
using WebApi.Models.DataBase;

namespace WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class CarModificationsController(ServerDbContext dbContext) : ControllerBase
{
    private Logger loggerCarModificationsController = LogManager.GetCurrentClassLogger();

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
            loggerCarModificationsController.Error($"Данной модификации машины с id = {id} не существует");
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