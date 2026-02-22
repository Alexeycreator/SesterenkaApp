using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace WebApi.Models.DataBase;

[Table("OrderItems")]
public sealed class OrderItemsModel
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; private set; }

    [Required] public int Quantity { get; set; } = 0;

    [Required]
    [Column(TypeName = "decimal(18, 2)")]
    public double PriceAtMoment { get; set; }

    [Column("Orders_Id")]
    [ForeignKey("Orders")]
    public int? Orders_Id { get; set; }

    [Column("Products_Id")]
    [ForeignKey("Products")]
    public int? Products_Id { get; set; }

    [JsonIgnore] public OrdersModel? Orders { get; set; }
    [JsonIgnore] public ProductsModel? Products { get; set; }
}