namespace WebApi.Models.DTOs.Order;

public sealed class OrderResponseDto
{
    public List<OrderDataDto> Orders { get; set; }
    public List<AddressesOrderDataDto> Addresses { get; set; }
    public int CountOrder => Orders.Count;
    public double TotalPrice { get; set; }
}