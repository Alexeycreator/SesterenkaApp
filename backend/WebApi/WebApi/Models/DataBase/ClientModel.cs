using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace WebApi.Models.DataBase;

[Table("Clients")]
public sealed class ClientModel
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; private set; }

    [Required] [MaxLength(100)] public string SecondName { get; set; }
    [Required] [MaxLength(100)] public string FirstName { get; set; }
    [MaxLength(100)] public string? SurName { get; set; }
    [Required] [MaxLength(100)] public string NumberPhone { get; set; }
    [Required] [MaxLength(100)] public string Login { get; set; }
    [Required] [MaxLength(100)] public string Password { get; set; }

    [Column("Address_Id")]
    [ForeignKey("Address")]
    public int? Adress_Id { get; set; }

    [DeleteBehavior(DeleteBehavior.Restrict)]
    public AddressModel Address { get; set; }
}