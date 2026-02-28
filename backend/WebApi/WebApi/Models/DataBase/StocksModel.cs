using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;

namespace WebApi.Models.DataBase;

[Table("Stocks")]
public sealed class StocksModel
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; private set; }

    [Required] public int Quantity { get; set; }

    [Column("Products_Id")]
    [ForeignKey("Products")]
    public int? Products_Id { get; set; }

    [Column("Warehouses_Id")]
    [ForeignKey("Warehouses")]
    public int? Warehouses_Id { get; set; }

    [JsonIgnore]
    [DeleteBehavior(DeleteBehavior.Restrict)]
    public ProductsModel? Products { get; set; }

    [JsonIgnore]
    [DeleteBehavior(DeleteBehavior.Restrict)]
    public WarehousesModel? Warehouses { get; set; }
}