using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;

namespace WebApi.Models.DataBase;

[Table("Orders")]
public sealed class OrdersModel
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; private set; }

    [Required] public DateTime OrderDate { get; set; } = DateTime.Now;
    //[Required] [MaxLength(100)] public string NameOrder { get; set; }
    [Required] [MaxLength(25)] public string Status { get; set; } = "Выдан";

    [Column("Users_Id")]
    [ForeignKey("Users")]
    public int? Users_Id { get; set; }

    [JsonIgnore]
    [DeleteBehavior(DeleteBehavior.Restrict)]
    public UsersModel? Users { get; set; }

    [JsonIgnore] public ICollection<OrderItemsModel>? OrderItems { get; set; }
}