namespace WebApi.Models.DTOs.Basket;

public sealed class BasketDataDto
{
    public int Id { get; set; }
    public int Quantity { get; set; }
    public double PriceAtMoment { get; set; }
    public string NameCategories { get; set; } = string.Empty;
    public string NameManufacturers { get; set; } = string.Empty;
    public string NameProducts { get; set; } = string.Empty;
    public string PartNumber { get; set; } = string.Empty;
    public string ImageProduct { get; set; } = string.Empty;
    public double TotalPrice => PriceAtMoment * Quantity;
}