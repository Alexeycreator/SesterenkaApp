using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApi.Methods;
using WebApi.Models.DataBase;
using WebApi.Models.DTOs.Product;

namespace WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class ProductsController(ServerDbContext dbContext) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProductsModel>>> GetProducts()
    {
        return await dbContext.Products.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ProductsModel>> GetProducts(int id)
    {
        var product = await dbContext.Products.FindAsync(id);
        if (product == null)
        {
            return NotFound(new
            {
                StatusCode = 404,
                Message = $"Данного товара не существует",
                Timestamp = DateTime.UtcNow
            });
        }

        return Ok(product);
    }

    [HttpGet("stock-summary")]
    public async Task<IActionResult> GetProductStockSummary()
    {
        try
        {
            var stockSummary = await dbContext.Stocks
                .Where(s => s.Products_Id.HasValue)
                .GroupBy(s => s.Products_Id.Value)
                .Select(g => new ProductStockQuantityDto
                {
                    ProductId = g.Key,
                    TotalQuantity = g.Sum(s => s.Quantity)
                })
                .ToListAsync();

            return Ok(stockSummary);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Ошибка получения остатков", error = ex.Message });
        }
    }

    [HttpGet("stock-warehouses")]
    public async Task<IActionResult> GetProductStockWarehouses()
    {
        try
        {
            var stockWarehouses = await dbContext.Stocks
                .Where(s => s.Warehouses_Id.HasValue && s.Products_Id.HasValue)
                .Include(s => s.Warehouses) // если есть навигационное свойство
                .GroupBy(s => s.Products_Id.Value)
                .Select(g => new ProductStockWarehousesDto
                {
                    ProductId = g.Key,
                    Warehouses = g.Select(s => new WarehouseStockDto
                    {
                        WarehouseId = s.Warehouses_Id.Value,
                        WarehouseName = s.Warehouses != null ? s.Warehouses.Name : "Неизвестно",
                        //WarehouseAddress = s.Warehouses != null ? s.Warehouses. : "Адрес не указан",
                        Quantity = s.Quantity
                    }).ToList()
                })
                .ToListAsync();

            return Ok(stockWarehouses);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Ошибка получения остатков по складам", error = ex.Message });
        }
    }
    
    [HttpGet("catalog-data")]
    public async Task<IActionResult> GetCatalogData()
    {
        var products = await dbContext.Products.ToListAsync();
        var categories = await dbContext.Categories.ToListAsync();
        var manufacturers = await dbContext.Manufacturers.ToListAsync();
        var stocks = await dbContext.Stocks
            .Where(s => s.Warehouses_Id.HasValue && s.Products_Id.HasValue)
            .Include(s => s.Warehouses) // если есть навигационное свойство
            .GroupBy(s => s.Products_Id.Value)
            .Select(g => new ProductStockWarehousesDto
            {
                ProductId = g.Key,
                Warehouses = g.Select(s => new WarehouseStockDto
                {
                    WarehouseId = s.Warehouses_Id.Value,
                    WarehouseName = s.Warehouses != null ? s.Warehouses.Name : "Неизвестно",
                    //WarehouseAddress = s.Warehouses != null ? s.Warehouses. : "Адрес не указан",
                    Quantity = s.Quantity
                }).ToList()
            })
            .ToListAsync();
    
        return Ok(new
        {
            products,
            categories,
            manufacturers,
            stocks
        });
    }
}