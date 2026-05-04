using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApi.Methods;
using WebApi.Models.DataBase;

namespace WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class CarModelsController(ServerDbContext dbContext) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<CarModelsModel>>> GetCarModelsAsync()
    {
        return await dbContext.CarModels.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CarModelsModel>> GetCarModelByIdAsync(int id)
    {
        var carModel = await dbContext.CarModels.FindAsync(id);
        if (carModel == null)
        {
            return NotFound(new
            {
                StatusCode = 404,
                Message = $"Данной модели машины не существует",
                Timestamp = DateTime.UtcNow
            });
        }

        return Ok(carModel);
    }
}