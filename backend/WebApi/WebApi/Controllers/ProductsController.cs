using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Client.Utils;
using NLog;
using WebApi.Methods;
using WebApi.Models.DataBase;
using WebApi.Models.DTOs.Product;
using WebApi.Models.DTOs.Product.ControlPanel;

namespace WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class ProductsController(ServerDbContext dbContext) : ControllerBase
{
    private Logger loggerProductsController = LogManager.GetCurrentClassLogger();

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProductsModel>>> GetProductsAsync()
    {
        return await dbContext.Products.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ProductsModel>> GetProductsByIdAsync(int id)
    {
        var product = await dbContext.Products.FindAsync(id);
        if (product == null)
        {
            loggerProductsController.Error($"Данного товара ({id}) не существует");
            return NotFound(new
            {
                StatusCode = 404,
                Message = $"Данного товара не существует",
                Timestamp = DateTime.Now
            });
        }

        return Ok(product);
    }

    [HttpGet("stock-summary")]
    public async Task<IActionResult> GetProductStockSummaryAsync()
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
            loggerProductsController.Error($"Внутренняя ошибка сервера: {ex.Message}");
            return StatusCode(500, new { message = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }

    [HttpGet("stock-warehouses")]
    public async Task<IActionResult> GetProductStockWarehousesAsync()
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
            loggerProductsController.Error($"Внутренняя ошибка сервера: {ex.Message}");
            return StatusCode(500, new { message = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }

    [HttpGet("catalog-data")]
    public async Task<IActionResult> GetCatalogDataAsync()
    {
        try
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
        catch (Exception ex)
        {
            loggerProductsController.Error($"Внутренняя ошибка сервера: {ex.Message}");
            return StatusCode(500, new { message = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }

    [HttpGet("admin-or-employee-panel-control-products")]
    public async Task<IActionResult> GetControlProductsAsync()
    {
        try
        {
            var products = await dbContext.Products.ToListAsync();
            var categories = await dbContext.Categories.ToListAsync();
            var manufacturers = await dbContext.Manufacturers.ToListAsync();

            if (!products.Any())
            {
                loggerProductsController.Error($"Данные о продуктах пустые");
                return NotFound(new { message = "Данные о продуктах пустые" });
            }

            if (!categories.Any())
            {
                loggerProductsController.Error("Данные о категориях пустые");
                return NotFound(new { message = "Данные о категориях пустые" });
            }

            if (!manufacturers.Any())
            {
                loggerProductsController.Error($"Данные о брендах пустые");
                return NotFound(new { message = "Данные о брендах пустые" });
            }

            loggerProductsController.Info($"Заполнение ответного DTO для клиента");
            var responseDataProducts = new ControlProductsDataDto()
            {
                Products = products,
                Categories = categories,
                Manufacturers = manufacturers
            };

            return Ok(responseDataProducts);
        }
        catch (Exception ex)
        {
            loggerProductsController.Error($"Внутренняя ошибка сервера: {ex.Message}");
            return StatusCode(500, new { message = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }

    [HttpPost("admin-or-employee-panel-create-product")]
    public async Task<IActionResult> CreateProductControlPanelAsync([FromBody] ProductsModel? request)
    {
        try
        {
            if (request == null)
            {
                loggerProductsController.Error("Данные пустые");
                return BadRequest(new { message = "Данные пустые" });
            }

            if (string.IsNullOrEmpty(request.Name))
            {
                loggerProductsController.Error("Название товара не может быть пустым");
                return BadRequest(new { message = "Название товара не может быть пустым" });
            }

            if (string.IsNullOrEmpty(request.PartNumber))
            {
                loggerProductsController.Error("Артикул товара не может быть пустым");
                return BadRequest(new { message = "Артикул товара не может быть пустым" });
            }

            if (request.Price <= 0)
            {
                loggerProductsController.Error("Цена товара не может быть отрицательной или равна 0");
                return BadRequest(new { message = "Цена товара не может быть отрицательной или равна 0" });
            }

            var existingProduct = await dbContext.Products.FirstOrDefaultAsync(p => p.PartNumber == request.PartNumber);
            if (existingProduct != null)
            {
                loggerProductsController.Error($"Товар с артикулом '{request.PartNumber}' уже существует");
                return Conflict(new { message = $"Товар с артикулом '{request.PartNumber}' уже существует" });
            }

            if (request.Categories_Id.HasValue)
            {
                var category = await dbContext.Categories.FindAsync(request.Categories_Id.Value);
                if (category == null)
                {
                    loggerProductsController.Error($"Указанная категория не существует");
                    return BadRequest(new { message = "Указанная категория не существует" });
                }
            }

            if (request.Manufacturers_Id.HasValue)
            {
                var manufacturer = await dbContext.Manufacturers.FindAsync(request.Manufacturers_Id.Value);
                if (manufacturer == null)
                {
                    loggerProductsController.Error($"Указанный бренд не существует");
                    return BadRequest(new { message = "Указанный бренд не существует" });
                }
            }

            loggerProductsController.Info($"Создание нового товара...");
            var newProduct = new ProductsModel()
            {
                Name = request.Name,
                PartNumber = request.PartNumber,
                Price = request.Price,
                Details = request.Details,
                Image = string.IsNullOrEmpty(request.Image)
                    ? "Images/Products/Default/default_product.jpg"
                    : request.Image.Trim(),
                Categories_Id = request.Categories_Id,
                Manufacturers_Id = request.Manufacturers_Id
            };

            await dbContext.Products.AddAsync(newProduct);
            loggerProductsController.Info($"Новый товар добавлен в БД");
            await dbContext.SaveChangesAsync();
            loggerProductsController.Info($"Все изменения внесены в БД");

            return Ok(new { message = "Товар успешно создан" });
        }
        catch (Exception ex)
        {
            loggerProductsController.Error($"Внутренняя ошибка сервера: {ex.Message}");
            return StatusCode(500, new { message = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }

    [HttpPut("admin-or-employee-panel-update-product")]
    public async Task<IActionResult> UpdateProductControlPanelAsync(int productId, ProductsModel? request)
    {
        try
        {
            if (request == null)
            {
                loggerProductsController.Error($"Данные не предоставлены");
                return BadRequest(new { message = "Данные не предоставлены" });
            }

            var product = await dbContext.Products.FindAsync(productId);
            if (product == null)
            {
                loggerProductsController.Error($"Товар ({productId}) не найден");
                return NotFound(new { message = "Товар не найден" });
            }

            if (request.Price <= 0)
            {
                loggerProductsController.Error($"Цена товара должна быть больше 0");
                return BadRequest(new { message = "Цена товара должна быть больше 0" });
            }
            else
            {
                product.Price = request.Price;
                loggerProductsController.Info($"Цена товара обновлена");
            }

            if (!string.IsNullOrEmpty(request.PartNumber) && request.PartNumber != product.PartNumber)
            {
                var existingProduct = await dbContext.Products
                    .AnyAsync(p => p.PartNumber == request.PartNumber && p.Id != productId);

                if (existingProduct)
                {
                    loggerProductsController.Error($"Товар с артикулом '{request.PartNumber}' уже существует");
                    return Conflict(new { message = $"Товар с артикулом '{request.PartNumber}' уже существует" });
                }

                product.PartNumber = request.PartNumber;
                loggerProductsController.Info($"Артикул товара обновлен");
            }

            if (request.Categories_Id.HasValue && request.Categories_Id != product.Categories_Id)
            {
                var category = await dbContext.Categories.FindAsync(request.Categories_Id.Value);
                if (category == null)
                {
                    loggerProductsController.Error($"Указанная категория не существует");
                    return BadRequest(new { message = "Указанная категория не существует" });
                }

                product.Categories_Id = request.Categories_Id;
                loggerProductsController.Info($"Категория товара обновлена");
            }

            if (request.Manufacturers_Id.HasValue && request.Manufacturers_Id != product.Manufacturers_Id)
            {
                var manufacturer = await dbContext.Manufacturers.FindAsync(request.Manufacturers_Id.Value);
                if (manufacturer == null)
                {
                    loggerProductsController.Error($"Указанный бренд не существует");
                    return BadRequest(new { message = "Указанный бренд не существует" });
                }

                product.Manufacturers_Id = request.Manufacturers_Id;
                loggerProductsController.Info($"Бренд товара обновлен");
            }

            if (!string.IsNullOrEmpty(request.Name))
            {
                product.Name = request.Name;
                loggerProductsController.Info($"Название товара обновлено");
            }

            if (!string.IsNullOrEmpty(request.Details))
            {
                product.Details = request.Details;
                loggerProductsController.Info($"Описание товара обновлено");
            }

            if (!string.IsNullOrEmpty(request.Image))
            {
                product.Image = request.Image;
                loggerProductsController.Info($"Изображение товара обновлено");
            }

            await dbContext.SaveChangesAsync();
            loggerProductsController.Info($"Все изменения внесены в БД");

            return Ok(new { message = "Товар успешно обновлен" });
        }
        catch (Exception ex)
        {
            loggerProductsController.Error($"Внутренняя ошибка сервера: {ex.Message}");
            return StatusCode(500, new { message = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }

    [HttpDelete("admin-or-employee-panel-delete-product")]
    public async Task<IActionResult> DeleteProductControlPanelAsync(int productId)
    {
        try
        {
            var product = await dbContext.Products.FindAsync(productId);
            if (product == null)
            {
                loggerProductsController.Error($"Товар ({productId}) не найден");
                return NotFound(new { message = "Товар не найден" });
            }

            dbContext.Products.Remove(product);
            loggerProductsController.Info($"Товар удален");
            await dbContext.SaveChangesAsync();
            loggerProductsController.Info($"Все изменения внесены в БД");

            return Ok();
        }
        catch (Exception ex)
        {
            loggerProductsController.Error($"Внутренняя ошибка сервера: {ex.Message}");
            return StatusCode(500, new { message = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }
}