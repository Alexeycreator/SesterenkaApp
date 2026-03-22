namespace WebApi.Models.DTOs.Product;

public sealed class ProductStockQuantityDto : ProductStockBaseDto
{
    public override int TotalQuantity { get; set; }
}