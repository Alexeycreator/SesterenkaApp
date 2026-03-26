namespace WebApi.Models.DTOs.Order;

public sealed class AddressesOrderDataDto
{
    public int Id { get; set; }
    public string City { get; set; }
    public string Street { get; set; }
    public string? House { get; set; }
}