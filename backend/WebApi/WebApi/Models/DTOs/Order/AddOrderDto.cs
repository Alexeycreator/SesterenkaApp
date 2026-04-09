namespace WebApi.Models.DTOs.Order;

public sealed class AddOrderDto
{
    public string UserLogin { get; set; }
    public int AddressId { get; set; }
    public List<OrderItemsOrderDataDto> OrderItems { get; set; }
}