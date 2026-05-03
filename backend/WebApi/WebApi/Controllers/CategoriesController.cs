using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApi.Methods;
using WebApi.Models.DataBase;

namespace WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class CategoriesController(ServerDbContext dbContext) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<CategoriesModel>>> GetCategories()
    {
        return await dbContext.Categories.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CategoriesModel>> GetCategorie(int id)
    {
        var categorie = await dbContext.Categories.FindAsync(id);
        if (categorie == null)
        {
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
    public async Task<IActionResult> CreateCategories([FromBody] CategoriesModel? request)
    {
        try
        {
            if (request == null)
            {
                return BadRequest(new
                    { message = "Данные не предоставлены" });
            }

            if (string.IsNullOrEmpty(request.Name) || string.IsNullOrEmpty(request.Description) ||
                string.IsNullOrEmpty(request.Icon))
            {
                return BadRequest(new
                    { message = "Название, описание и изображение категории обязательны для заполнения" });
            }

            var existingCategories = await dbContext.Categories.FirstOrDefaultAsync(c => c.Name == request.Name);
            if (existingCategories != null)
            {
                return Conflict(new { message = "Категория с таким названием уже существует" });
            }

            var newCategories = new CategoriesModel()
            {
                Name = request.Name,
                Icon = request.Icon,
                Description = request.Description
            };
            await dbContext.Categories.AddAsync(newCategories);
            await dbContext.SaveChangesAsync();

            return Ok(new { message = "Категория успешно создана" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Ошибка при обновлении", error = ex.Message });
        }
    }

    [HttpPut("update-category")]
    public async Task<IActionResult> UpdateCategories(int categoryId, [FromBody] CategoriesModel request)
    {
        try
        {
            var categories = await dbContext.Categories.FindAsync(categoryId);
            if (categories == null)
            {
                return NotFound(new { message = "Категория не найдена" });
            }

            if (string.IsNullOrEmpty(request.Name) || string.IsNullOrEmpty(request.Description) ||
                string.IsNullOrEmpty(request.Icon))
            {
                return BadRequest(new
                    { message = "Название, описание и изображение категории обязательны для заполнения" });
            }

            categories.Name = request.Name;
            categories.Icon = request.Icon;
            categories.Description = request.Description;
            await dbContext.SaveChangesAsync();

            return Ok(new { message = "Категория успешно обновлена" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Ошибка при обновлении", error = ex.Message });
        }
    }

    [HttpDelete("delete-category")]
    public async Task<IActionResult> DeleteCategories(int categoryId)
    {
        try
        {
            var categories = await dbContext.Categories.FindAsync(categoryId);
            if (categories == null)
            {
                return NotFound(new { message = "Категория не найдена" });
            }

            dbContext.Categories.Remove(categories);
            await dbContext.SaveChangesAsync();

            return Ok(new { message = "Категория успешно удалена" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Ошибка при обновлении", error = ex.Message });
        }
    }
}