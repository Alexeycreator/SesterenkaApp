using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApi.Methods;
using WebApi.Models.DataBase;

namespace WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class ProductCarApplicabilityController(ServerDbContext dbContext) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProductCarApplicabilityModel>>> GetProductCarApplicabilitys()
    {
        return await dbContext.ProductCarApplicability.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ProductCarApplicabilityModel>> GetProductCarApplicability(int id)
    {
        var productCarApplicability = await dbContext.ProductCarApplicability.FindAsync(id);
        if (productCarApplicability == null)
        {
            return NotFound(new
            {
                StatusCode = 404,
                Message = $"Данной связи между товаром и характеристиками авто не существует",
                Timestamp = DateTime.UtcNow
            });
        }

        return Ok(productCarApplicability);
    }
}