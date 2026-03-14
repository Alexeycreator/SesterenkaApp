using WebApi.Models.DTOs.User;

namespace WebApi.Models.DTOs.Auth;

public sealed class LoginResponseDto
{
    public string Token { get; set; }
    public DateTime Expiry { get; set; }
    public UserResponseDto User { get; set; }
}