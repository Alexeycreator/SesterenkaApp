namespace WebApi.Models.DTOs.Order;

public sealed class CurrentOrderProductsDto
{
    public int Id { get; set; }
    public int Quantity { get; set; }
    public double Price { get; set; }
    public string NameProduct { get; set; }
    public string Categories { get; set; }
    public string Manufacturers { get; set; }
    public string PartNumber { get; set; }
    public double TotalPriceProduct { get; set; }
    public string Image { get; set; }
}