using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace WebApi.Models.DataBase;

[Table("WarehousesAddresses")]
public sealed class WarehousesAddressesModel
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; private set; }

    [MaxLength(2000)] public string? Notes { get; set; }

    [Column("Addresses_Id")]
    [ForeignKey("Addresses")]
    public int? Addresses_Id { get; set; }

    [Column("Warehouses_Id")]
    [ForeignKey("Warehouses")]
    public int? Warehouses_Id { get; set; }

    [JsonIgnore] public AddressesModel? Addresses { get; set; }
    [JsonIgnore] public WarehousesModel? Warehouses { get; set; }
}