namespace WebApi.Models.DTOs.Product.ControlPanel;

public sealed class UpdateProductsDto
{
    public string? Name { get; set; }
    public string? PartNumber { get; set; }
    public double? Price { get; set; }
    public string? Details { get; set; }
    public string? Image { get; set; }
    public int? CategoriesId { get; set; }
    public int? ManufacturersId { get; set; }
}