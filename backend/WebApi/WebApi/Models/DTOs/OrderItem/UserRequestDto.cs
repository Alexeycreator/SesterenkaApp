namespace WebApi.Models.DTOs.OrderItem;

public class UserRequestDto
{
    public int Id { get; set; }
    public string? LoginUser { get; set; }
    public string? RoleUser { get; set; }
}