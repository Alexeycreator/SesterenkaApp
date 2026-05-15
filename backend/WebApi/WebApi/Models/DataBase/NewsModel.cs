using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebApi.Models.DataBase;

[Table("News")]
public sealed class NewsModel
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required] [MaxLength(50)] public string Type { get; set; }
    [Required] public DateOnly Date { get; set; }
    [Required] [MaxLength(150)] public string Theme { get; set; }
    [MaxLength(500)] public string? Image { get; set; }
    [Required] public string Body { get; set; }
}