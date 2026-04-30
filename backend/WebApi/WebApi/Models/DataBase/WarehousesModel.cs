using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace WebApi.Models.DataBase;

[Table("Warehouses")]
public sealed class WarehousesModel
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required] public int Code { get; set; }
    [Required] [MaxLength(100)] public string Name { get; set; }
    [Required] [MaxLength(50)] public string Type { get; set; } = "Основной";
    [Required] public bool IsActive { get; set; } = true;

    [JsonIgnore] public ICollection<StocksModel>? Stocks { get; set; }
    [JsonIgnore] public ICollection<WarehousesAddressesModel>? WarehousesAddresses { get; set; }
}