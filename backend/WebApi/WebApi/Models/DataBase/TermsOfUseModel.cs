using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebApi.Models.DataBase;

[Table("TermsOfUse")]
public sealed class TermsOfUseModel
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required] [MaxLength(100)] public string Title { get; set; }
    public string? Icon { get; set; }
    [Required] public string Content { get; set; }
    [Required] public DateTime Date { get; set; } = DateTime.Now;
}