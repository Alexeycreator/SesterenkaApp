using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApi.Methods;
using WebApi.Models.DataBase;

namespace WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class AddressesController(ServerDbContext dbContext) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<AddressesModel>>> GetAddresses()
    {
        return await dbContext.Addresses.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<AddressesModel>> GetAddress(int id)
    {
        var address = await dbContext.Addresses.FindAsync(id);
        if (address == null)
        {
            return NotFound(new
            {
                StatusCode = 404,
                Message = $"Данного адреса не существует",
                Timestamp = DateTime.UtcNow
            });
        }

        return Ok(address);
    }

    [HttpPost]
    public async Task<ActionResult<AddressesModel>> CreateAddress(AddressesModel address)
    {
        var errorMessage = new List<string>();
        if (string.IsNullOrWhiteSpace(address.Region))
        {
            errorMessage.Add($"Регион обязателен для заполнения");
        }

        if (string.IsNullOrWhiteSpace(address.City))
        {
            errorMessage.Add($"Город обязателен для заполнения");
        }

        if (string.IsNullOrWhiteSpace(address.Street))
        {
            errorMessage.Add($"Улица обязательна для заполнения");
        }

        if (string.IsNullOrWhiteSpace(address.House))
        {
            errorMessage.Add($"Номер дома обязателен для заполнения");
        }

        if (errorMessage.Any())
        {
            return BadRequest(new
            {
                StatusCode = 400,
                Message = "Ошибка валидации",
                Errors = errorMessage,
                Timestamp = DateTime.UtcNow,
            });
        }

        var existsFullAddress = await dbContext.Addresses.AnyAsync(a =>
            a.Region == address.Region && a.City == address.City && a.Street == address.Street &&
            a.House == address.House);

        if (existsFullAddress)
        {
            return Conflict(new
            {
                StatusCode = 409,
                Message = "Такой адрес уже существует!",
                ExistingClient = new
                {
                    address.Region,
                    address.City,
                    address.Street,
                    address.House
                },
                Timestamp = DateTime.UtcNow
            });
        }

        dbContext.Addresses.Add(address);
        await dbContext.SaveChangesAsync();

        return CreatedAtAction(nameof(GetAddresses), new { id = address.Id }, address);
    }
    
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateAddress(int id, AddressesModel address)
    {
        var existsAddress = await dbContext.Addresses.FindAsync(id);
        if (existsAddress == null)
        {
            return NotFound(new
            {
                StatusCode = 404,
                Error = "NotFound",
                Message = $"Адреса не существует!",
                Timestamp = DateTime.UtcNow,
            });
        }

        dbContext.Entry(address).State = EntityState.Modified;
        await dbContext.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteAddress(int id)
    {
        var address = await dbContext.Addresses.FirstOrDefaultAsync(a => a.Id == id);
        if (address == null)
        {
            return NotFound(new
            {
                StatusCode = 404,
                Error = "NotFound",
                Message = $"Такого адреса не существует!",
                Timestamp = DateTime.UtcNow,
            });
        }

        dbContext.Addresses.Remove(address);
        await dbContext.SaveChangesAsync();

        return Ok(new
        {
            StatusCode = 200,
            Message = "Адрес успешно удален",
            DeletedId = id,
            Timestamp = DateTime.UtcNow
        });
    }
}