namespace WebApi.Models.DTOs.Product;

public sealed class ProductStockWarehousesDto : ProductStockBaseDto
{
    public List<WarehouseStockDto> Warehouses { get; set; } = new();
    public override int TotalQuantity
    {
        get => Warehouses.Sum(w => w.Quantity);
        set => throw new NotImplementedException();
    }
}