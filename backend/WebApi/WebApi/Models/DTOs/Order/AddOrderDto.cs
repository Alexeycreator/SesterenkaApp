namespace WebApi.Models.DTOs.Order;

public sealed class AddOrderDto
{
    public List<UserOrderDto> User { get; set; }
    public List<AddressesOrderDataDto> Address { get; set; }
    public List<OrderItemsOrderDataDto> OrderItems { get; set; }
}