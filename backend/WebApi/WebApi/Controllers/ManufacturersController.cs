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

    [HttpPost("create-manufacturer")]
    public async Task<IActionResult> CreateManufacturer([FromBody] ManufacturersModel? request)
    {
        try
        {
            if (request == null)
            {
                return BadRequest(new { message = "Данные не предоставлены" });
            }

            if (string.IsNullOrEmpty(request.Name))
            {
                return BadRequest(new { message = "Название бренда не может быть пустым" });
            }

            var existingManufacturer = await dbContext.Manufacturers
                .FirstOrDefaultAsync(m => m.Name == request.Name);
            if (existingManufacturer != null)
            {
                return Conflict(new { message = "Бренд с таким названием уже существует" });
            }

            var newManufacturer = new ManufacturersModel
            {
                Name = request.Name
            };

            await dbContext.Manufacturers.AddAsync(newManufacturer);
            await dbContext.SaveChangesAsync();
            
            return Ok(new { message = "Бренд успешно создан" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Ошибка при обновлении", error = ex.Message });
        }
    }

    [HttpPut("update-manufacturer")]
    public async Task<IActionResult> UpdateManufacturer(int manufacturerId, [FromBody] ManufacturersModel request)
    {
        try
        {
            var manufacturers = await dbContext.Manufacturers.FindAsync(manufacturerId);
            if (manufacturers == null)
            {
                return NotFound(new { message = "Бренд не найден" });
            }

            if (string.IsNullOrEmpty(request.Name))
            {
                return BadRequest(new { message = "Название бренда не может быть пустым" });
            }

            manufacturers.Name = request.Name;
            await dbContext.SaveChangesAsync();
            return Ok(new { message = "Бренд успешно обновлен" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Ошибка при обновлении", error = ex.Message });
        }
    }

    [HttpDelete("delete-manufacturer")]
    public async Task<IActionResult> DeleteManufacturer(int manufacturerId)
    {
        try
        {
            var manufacturer = await dbContext.Manufacturers.FindAsync(manufacturerId);
            if (manufacturer == null)
            {
                return NotFound(new { message = "Бренд не найден" });
            }

            dbContext.Manufacturers.Remove(manufacturer);
            await dbContext.SaveChangesAsync();
            return Ok(new { message = "Бренд успешно удален" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Ошибка при обновлении", error = ex.Message });
        }
    }
}