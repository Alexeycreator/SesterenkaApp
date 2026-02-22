using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace WebApi.Models.DataBase;

[Table("Clients")]
public sealed class ClientsModel
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; private set; }

    [Required] [MaxLength(100)] public string SecondName { get; set; }
    [Required] [MaxLength(100)] public string FirstName { get; set; }
    [MaxLength(100)] public string? SurName { get; set; }

    [Required]
    [MaxLength(100)]
    [DataType(DataType.PhoneNumber)]
    [RegularExpression(@"^(\+7|7|8)\d{10}$", ErrorMessage = "Формат: 8XXXXXXXXXX, 7XXXXXXXXXX или +7XXXXXXXXXX")]
    public string PhoneNumber { get; set; }

    [Required]
    [MaxLength(100)]
    [DataType(DataType.EmailAddress)]
    public string Email { get; set; }

    [Required] [MaxLength(100)] public string LoginClient { get; set; }

    [Required]
    [MaxLength(100)]
    [DataType(DataType.Password)]
    public string PasswordClient { get; set; }

    [JsonIgnore] public ICollection<OrdersModel>? Orders { get; set; }
}