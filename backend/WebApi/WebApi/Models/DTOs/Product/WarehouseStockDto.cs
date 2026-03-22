namespace WebApi.Models.DTOs.Product;

public sealed class WarehouseStockDto
{
    public int WarehouseId { get; set; }
    public string? WarehouseName { get; set; }
    public string? WarehouseAddress { get; set; }
    public int Quantity { get; set; }
}