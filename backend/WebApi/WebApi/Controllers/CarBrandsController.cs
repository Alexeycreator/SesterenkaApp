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

    [HttpPost]
    public async Task<ActionResult<CarBrandsModel>> CreateCarBrand(CarBrandsModel carBrand)
    {
        var errorMessage = new List<string>();
        if (string.IsNullOrWhiteSpace(carBrand.Name))
        {
            errorMessage.Add($"Название брэнда автомобиля обязательно для заполнения");
        }

        var existsCarBrand = await dbContext.CarBrands.AnyAsync(cb => cb.Name == carBrand.Name);

        if (existsCarBrand)
        {
            return Conflict(new
            {
                StatusCode = 409,
                Message = "Такой брэнд автомобиля уже существует!",
                ExistingClient = new
                {
                    carBrand.Name
                },
                Timestamp = DateTime.UtcNow
            });
        }

        dbContext.CarBrands.Add(carBrand);
        await dbContext.SaveChangesAsync();

        return CreatedAtAction(nameof(GetCarBrands), new { id = carBrand.Id }, carBrand);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCarBrand(int id, CarBrandsModel carBrand)
    {
        var existsCarBrand = await dbContext.CarBrands.FindAsync(id);
        if (existsCarBrand == null)
        {
            return NotFound(new
            {
                StatusCode = 404,
                Error = "NotFound",
                Message = $"Брэнда автомобиля не существует!",
                Timestamp = DateTime.UtcNow,
            });
        }

        dbContext.Entry(carBrand).State = EntityState.Modified;
        await dbContext.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCarBrand(int id)
    {
        var carBrand = await dbContext.CarBrands.FirstOrDefaultAsync(cb => cb.Id == id);
        if (carBrand == null)
        {
            return NotFound(new
            {
                StatusCode = 404,
                Error = "NotFound",
                Message = $"Такого брэнда автомобиля не существует!",
                Timestamp = DateTime.UtcNow,
            });
        }

        dbContext.CarBrands.Remove(carBrand);
        await dbContext.SaveChangesAsync();

        return Ok(new
        {
            StatusCode = 200,
            Message = "Брэнд автомобиля успешно удален",
            DeletedId = id,
            Timestamp = DateTime.UtcNow
        });
    }
}