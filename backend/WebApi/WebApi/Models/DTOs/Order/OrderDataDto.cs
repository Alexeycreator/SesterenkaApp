namespace WebApi.Models.DTOs.Order;

public sealed class OrderDataDto
{
    public int Id { get; set; }
    public string NameOrder { get; set; }
    public string LoginUser { get; set; }
    public string Status { get; set; }
    public DateTime OrderDate { get; set; }
    public List<OrderItemsOrderDataDto> OrderItems { get; set; }
}