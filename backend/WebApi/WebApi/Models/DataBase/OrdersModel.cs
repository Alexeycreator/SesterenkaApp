using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace WebApi.Models.DataBase;

[Table("Orders")]
public sealed class OrdersModel
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; private set; }

    [Required] public DateTime OrderDate { get; set; }

    [Required] [MaxLength(25)] public string Status { get; set; } = "Выдан";

    [Column("Clients_Id")]
    [ForeignKey("Clients")]
    public int? Clients_Id { get; set; }

    [Column("Employees_Id")]
    [ForeignKey("Employees")]
    public int? Employees_Id { get; set; }

    [JsonIgnore] public ClientsModel? Clients { get; set; }
    [JsonIgnore] public EmployeesModel? Employees { get; set; }

    [JsonIgnore] public ICollection<OrderItemsModel>? OrderItems { get; set; }
}