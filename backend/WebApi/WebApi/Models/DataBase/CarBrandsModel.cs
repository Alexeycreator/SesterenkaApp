using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace WebApi.Models.DataBase;

[Table("CarBrands")]
public sealed class CarBrandsModel
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; private set; }

    [Required] [MaxLength(25)] public string Name { get; set; }

    [JsonIgnore] public ICollection<CarModelsModel>? CarModels { get; set; }
}