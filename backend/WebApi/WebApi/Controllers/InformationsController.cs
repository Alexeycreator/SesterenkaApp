using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApi.Methods;
using WebApi.Models.DataBase;

namespace WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class InformationsController(ServerDbContext dbContext) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<InformationsModel>>> GetInformations()
    {
        return await dbContext.Informations.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<InformationsModel>> GetInformation(int id)
    {
        var information = await dbContext.Informations.FindAsync(id);
        if (information == null)
        {
            return NotFound(new
            {
                StatusCode = 404,
                Message = $"Данной информации не существует",
                Timestamp = DateTime.UtcNow
            });
        }

        return Ok(information);
    }
}