using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;

namespace WebApi.Models.DataBase;

[Table("Informations")]
public sealed class InformationsModel
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; private set; }

    [MaxLength(2000)] public string? AboutUs { get; set; }
    [MaxLength(1000)] public string? Questions { get; set; }
    [MaxLength(1000)] public string? OurMission { get; set; }
    [MaxLength(1000)] public string? OurValues { get; set; }

    [Column("Users_Id")]
    [ForeignKey("Users")]
    public int? Users_Id { get; set; }

    [Column("Addresses_Id")]
    [ForeignKey("Addresses")]
    public int? Addresses_Id { get; set; }

    [JsonIgnore]
    [DeleteBehavior(DeleteBehavior.Cascade)]
    public UsersModel? Users { get; set; }

    [JsonIgnore]
    [DeleteBehavior(DeleteBehavior.Cascade)]
    public AddressesModel? Addresses { get; set; }
}