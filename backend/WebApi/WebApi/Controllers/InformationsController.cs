using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NLog;
using Swashbuckle.Swagger.Model;
using WebApi.Methods;
using WebApi.Models.DataBase;
using WebApi.Models.DTOs.Information;
using WebApi.Models.DTOs.User;

namespace WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class InformationsController(ServerDbContext dbContext) : ControllerBase
{
    private Logger loggerInformationsController = LogManager.GetCurrentClassLogger();

    [HttpGet]
    public async Task<ActionResult<IEnumerable<InformationsModel>>> GetInformationsAsync()
    {
        return await dbContext.Informations.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<InformationsModel>> GetInformationByIdAsync(int id)
    {
        var information = await dbContext.Informations.FindAsync(id);
        if (information == null)
        {
            loggerInformationsController.Error($"Данной информации с id = {id} не существует");
            return NotFound(new
            {
                StatusCode = 404,
                Message = $"Данной информации не существует",
                Timestamp = DateTime.Now
            });
        }

        return Ok(information);
    }

    [HttpGet("data-information-page")]
    public async Task<IActionResult> GetInformationsContentAsync()
    {
        try
        {
            var informationData = await dbContext.Informations.Include(i => i.Addresses)
                .Include(i => i.Users).ToListAsync();
            List<DataInfoDto> respDataInfo = new List<DataInfoDto>();
            if (informationData.Count > 0)
            {
                List<UserResponseDto> usersDto = new List<UserResponseDto>();
                List<AddressesModel> addressesDto = new List<AddressesModel>();
                List<string> ourValuesDto = new List<string>();
                List<string> ourMissionDto = new List<string>();
                List<string> questionsDto = new List<string>();
                List<string> aboutUsDto = new List<string>();
                foreach (var info in informationData)
                {
                    if (info.Users != null)
                    {
                        loggerInformationsController.Info($"Заполнение данных о сотруднике");
                        usersDto.Add(new UserResponseDto()
                        {
                            Id = info.Users.Id,
                            Age = info.Users.Id,
                            Birthday = info.Users.Birthday,
                            Email = info.Users.Email,
                            SecondName = info.Users.SecondName,
                            FirstName = info.Users.FirstName,
                            SurName = info.Users.SurName,
                            PhoneNumber = info.Users.PhoneNumber,
                            Position = info.Users.Position,
                            Gender = info.Users.Gender,
                            Role = info.Users.Role,
                            Login = info.Users.Login
                        });
                    }
                    else
                    {
                        loggerInformationsController.Warn($"Список сотрудников не получен для страницы информации");
                    }

                    if (info.Addresses != null)
                    {
                        loggerInformationsController.Info($"Заполнение данных о адресах");
                        addressesDto.Add(new AddressesModel()
                        {
                            Id = info.Addresses.Id,
                            Region = info.Addresses.Region,
                            City = info.Addresses.City,
                            Street = info.Addresses.Street,
                            House = info.Addresses.House,
                            IsShop = info.Addresses.IsShop,
                        });
                    }
                    else
                    {
                        loggerInformationsController.Warn($"Список адресов не получен для страницы информации");
                    }

                    if (info.OurValues != null)
                    {
                        loggerInformationsController.Info($"Заполнение данных о задачах");
                        ourValuesDto.Add(new string(info.OurValues));
                    }
                    else
                    {
                        loggerInformationsController.Warn(
                            $"Текст для блока 'наши задачи' не получен для страницы информации");
                    }

                    if (info.OurMission != null)
                    {
                        loggerInformationsController.Info($"Заполнение данных о миссиях");
                        ourMissionDto.Add(new string(info.OurMission));
                    }

                    {
                        loggerInformationsController.Warn(
                            $"Текст для блока 'наша миссия' не получен для страницы информации");
                    }

                    if (info.AboutUs != null)
                    {
                        loggerInformationsController.Info($"Заполнение данных информации о компании");
                        aboutUsDto.Add(new string(info.AboutUs));
                    }
                    else
                    {
                        loggerInformationsController.Warn(
                            $"Текст для блока 'о нас' не получен для страницы информации");
                    }

                    if (info.Questions != null)
                    {
                        loggerInformationsController.Info($"Заполнение данных о вопросах");
                        questionsDto.Add(new string(info.Questions));
                    }
                    else
                    {
                        loggerInformationsController.Warn(
                            $"Текст для блока 'часто задаваемые вопросы' не получен для страницы информации");
                    }

                    var existsRespDataInfo =
                        respDataInfo.Any(x => x.AddressesInfo == addressesDto && x.UsersInfo == usersDto);
                    if (!existsRespDataInfo)
                    {
                        respDataInfo.Add(new DataInfoDto()
                        {
                            AboutUs = aboutUsDto,
                            Questions = questionsDto,
                            OurMission = ourMissionDto,
                            OurValues = ourValuesDto,
                            AddressesInfo = addressesDto,
                            UsersInfo = usersDto
                        });
                    }
                }
            }
            else
            {
                loggerInformationsController.Error($"Данной информации не существует");
                return NotFound(new
                {
                    StatusCode = 404,
                    Message = $"Данной информации не существует",
                    Timestamp = DateTime.Now
                });
            }

            return Ok(respDataInfo);
        }
        catch (Exception ex)
        {
            loggerInformationsController.Error($"Внутренняя ошибка сервера: {ex.Message}");
            return StatusCode(500, new { message = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }
}