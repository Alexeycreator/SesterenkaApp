using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NLog;
using WebApi.Methods;
using WebApi.Models.DataBase;
using WebApi.Models.DTOs.Order;

namespace WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class AddressesController(ServerDbContext dbContext) : ControllerBase
{
    private List<AddressesOrderDataDto> addressShop = new List<AddressesOrderDataDto>();
    private Logger loggerAddressesController = LogManager.GetCurrentClassLogger();

    [HttpGet]
    public async Task<ActionResult<IEnumerable<AddressesModel>>> GetAddressesAsync()
    {
        return await dbContext.Addresses.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<AddressesModel>> GetAddressByIdAsync(int id)
    {
        var address = await dbContext.Addresses.FindAsync(id);
        if (address == null)
        {
            loggerAddressesController.Error($"Адреса с {id} не существует");
            return NotFound(new { message = $"Данного адреса не существует" });
        }

        return Ok(address);
    }

    [HttpGet("shop-address")]
    public async Task<IActionResult> GetAddressShopAsync()
    {
        try
        {
            var addresses = await dbContext.Addresses.ToListAsync();
            if (addresses.Count > 0)
            {
                foreach (var address in addresses.Where(address => address.IsShop))
                {
                    addressShop.Add(new AddressesOrderDataDto()
                    {
                        Id = address.Id,
                        City = address.City,
                        Street = address.Street,
                        House = address.House
                    });
                }

                loggerAddressesController.Info($"Данные об адресах магазинов успешно добавлены");

                return Ok(addressShop);
            }

            loggerAddressesController.Error($"Список магазинов пуст");
            return NotFound(new { message = $"Список магазинов пуст" });
        }
        catch (Exception ex)
        {
            loggerAddressesController.Error($"Внутренняя ошибка сервера: {ex.Message}");
            return StatusCode(500, new { message = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }

    [HttpPost("create-address")]
    public async Task<ActionResult<AddressesModel>> CreateAddressAsync([FromBody] AddressesModel address,
        [FromQuery] int userId)
    {
        try
        {
            var errorMessage = new List<string>();
            var user = await dbContext.Users.FindAsync(userId);
            if (user != null)
            {
                if (user.Role == "admin" || user.Role == "employee")
                {
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

                    if (errorMessage.Any())
                    {
                        loggerAddressesController.Error($"Ошибка валидации: {errorMessage}");
                        return BadRequest(new
                        {
                            StatusCode = 400,
                            Message = "Ошибка валидации",
                            Errors = errorMessage,
                            Timestamp = DateTime.Now,
                        });
                    }

                    var existsFullAddress = await dbContext.Addresses.AnyAsync(a =>
                        a.Region == address.Region && a.City == address.City && a.Street == address.Street &&
                        a.House == address.House);

                    if (existsFullAddress)
                    {
                        loggerAddressesController.Error(
                            $"Такой адрес уже существует: {address.Region}, {address.City}, {address.Street}, {address.House}");
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
                            Timestamp = DateTime.Now
                        });
                    }

                    dbContext.Addresses.Add(address);
                    loggerAddressesController.Info($"Адрес успешно добавлен");
                    await dbContext.SaveChangesAsync();
                    loggerAddressesController.Info($"Изменения внесены в БД");

                    return CreatedAtAction(nameof(GetAddressesAsync), new { id = address.Id }, address);
                }

                errorMessage.Add($"У пользователя {user.Login} недостаточно прав");
                loggerAddressesController.Error($"Ошибка сервера: {errorMessage}");
                return BadRequest(errorMessage);
            }

            loggerAddressesController.Error($"Пользователя с {userId} не существует");
            return NotFound(new { message = $"Пользователя с {userId} не существует" });
        }
        catch (Exception ex)
        {
            loggerAddressesController.Error($"Внутренняя ошибка сервера: {ex.Message}");
            return StatusCode(500, new { message = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }

    [HttpPut("update-address")]
    public async Task<IActionResult> UpdateAddressAsync(int addressId, AddressesModel address, int userId)
    {
        try
        {
            var user = await dbContext.Users.FindAsync(userId);
            var existsAddress = await dbContext.Addresses.FindAsync(addressId);
            if (existsAddress == null)
            {
                loggerAddressesController.Error($"Адреса не существует!");
                return NotFound(new
                {
                    StatusCode = 404,
                    Error = "NotFound",
                    Message = $"Адреса не существует!",
                    Timestamp = DateTime.Now,
                });
            }

            if (existsAddress.Region != address.Region)
            {
                existsAddress.Region = address.Region;
                loggerAddressesController.Info($"Регион обновлен");
            }

            if (existsAddress.City != address.City)
            {
                existsAddress.City = address.City;
                loggerAddressesController.Info($"Город обновлен");
            }

            if (existsAddress.Street != address.Street)
            {
                existsAddress.Street = address.Street;
                loggerAddressesController.Info($"Улица обновлена");
            }

            if (existsAddress.House != address.House)
            {
                existsAddress.House = address.House;
                loggerAddressesController.Info($"Номер дома обновлен");
            }

            if (existsAddress.IsShop != address.IsShop)
            {
                if (user != null && user.Role == "admin" && user.Position == "администратор")
                {
                    existsAddress.IsShop = address.IsShop;
                    loggerAddressesController.Info($"Статус адреса изменен на 'магазин'");
                    var addressInformation = await dbContext.Addresses.FindAsync(existsAddress.Id);
                    if (addressInformation != null)
                    {
                        var information =
                            await dbContext.Informations.FirstOrDefaultAsync(i =>
                                i.Addresses_Id == addressInformation.Id);
                        if (existsAddress.IsShop)
                        {
                            if (information == null)
                            {
                                var newInformation = new InformationsModel()
                                {
                                    AboutUs = null,
                                    Questions = null,
                                    OurMission = null,
                                    OurValues = null,
                                    Users_Id = null,
                                    Addresses_Id = addressInformation.Id
                                };

                                await dbContext.Informations.AddAsync(newInformation);
                                loggerAddressesController.Info($"Адрес магазина добавлен в таблицу информации");
                            }
                        }
                        else
                        {
                            if (information != null)
                            {
                                dbContext.Informations.Remove(information);
                                loggerAddressesController.Info($"Адрес магазина удален из таблицы информации");
                            }
                        }
                    }
                }
                else
                {
                    loggerAddressesController.Error(
                        $"У пользователя {user?.Login} нет прав администратора или сотрудника для изменения состояния адреса (IsShop)");
                    return BadRequest(new
                    {
                        message =
                            $"У пользователя {user?.Login} нет прав администратора или сотрудника для изменения состояния адреса (IsShop)"
                    });
                }
            }

            await dbContext.SaveChangesAsync();
            loggerAddressesController.Info($"Все изменения внесены в БД");
            return NoContent();
        }
        catch (Exception ex)
        {
            loggerAddressesController.Error($"Внутренняя ошибка сервера: {ex.Message}");
            return StatusCode(500, new { message = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }

    [HttpDelete("delete-address/{addressId}")]
    public async Task<IActionResult> DeleteAddressAsync(int addressId)
    {
        try
        {
            var address = await dbContext.Addresses.FirstOrDefaultAsync(a => a.Id == addressId);
            if (address == null)
            {
                loggerAddressesController.Error($"Такого адреса с id = {addressId} не существует!");
                return NotFound(new
                {
                    StatusCode = 404,
                    Error = "NotFound",
                    Message = $"Такого адреса не существует!",
                    Timestamp = DateTime.Now,
                });
            }

            dbContext.Addresses.Remove(address);
            loggerAddressesController.Info($"Адрес с id = {addressId} успешно удален");
            await dbContext.SaveChangesAsync();
            loggerAddressesController.Info($"Все изменения внесены в БД");

            return Ok(new
            {
                StatusCode = 200,
                Message = "Адрес успешно удален",
                DeletedId = addressId,
                Timestamp = DateTime.Now
            });
        }
        catch (Exception ex)
        {
            loggerAddressesController.Error($"Внутренняя ошибка сервера: {ex.Message}");
            return StatusCode(500, new { message = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }
}