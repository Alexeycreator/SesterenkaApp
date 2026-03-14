namespace WebApi.Models.DTOs.User;

public sealed class UserResponseDto
{
    public int Id { get; set; }
    public string SecondName { get; set; }
    public string FirstName { get; set; }
    public string? SurName { get; set; }
    public string PhoneNumber { get; set; }
    public string Email { get; set; }
    public string Login { get; set; }
    public string Gender { get; set; }
    public DateOnly Birthday { get; set; }
    public int Age { get; set; }
    public string? Position { get; set; }
    public string? Role { get; set; }
}