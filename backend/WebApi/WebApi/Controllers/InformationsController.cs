using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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
                Timestamp = DateTime.Now
            });
        }

        return Ok(information);
    }

    [HttpGet("data-information-page")]
    public async Task<IActionResult> GetInformationsContent()
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

                    if (info.Addresses != null)
                    {
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

                    if (info.OurValues != null)
                    {
                        ourValuesDto.Add(new string(info.OurValues));
                    }

                    if (info.OurMission != null)
                    {
                        ourMissionDto.Add(new string(info.OurMission));
                    }

                    if (info.AboutUs != null)
                    {
                        aboutUsDto.Add(new string(info.AboutUs));
                    }

                    if (info.Questions != null)
                    {
                        questionsDto.Add(new string(info.Questions));
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
            return StatusCode(500, new { message = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }
}