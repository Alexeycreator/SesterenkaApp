namespace WebApi.Models.DTOs.Order;

public sealed class UserOrderDto
{
    public string? Login { get; set; }
    public string SecondName { get; set; }
    public string FirstName { get; set; }
    public string? SurName { get; set; }
    public string Email { get; set; }
    public string PhoneNumber { get; set; }
}