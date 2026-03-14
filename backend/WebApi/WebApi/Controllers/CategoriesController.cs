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
}