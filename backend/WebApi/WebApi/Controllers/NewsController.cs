using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NLog;
using WebApi.Methods;
using WebApi.Models.DataBase;

namespace WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class NewsController(ServerDbContext dbContext) : ControllerBase
{
    private Logger loggerNewsController = LogManager.GetCurrentClassLogger();

    [HttpGet("get-all-news")]
    public async Task<IActionResult> GetNews()
    {
        try
        {
            var newsData = await dbContext.News.ToListAsync();
            if (newsData.Count > 0)
            {
                List<NewsModel> responseNews = new List<NewsModel>();
                foreach (var news in newsData)
                {
                    if (string.IsNullOrEmpty(news.Image))
                    {
                        news.Image =
                            $"https://static.1tv.ru/uploads/video/material/splash/2021/11/24/696413/big/696413_big_48f94a3545.jpg";
                    }

                    responseNews.Add(new NewsModel()
                    {
                        Id = news.Id,
                        Body = news.Body,
                        Date = news.Date,
                        Image = news.Image,
                        Theme = news.Theme,
                        Type = news.Type
                    });
                }

                return Ok(responseNews);
            }

            loggerNewsController.Error($"Данных о новостей не существует");
            return NotFound(new { message = $"Данных о новостей не существует" });
        }
        catch (Exception ex)
        {
            loggerNewsController.Error($"Внутренняя ошибка сервера: {ex.Message}");
            return StatusCode(500, new { message = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }
}