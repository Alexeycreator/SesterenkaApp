using WebApi.Models.DataBase;
using WebApi.Models.DTOs.User;

namespace WebApi.Models.DTOs.Information;

public sealed class DataInfoDto
{
    public List<string>? AboutUs { get; set; }
    public List<string>? Questions { get; set; }
    public List<string>? OurMission { get; set; }
    public List<string>? OurValues { get; set; }
    public List<UserResponseDto>? UsersInfo { get; set; }
    public List<AddressesModel>? AddressesInfo { get; set; }
}