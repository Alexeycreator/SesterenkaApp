using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;

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

    [JsonIgnore]
    [DeleteBehavior(DeleteBehavior.SetNull)]
    public AddressesModel? Addresses { get; set; }

    [JsonIgnore]
    [DeleteBehavior(DeleteBehavior.SetNull)]
    public WarehousesModel? Warehouses { get; set; }
}