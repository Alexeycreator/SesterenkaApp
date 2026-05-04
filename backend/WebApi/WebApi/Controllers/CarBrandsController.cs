using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApi.Methods;
using WebApi.Models.DataBase;

namespace WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class CarBrandsController(ServerDbContext dbContext) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<CarBrandsModel>>> GetCarBrands()
    {
        return await dbContext.CarBrands.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CarBrandsModel>> GetCarBrand(int id)
    {
        var carBrand = await dbContext.CarBrands.FindAsync(id);
        if (carBrand == null)
        {
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