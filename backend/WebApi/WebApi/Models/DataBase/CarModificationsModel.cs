using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace WebApi.Models.DataBase;

[Table("CarModifications")]
public sealed class CarModificationsModel
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; private set; }

    [Required] [MaxLength(30)] public string Body { get; set; }
    [Required] [MaxLength(30)] public string Transmission { get; set; }
    [Required] [MaxLength(30)] public string Engine { get; set; }
    [Required] [MaxLength(30)] public string Drive { get; set; }
    [Required] public double EngineSize { get; set; }
    [Required] [MaxLength(15)] public string YearStart { get; set; }
    [Required] [MaxLength(15)] public string YearEnd { get; set; }

    [JsonIgnore] public ICollection<CarModelsModel>? CarModels { get; set; }
    [JsonIgnore] public ICollection<ProductCarApplicabilityModel>? ProductCarApplicability { get; set; }
}