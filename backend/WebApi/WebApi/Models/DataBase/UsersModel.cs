using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace WebApi.Models.DataBase;

[Table("Users")]
public sealed class UsersModel
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; private set; }

    [Required] [MaxLength(100)] public string SecondName { get; set; }
    [Required] [MaxLength(100)] public string FirstName { get; set; }
    [MaxLength(100)] public string? SurName { get; set; }
    [Required] [MaxLength(15)] public string Gender { get; set; }
    [Required] public DateOnly Birthday { get; set; }
    [Required] [Range(0, 100)] public int Age { get; set; }
    [MaxLength(50)] public string? Position { get; set; }
    [Required] [MaxLength(25)] public string Role { get; set; }

    [Required]
    [MaxLength(100)]
    [DataType(DataType.PhoneNumber)]
    [RegularExpression(@"^(\+7|7|8)\d{10}$", ErrorMessage = "Формат: 8XXXXXXXXXX, 7XXXXXXXXXX или +7XXXXXXXXXX")]
    public string PhoneNumber { get; set; }

    [Required]
    [MaxLength(100)]
    [DataType(DataType.EmailAddress)]
    public string Email { get; set; }

    [Required] [MaxLength(100)] public string Login { get; set; }

    [Required]
    [MaxLength(100)]
    [DataType(DataType.Password)]
    public string Password { get; set; }

    [MaxLength(1000)] public string? PasswordHash { get; set; }

    [JsonIgnore] public ICollection<OrdersModel>? Orders { get; set; }

    [MaxLength(500)] public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiryTime { get; set; }
    public DateTime? LastLoginAt { get; set; }
    public int? LoginAttempts { get; set; } = 0;
    public DateTime? LockoutEnd { get; set; }
}