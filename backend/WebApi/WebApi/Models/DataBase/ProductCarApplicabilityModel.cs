using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace WebApi.Models.DataBase;

[Table("ProductCarApplicability")]
public sealed class ProductCarApplicabilityModel
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Column("Products_Id")]
    [ForeignKey("Products")]
    public int? Products_Id { get; set; }

    [Column("CarModifications_Id")]
    [ForeignKey("CarModifications")]
    public int? CarModifications_Id { get; set; }

    [JsonIgnore] public ProductsModel? Products { get; set; }
    [JsonIgnore] public CarModificationsModel? CarModifications { get; set; }
}