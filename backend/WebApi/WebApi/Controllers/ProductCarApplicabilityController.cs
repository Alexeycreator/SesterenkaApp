using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NLog;
using WebApi.Methods;
using WebApi.Models.DataBase;

namespace WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class ProductCarApplicabilityController(ServerDbContext dbContext) : ControllerBase
{
    private Logger loggerProductCarApplicabilityController = LogManager.GetCurrentClassLogger();

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProductCarApplicabilityModel>>> GetProductCarApplicabilitysAsync()
    {
        return await dbContext.ProductCarApplicability.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ProductCarApplicabilityModel>> GetProductCarApplicabilityByIdAsync(int id)
    {
        var productCarApplicability = await dbContext.ProductCarApplicability.FindAsync(id);
        if (productCarApplicability == null)
        {
            loggerProductCarApplicabilityController.Error(
                $"Данной связи между товаром и характеристиками авто не существует");
            return NotFound(new
            {
                StatusCode = 404,
                Message = $"Данной связи между товаром и характеристиками авто не существует",
                Timestamp = DateTime.Now
            });
        }

        return Ok(productCarApplicability);
    }
}