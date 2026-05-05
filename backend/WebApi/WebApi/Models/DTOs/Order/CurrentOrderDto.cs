namespace WebApi.Models.DTOs.Order;

public sealed class CurrentOrderDto
{
    public int Id { get; set; }
    public DateTime DateOrder { get; set; }
    public string Status { get; set; }
    public string NameOrder { get; set; }
    public int CountProducts { get; set; }
    public AddressesOrderDataDto Address { get; set; }
    public List<CurrentOrderProductsDto> Products { get; set; }
    public double TotalPriceOrder { get; set; }
}