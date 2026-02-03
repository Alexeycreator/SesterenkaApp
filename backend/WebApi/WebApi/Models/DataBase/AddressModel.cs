using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebApi.Models.DataBase;

[Table("Addresses")]
public sealed class AddressModel
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; private set; }

    [Required] [MaxLength(100)] public string City { get; set; }
    [Required] [MaxLength(100)] public string Region { get; set; }
    [Required] [MaxLength(100)] public string House { get; set; }
    public int? Apartment { get; set; }

    public ICollection<ClientModel> Clients { get; set; }
}