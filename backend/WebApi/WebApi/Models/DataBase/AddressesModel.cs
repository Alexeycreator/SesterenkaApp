using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace WebApi.Models.DataBase;

[Table("Addresses")]
public sealed class AddressesModel
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required] [MaxLength(100)] public string Region { get; set; }
    [Required] [MaxLength(100)] public string City { get; set; }
    [Required] [MaxLength(100)] public string Street { get; set; }
    [MaxLength(10)] public string? House { get; set; }
    [Required] public bool IsShop { get; set; } = false;

    [JsonIgnore] public ICollection<WarehousesAddressesModel>? WarehousesAddresses { get; set; }
    [JsonIgnore] public ICollection<InformationsModel>? Informations { get; set; }
}