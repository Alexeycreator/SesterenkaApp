using System.ComponentModel.DataAnnotations;

namespace WebApi.Models.DTOs.OrderItem;

public sealed class UpdateOrderItemQuantityDto
{
    [Range(1, 999, ErrorMessage = "Количество должно быть от 1 до 999")]
    public int Quantity { get; set; }
}