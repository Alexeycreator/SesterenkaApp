using System.ComponentModel.DataAnnotations;

namespace WebApi.Models.DTOs.User;

public sealed class LoginRequestDto
{
    [Required] public string Login { get; set; }
    [Required] public string Password { get; set; }
}