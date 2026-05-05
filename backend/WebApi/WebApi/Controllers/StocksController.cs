using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NLog;
using WebApi.Methods;
using WebApi.Models.DataBase;
using WebApi.Models.DTOs.StockManagement;

namespace WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class StocksController(ServerDbContext dbContext) : ControllerBase
{
    private Logger loggerStocksController = LogManager.GetCurrentClassLogger();

    [HttpGet]
    public async Task<ActionResult<IEnumerable<StocksModel>>> GetStocksAsync()
    {
        return await dbContext.Stocks.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<StocksModel>> GetStockByIdAsync(int id)
    {
        var stock = await dbContext.Stocks.FindAsync(id);
        if (stock == null)
        {
            loggerStocksController.Error($"Данного производителя ({id}) не существует");
            return NotFound(new
            {
                StatusCode = 404,
                Message = $"Данного производителя не существует",
                Timestamp = DateTime.Now
            });
        }

        return Ok(stock);
    }

    [HttpGet("management-stocks")]
    public async Task<IActionResult> GetManagementStocksAsync()
    {
        try
        {
            var stocks = await dbContext.Stocks.Include(s => s.Products).Include(s => s.Warehouses).ToListAsync();
            if (stocks.Count > 0)
            {
                loggerStocksController.Info($"Отстатки существуют..." + Environment.NewLine + $"Идет работа с ними...");
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
                            loggerStocksController.Info($"Добавление в коллекцию продуктов для отправки клиенту...");
                            productsDto.Add(new ProductsDto()
                            {
                                Id = stock.Products.Id,
                                NameProduct = stock.Products.Name,
                                PartNumber = stock.Products.PartNumber
                            });
                            loggerStocksController.Info($"Продукты успешно добавлены");
                        }
                    }

                    if (stock.Warehouses != null)
                    {
                        var existWarehousesDto = warehousesDto.Any(w => w.Code == stock.Warehouses.Code);
                        if (!existWarehousesDto)
                        {
                            loggerStocksController.Info($"Добавление в коллекцию складов для отправки клиенту...");
                            warehousesDto.Add(new WarehousesModel()
                            {
                                Id = stock.Warehouses.Id,
                                Code = stock.Warehouses.Code,
                                Name = stock.Warehouses.Name,
                                Type = stock.Warehouses.Type,
                                IsActive = stock.Warehouses.IsActive
                            });
                            loggerStocksController.Info($"Склады успешно добавлены");
                        }
                    }

                    loggerStocksController.Info($"Добавление в коллецию остатков для отправки клиенту...");
                    stocksDto.Add(new StocksModel()
                    {
                        Id = stock.Id,
                        Quantity = stock.Quantity,
                        Products_Id = stock.Products_Id,
                        Warehouses_Id = stock.Warehouses_Id,
                    });
                    loggerStocksController.Info($"Остатки успешно добавлены");

                    var existStocksManagement =
                        stocksManagement.Any(sm => sm.Products == productsDto || sm.Warehouses == warehousesDto);
                    if (!existStocksManagement)
                    {
                        loggerStocksController.Info($"Заполнение ответного DTO клиенту...");
                        stocksManagement.Add(new StockManagementDto()
                        {
                            Products = productsDto,
                            Warehouses = warehousesDto,
                            Stocks = stocksDto
                        });
                        loggerStocksController.Info($"Успешно заполнен ответный DTO");
                    }
                }

                loggerStocksController.Info($"Отправка данных клиенту");
                return Ok(stocksManagement);
            }
            else
            {
                loggerStocksController.Error($"Таблица остатков пустая");
                return BadRequest(new { message = $"Таблица остатков пустая" });
            }
        }
        catch (Exception ex)
        {
            loggerStocksController.Error($"Внутренняя ошибка сервера: {ex.Message}");
            return StatusCode(500, new { message = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }

    [HttpPut("update-stock")]
    public async Task<IActionResult> UpdateStockAsync(int stockId, int quantity)
    {
        try
        {
            var stocks = await dbContext.Stocks.FindAsync(stockId);
            if (stocks != null)
            {
                if (quantity <= 0)
                {
                    loggerStocksController.Error($"Остатки меньше или равны 0");
                    return BadRequest(new { message = $"Остатки меньше или равны 0" });
                }

                stocks.Quantity = quantity;
                loggerStocksController.Info($"Количество остатков обновлено");
                await dbContext.SaveChangesAsync();
                loggerStocksController.Info($"Все изменения внесены в БД");
                return Ok();
            }
            else
            {
                loggerStocksController.Error($"Остатки ({stockId}) не найдены в БД");
                return NotFound(new { message = $"Остатки не найдены" });
            }
        }
        catch (Exception ex)
        {
            loggerStocksController.Error($"Внутренняя ошибка сервера: {ex.Message}");
            return StatusCode(500, new { message = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }

    [HttpDelete("delete-stock")]
    public async Task<IActionResult> DeleteStockAsync(int stockId)
    {
        try
        {
            var stocks = await dbContext.Stocks.FindAsync(stockId);
            if (stocks != null)
            {
                dbContext.Stocks.Remove(stocks);
                loggerStocksController.Info($"Остатки ({stockId}) удалены");
                await dbContext.SaveChangesAsync();
                loggerStocksController.Info($"Все изменения внесены в БД");
                return Ok();
            }
            else
            {
                loggerStocksController.Error($"Остатки ({stockId}) не найдены в БД");
                return BadRequest(new { message = $"Остатки не найдены" });
            }
        }
        catch (Exception ex)
        {
            loggerStocksController.Error($"Внутренняя ошибка сервера: {ex.Message}");
            return StatusCode(500, new { message = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }

    [HttpPost("create-stock")]
    public async Task<IActionResult> CreateStockAsync([FromBody] StocksModel request)
    {
        try
        {
            var stocks = await dbContext.Stocks.Where(s =>
                    s.Products_Id == request.Products_Id && s.Warehouses_Id == request.Warehouses_Id)
                .ToListAsync();
            if (stocks.Count > 0)
            {
                loggerStocksController.Error($"Такие остатки уже существуют");
                return BadRequest(new { message = $"Такие остатки уже существуют" });
            }

            loggerStocksController.Info($"Создание новых остатков...");
            var newStock = new StocksModel()
            {
                Products_Id = request.Products_Id,
                Warehouses_Id = request.Warehouses_Id,
                Quantity = request.Quantity
            };
            await dbContext.Stocks.AddAsync(newStock);
            loggerStocksController.Info($"Добавление новых остатков");
            await dbContext.SaveChangesAsync();
            loggerStocksController.Info($"Все изменения внесены в БД");
            return Ok();
        }
        catch (Exception ex)
        {
            loggerStocksController.Error($"Внутренняя ошибка сервера: {ex.Message}");
            return StatusCode(500, new { message = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }
}