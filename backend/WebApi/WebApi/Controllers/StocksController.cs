using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApi.Methods;
using WebApi.Models.DataBase;

namespace WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class StocksController(ServerDbContext dbContext) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<StocksModel>>> GetStocks()
    {
        return await dbContext.Stocks.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<StocksModel>> GetStock(int id)
    {
        var stock = await dbContext.Stocks.FindAsync(id);
        if (stock == null)
        {
            return NotFound(new
            {
                StatusCode = 404,
                Message = $"Данного производителя не существует",
                Timestamp = DateTime.UtcNow
            });
        }

        return Ok(stock);
    }
}