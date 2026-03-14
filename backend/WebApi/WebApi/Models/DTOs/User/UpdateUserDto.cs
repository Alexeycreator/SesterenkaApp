using System.ComponentModel.DataAnnotations;

namespace WebApi.Models.DTOs.User;

public sealed class UpdateUserDto
{
    [MaxLength(100)] public string? SecondName { get; set; }
    [MaxLength(100)] public string? FirstName { get; set; }
    [MaxLength(100)] public string? SurName { get; set; }
    [MaxLength(15)] public string? Gender { get; set; }
    [DataType(DataType.Date)] public DateOnly? Birthday { get; set; }

    [Range(0, 100, ErrorMessage = "Возраст должен быть от 0 до 100 лет")]
    public int? Age { get; set; }

    [MaxLength(15)]
    [DataType(DataType.PhoneNumber)]
    [RegularExpression(@"^(\+7|7|8)\d{10}$", ErrorMessage = "Формат: 8XXXXXXXXXX, 7XXXXXXXXXX или +7XXXXXXXXXX")]
    public string? PhoneNumber { get; set; }

    [MaxLength(100)]
    [DataType(DataType.EmailAddress)]
    [EmailAddress(ErrorMessage = "Неверный формат email")]
    public string? Email { get; set; }

    [MaxLength(100)] public string? Login { get; set; }
    [MaxLength(50)] public string? Position { get; set; }
    [MaxLength(25)] public string? Role { get; set; }
    [DataType(DataType.Password)] public string? CurrentPassword { get; set; }

    [StringLength(100, MinimumLength = 6, ErrorMessage = "Пароль должен быть от 6 до 100 символов")]
    [DataType(DataType.Password)]
    public string? NewPassword { get; set; }
}