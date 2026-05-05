using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NLog;
using WebApi.Methods;
using WebApi.Models.DataBase;

namespace WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class CarBrandsController(ServerDbContext dbContext) : ControllerBase
{
    private Logger loggerCarBrandsController = LogManager.GetCurrentClassLogger();

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CarBrandsModel>>> GetCarBrandsAsync()
    {
        return await dbContext.CarBrands.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CarBrandsModel>> GetCarBrandByIdAsync(int id)
    {
        var carBrand = await dbContext.CarBrands.FindAsync(id);
        if (carBrand == null)
        {
            loggerCarBrandsController.Error($"Данного брэнда машины с id = {id} не существует");
            return NotFound(new
            {
                StatusCode = 404,
                Message = $"Данного брэнда машины не существует",
                Timestamp = DateTime.UtcNow
            });
        }

        return Ok(carBrand);
    }
}