using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace WebApi.Models.DataBase;

[Table("Manufacturers")]
public sealed class ManufacturersModel
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; private set; }

    [Required] [MaxLength(50)] public string Name { get; set; }

    [JsonIgnore] public ICollection<ProductsModel>? Products { get; set; }
}