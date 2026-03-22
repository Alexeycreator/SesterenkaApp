using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;

namespace WebApi.Models.DataBase;

[Table("Products")]
public sealed class ProductsModel
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; private set; }

    [Required] [MaxLength(100)] public string Name { get; set; }
    [Required] [MaxLength(100)] public string PartNumber { get; set; }

    [Required]
    [Column(TypeName = "decimal(18, 2)")]
    public double Price { get; set; }

    [MaxLength(2000)] public string? Details { get; set; }
    [MaxLength(500)] public string Image { get; set; } = string.Empty;

    [Column("Categories_Id")]
    [ForeignKey("Categories")]
    public int? Categories_Id { get; set; }

    [Column("Manufacturers_Id")]
    [ForeignKey("Manufacturers")]
    public int? Manufacturers_Id { get; set; }

    [JsonIgnore]
    [DeleteBehavior(DeleteBehavior.SetNull)]
    public CategoriesModel? Categories { get; set; }

    [JsonIgnore]
    [DeleteBehavior(DeleteBehavior.SetNull)]
    public ManufacturersModel? Manufacturers { get; set; }

    [JsonIgnore] public ICollection<ProductCarApplicabilityModel>? ProductCarApplicability { get; set; }
    [JsonIgnore] public ICollection<OrderItemsModel>? OrderItems { get; set; }
    [JsonIgnore] public ICollection<StocksModel>? Stocks { get; set; }
}