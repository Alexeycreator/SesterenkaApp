using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;

namespace WebApi.Models.DataBase;

[Table("CarModels")]
public sealed class CarModelsModel
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required] [MaxLength(50)] public string Name { get; set; }

    [Column("CarBrands_Id")]
    [ForeignKey("CarBrands")]
    public int? CarBrands_Id { get; set; }

    [Column("CarModifications_Id")]
    [ForeignKey("CarModifications")]
    public int? CarModifications_Id { get; set; }

    [JsonIgnore]
    [DeleteBehavior(DeleteBehavior.Cascade)]
    public CarBrandsModel? CarBrands { get; set; }

    [JsonIgnore]
    [DeleteBehavior(DeleteBehavior.SetNull)]
    public CarModificationsModel? CarModifications { get; set; }
}