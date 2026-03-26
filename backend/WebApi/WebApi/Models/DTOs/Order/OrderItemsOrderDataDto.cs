namespace WebApi.Models.DTOs.Order;

public sealed class OrderItemsOrderDataDto
{
    public int Id { get; set; }
    public int Quantity { get; set; }
    public double Price { get; set; }
    public double TotalPrice => Quantity * Price;
    public string NameProduct { get; set; }
}