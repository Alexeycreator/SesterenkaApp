using WebApi.Models.DataBase;

namespace WebApi.Models.DTOs.Product.ControlPanel;

public sealed class ControlProductsDataDto
{
    public List<ProductsModel>? Products { get; set; }
    public List<CategoriesModel>? Categories { get; set; }
    public List<ManufacturersModel>? Manufacturers { get; set; }
}