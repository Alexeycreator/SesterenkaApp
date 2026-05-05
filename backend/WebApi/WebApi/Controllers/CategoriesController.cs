using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NLog;
using WebApi.Methods;
using WebApi.Models.DataBase;

namespace WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class CategoriesController(ServerDbContext dbContext) : ControllerBase
{
    private Logger loggerCategoriesController = LogManager.GetCurrentClassLogger();

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CategoriesModel>>> GetCategoriesAsync()
    {
        return await dbContext.Categories.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CategoriesModel>> GetCategoriesByIdAsync(int id)
    {
        var categorie = await dbContext.Categories.FindAsync(id);
        if (categorie == null)
        {
            loggerCategoriesController.Error($"Данной категории с id = {id} не существует");
            return NotFound(new
            {
                StatusCode = 404,
                Message = $"Данной категории не существует",
                Timestamp = DateTime.UtcNow
            });
        }

        return Ok(categorie);
    }

    [HttpPost("create-category")]
    public async Task<IActionResult> CreateCategoriesAsync([FromBody] CategoriesModel? request)
    {
        try
        {
            if (request == null)
            {
                loggerCategoriesController.Error($"Данные не предоставлены");
                return BadRequest(new
                    { message = "Данные не предоставлены" });
            }

            if (string.IsNullOrEmpty(request.Name) || string.IsNullOrEmpty(request.Description) ||
                string.IsNullOrEmpty(request.Icon))
            {
                loggerCategoriesController.Error(
                    $"Название, описание и изображение категории обязательны для заполнения");
                return BadRequest(new
                    { message = "Название, описание и изображение категории обязательны для заполнения" });
            }

            var existingCategories = await dbContext.Categories.FirstOrDefaultAsync(c => c.Name == request.Name);
            if (existingCategories != null)
            {
                loggerCategoriesController.Error($"Категория с таким названием уже существует");
                return Conflict(new { message = "Категория с таким названием уже существует" });
            }

            var newCategories = new CategoriesModel()
            {
                Name = request.Name,
                Icon = request.Icon,
                Description = request.Description
            };
            await dbContext.Categories.AddAsync(newCategories);
            loggerCategoriesController.Info($"Категория {request.Name} успешно создана");
            await dbContext.SaveChangesAsync();
            loggerCategoriesController.Info($"Все изменения внесены в БД");

            return Ok(new { message = $"Категория {request.Name} успешно создана" });
        }
        catch (Exception ex)
        {
            loggerCategoriesController.Error($"Внутренняя ошибка сервера: {ex.Message}");
            return StatusCode(500, new { message = "Внутренняя ошибка сервера: ", error = ex.Message });
        }
    }

    [HttpPut("update-category")]
    public async Task<IActionResult> UpdateCategoriesAsync(int categoryId, [FromBody] CategoriesModel request)
    {
        try
        {
            var categories = await dbContext.Categories.FindAsync(categoryId);
            if (categories == null)
            {
                loggerCategoriesController.Error($"Категория с id = {categoryId} не найдена");
                return NotFound(new { message = "Категория не найдена" });
            }

            if (string.IsNullOrEmpty(request.Name) || string.IsNullOrEmpty(request.Description) ||
                string.IsNullOrEmpty(request.Icon))
            {
                loggerCategoriesController.Error(
                    $"Название, описание и изображение категории обязательны для заполнения");
                return BadRequest(new
                    { message = "Название, описание и изображение категории обязательны для заполнения" });
            }

            categories.Name = request.Name;
            loggerCategoriesController.Info($"Название категории обновлено");
            categories.Icon = request.Icon;
            loggerCategoriesController.Info($"Изображение категории обновлено");
            categories.Description = request.Description;
            loggerCategoriesController.Info($"Описание категории обновлено");
            await dbContext.SaveChangesAsync();
            loggerCategoriesController.Info($"Все изменения внесены в БД");

            return Ok(new { message = $"Категория {request.Name} успешно обновлена" });
        }
        catch (Exception ex)
        {
            loggerCategoriesController.Error($"Внутренняя ошибка сервера: {ex.Message}");
            return StatusCode(500, new { message = "Внутренняя ошибка сервера: ", error = ex.Message });
        }
    }

    [HttpDelete("delete-category")]
    public async Task<IActionResult> DeleteCategoriesAsync(int categoryId)
    {
        try
        {
            var categories = await dbContext.Categories.FindAsync(categoryId);
            if (categories == null)
            {
                loggerCategoriesController.Error($"Категория с id = {categoryId} не найдена");
                return NotFound(new { message = "Категория не найдена" });
            }

            dbContext.Categories.Remove(categories);
            loggerCategoriesController.Info($"Категория с id = {categoryId} успешно удалена");
            await dbContext.SaveChangesAsync();
            loggerCategoriesController.Info($"Все изменения внесены в БД");

            return Ok(new { message = "Категория успешно удалена" });
        }
        catch (Exception ex)
        {
            loggerCategoriesController.Error($"Внутренняя ошибка сервера: {ex.Message}");
            return StatusCode(500, new { message = "Внутренняя ошибка сервера: ", error = ex.Message });
        }
    }
}