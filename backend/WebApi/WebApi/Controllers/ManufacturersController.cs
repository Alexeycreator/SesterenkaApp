using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NLog;
using WebApi.Methods;
using WebApi.Models.DataBase;

namespace WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class ManufacturersController(ServerDbContext dbContext) : ControllerBase
{
    private Logger loggerManufacturersController = LogManager.GetCurrentClassLogger();

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ManufacturersModel>>> GetManufacturersAsync()
    {
        return await dbContext.Manufacturers.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ManufacturersModel>> GetManufacturerByIdAsync(int id)
    {
        var manufacturer = await dbContext.Manufacturers.FindAsync(id);
        if (manufacturer == null)
        {
            loggerManufacturersController.Error($"Данного производителя с id = {id} не существует");
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
    public async Task<IActionResult> CreateManufacturerAsync([FromBody] ManufacturersModel? request)
    {
        try
        {
            if (request == null)
            {
                loggerManufacturersController.Error($"Данные не предоставлены");
                return BadRequest(new { message = "Данные не предоставлены" });
            }

            if (string.IsNullOrEmpty(request.Name))
            {
                loggerManufacturersController.Error($"Название бренда не может быть пустым");
                return BadRequest(new { message = "Название бренда не может быть пустым" });
            }

            var existingManufacturer = await dbContext.Manufacturers
                .FirstOrDefaultAsync(m => m.Name == request.Name);
            if (existingManufacturer != null)
            {
                loggerManufacturersController.Error($"Бренд с таким названием ({request.Name}) уже существует");
                return Conflict(new { message = $"Бренд с таким названием ({request.Name}) уже существует" });
            }

            var newManufacturer = new ManufacturersModel
            {
                Name = request.Name
            };

            await dbContext.Manufacturers.AddAsync(newManufacturer);
            loggerManufacturersController.Info($"Бренд {request.Name} успешно создан");
            await dbContext.SaveChangesAsync();
            loggerManufacturersController.Info($"Все изменения внесены в БД");

            return Ok(new { message = $"Бренд {request.Name} успешно создан" });
        }
        catch (Exception ex)
        {
            loggerManufacturersController.Error($"Внутренняя ошибка сервера: {ex.Message}");
            return StatusCode(500, new { message = "Внутренняя ошибка сервера: ", error = ex.Message });
        }
    }

    [HttpPut("update-manufacturer")]
    public async Task<IActionResult> UpdateManufacturerAsync(int manufacturerId, [FromBody] ManufacturersModel request)
    {
        try
        {
            var manufacturers = await dbContext.Manufacturers.FindAsync(manufacturerId);
            if (manufacturers == null)
            {
                loggerManufacturersController.Error($"Бренд: {request.Name} не найден");
                return NotFound(new { message = $"Бренд: {request.Name} не найден" });
            }

            if (string.IsNullOrEmpty(request.Name))
            {
                loggerManufacturersController.Error($"Название бренда не может быть пустым");
                return BadRequest(new { message = "Название бренда не может быть пустым" });
            }

            manufacturers.Name = request.Name;
            loggerManufacturersController.Info($"Бренд: {request.Name} успешно обновлен");
            await dbContext.SaveChangesAsync();
            loggerManufacturersController.Info($"Все изменения внесены в БД");

            return Ok(new { message = $"Бренд: {request.Name} успешно обновлен" });
        }
        catch (Exception ex)
        {
            loggerManufacturersController.Error($"Внутренняя ошибка сервера: {ex.Message}");
            return StatusCode(500, new { message = "Внутренняя ошибка сервера: ", error = ex.Message });
        }
    }

    [HttpDelete("delete-manufacturer")]
    public async Task<IActionResult> DeleteManufacturerAsync(int manufacturerId)
    {
        try
        {
            var manufacturer = await dbContext.Manufacturers.FindAsync(manufacturerId);
            if (manufacturer == null)
            {
                loggerManufacturersController.Error($"Бренд с id = {manufacturerId} не найден");
                return NotFound(new { message = "Бренд не найден" });
            }

            dbContext.Manufacturers.Remove(manufacturer);
            loggerManufacturersController.Info($"Бренд с id = {manufacturerId} успешно удален");
            await dbContext.SaveChangesAsync();
            loggerManufacturersController.Info($"Все изменения внесены в БД");

            return Ok(new { message = "Бренд успешно удален" });
        }
        catch (Exception ex)
        {
            loggerManufacturersController.Error($"Внутренняя ошибка сервера: {ex.Message}");
            return StatusCode(500, new { message = "Внутренняя ошибка сервера: ", error = ex.Message });
        }
    }
}