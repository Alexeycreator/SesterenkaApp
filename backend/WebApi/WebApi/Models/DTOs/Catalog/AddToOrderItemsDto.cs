using System.ComponentModel.DataAnnotations;

namespace WebApi.Models.DTOs.Catalog;

public sealed class AddToOrderItemsDto
{
    [Required(ErrorMessage = "ID товара обязателен")]
    public int Product_Id { get; set; }

    [Range(1, 999, ErrorMessage = "Количество должно быть от 1 до 999")]
    public int Quantity { get; set; } = 1;
    
    public string UserLogin { get; set; }
}