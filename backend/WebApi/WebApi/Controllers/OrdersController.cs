using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApi.Methods;
using WebApi.Models.DataBase;
using WebApi.Models.DTOs.Order;

namespace WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class OrdersController(ServerDbContext dbContext) : ControllerBase
{
    private List<AddressesOrderDataDto> addressesDto = new List<AddressesOrderDataDto>();
    private List<OrderItemsOrderDataDto> orderItemsDto = new List<OrderItemsOrderDataDto>();
    private List<OrderResponseDto> orderResponse = new List<OrderResponseDto>();

    [HttpGet]
    public async Task<ActionResult<IEnumerable<OrdersModel>>> GetOrdersAsync()
    {
        return await dbContext.Orders.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<OrdersModel>> GetOrderAsync(int id)
    {
        var order = await dbContext.Orders.FindAsync(id);
        if (order == null)
        {
            return NotFound(new
            {
                StatusCode = 404,
                Message = $"Данного производителя не существует",
                Timestamp = DateTime.UtcNow
            });
        }

        return Ok(order);
    }

    [HttpGet("order-data")]
    public async Task<IActionResult> GetOrderDataAsync(string currentUserLogin)
    {
        try
        {
            var orderProducts = await dbContext.Products.ToListAsync();
            var orderOrderData = await dbContext.Orders.ToListAsync();
            var orderUsers = await dbContext.Users.ToListAsync();
            var orderAddresses = await dbContext.Addresses.ToListAsync();
            var orderOrderItems = await dbContext.OrderItems.ToListAsync();

            addressesDto = FillingAddressesOrderData(orderAddresses);
            orderItemsDto = FillingOrderItemsOrderData(orderOrderItems, currentUserLogin);

            var orderData = await dbContext.Orders
                .Select(o => new OrderDataDto()
                {
                    Id = o.Id,
                    LoginUser = o.Users.Login,
                    OrderItems = orderItemsDto,
                }).Where(o => o.LoginUser == currentUserLogin).ToListAsync();

            var totalPriceAllOrders = orderData.Sum(o => o.OrderItems.Sum(oi => oi.TotalPrice));
            orderResponse.Add(new OrderResponseDto()
            {
                Orders = orderData,
                Addresses = addressesDto,
                TotalPrice = totalPriceAllOrders
            });

            return Ok(orderResponse);
        }
        catch (NullReferenceException ex)
        {
            return StatusCode(500, new { message = "Ошибка при обновлении", error = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Ошибка при обновлении", error = ex.Message });
        }
    }

    private List<AddressesOrderDataDto> FillingAddressesOrderData(List<AddressesModel> addresses)
    {
        foreach (var address in addresses)
        {
            if (address.IsShop)
            {
                addressesDto.Add(new AddressesOrderDataDto()
                {
                    Id = address.Id,
                    City = address.City,
                    Street = address.Street,
                    House = address.House
                });
            }
        }

        return addressesDto;
    }

    private List<OrderItemsOrderDataDto> FillingOrderItemsOrderData(List<OrderItemsModel> orderItems,
        string currentUserLogin)
    {
        foreach (var items in orderItems)
        {
            if (items.Orders_Id != null)
            {
                if (items.Orders != null && items.Orders.Users != null && items.Orders.Users.Login == currentUserLogin)
                {
                    if (items.Products != null)
                        orderItemsDto.Add(new OrderItemsOrderDataDto()
                        {
                            Id = items.Id,
                            Quantity = items.Quantity,
                            Price = items.PriceAtMoment,
                            NameProduct = items.Products.Name
                        });
                }
            }
            else
            {
                throw new NullReferenceException();
            }
        }

        return orderItemsDto;
    }
}