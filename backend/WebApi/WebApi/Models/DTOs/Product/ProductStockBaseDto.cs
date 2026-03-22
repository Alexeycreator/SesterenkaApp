namespace WebApi.Models.DTOs.Product;

public abstract class ProductStockBaseDto
{
    public int ProductId { get; set; }
    public abstract int TotalQuantity { get; set; }
}