namespace WebApi.Models.DTOs.Order;

public sealed class UpdateStatusOrderDto
{
    public int Id { get; set; }
    public string Status { get; set; }
}