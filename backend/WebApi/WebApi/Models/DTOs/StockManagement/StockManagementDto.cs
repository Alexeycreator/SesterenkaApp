using WebApi.Models.DataBase;

namespace WebApi.Models.DTOs.StockManagement;

public sealed class StockManagementDto
{
    public List<ProductsDto>? Products { get; set; }
    public List<StocksModel>? Stocks { get; set; }
    public List<WarehousesModel>? Warehouses { get; set; }
}