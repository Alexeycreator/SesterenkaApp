using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApi.Methods;
using WebApi.Models.DataBase;
using WebApi.Models.DTOs.StockManagement;

namespace WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class StocksController(ServerDbContext dbContext) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<StocksModel>>> GetStocks()
    {
        return await dbContext.Stocks.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<StocksModel>> GetStock(int id)
    {
        var stock = await dbContext.Stocks.FindAsync(id);
        if (stock == null)
        {
            return NotFound(new
            {
                StatusCode = 404,
                Message = $"Данного производителя не существует",
                Timestamp = DateTime.UtcNow
            });
        }

        return Ok(stock);
    }

    [HttpGet("management-stocks")]
    public async Task<IActionResult> GetManagementStocks()
    {
        try
        {
            var stocks = await dbContext.Stocks.Include(s => s.Products).Include(s => s.Warehouses).ToListAsync();
            if (stocks.Count > 0)
            {
                List<StockManagementDto> stocksManagement = new List<StockManagementDto>();
                List<ProductsDto> productsDto = new List<ProductsDto>();
                List<WarehousesModel> warehousesDto = new List<WarehousesModel>();
                List<StocksModel> stocksDto = new List<StocksModel>();
                foreach (var stock in stocks)
                {
                    if (stock.Products != null)
                    {
                        var existProductsDto = productsDto.Any(p => p.NameProduct == stock.Products.Name);
                        if (!existProductsDto)
                        {
                            productsDto.Add(new ProductsDto()
                            {
                                Id = stock.Products.Id,
                                NameProduct = stock.Products.Name,
                                PartNumber = stock.Products.PartNumber
                            });
                        }
                    }

                    if (stock.Warehouses != null)
                    {
                        var existWarehousesDto = warehousesDto.Any(w => w.Code == stock.Warehouses.Code);
                        if (!existWarehousesDto)
                        {
                            warehousesDto.Add(new WarehousesModel()
                            {
                                Id = stock.Warehouses.Id,
                                Code = stock.Warehouses.Code,
                                Name = stock.Warehouses.Name,
                                Type = stock.Warehouses.Type,
                                IsActive = stock.Warehouses.IsActive
                            });
                        }
                    }

                    stocksDto.Add(new StocksModel()
                    {
                        Id = stock.Id,
                        Quantity = stock.Quantity,
                        Products_Id = stock.Products_Id,
                        Warehouses_Id = stock.Warehouses_Id,
                    });

                    var existStocksManagement =
                        stocksManagement.Any(sm => sm.Products == productsDto || sm.Warehouses == warehousesDto);
                    if (!existStocksManagement)
                    {
                        stocksManagement.Add(new StockManagementDto()
                        {
                            Products = productsDto,
                            Warehouses = warehousesDto,
                            Stocks = stocksDto
                        });
                    }
                }

                return Ok(stocksManagement);
            }

            return NotFound();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Ошибка при обновлении", error = ex.Message });
        }
    }

    [HttpPut("update-stock")]
    public async Task<IActionResult> UpdateStock(int stockId, int quantity)
    {
        try
        {
            var stocks = await dbContext.Stocks.FindAsync(stockId);
            if (stocks != null)
            {
                if (quantity <= 0)
                {
                    return BadRequest();
                }

                stocks.Quantity = quantity;
                await dbContext.SaveChangesAsync();
                return Ok();
            }
            else
            {
                return NotFound();
            }
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Ошибка при обновлении", error = ex.Message });
        }
    }
}