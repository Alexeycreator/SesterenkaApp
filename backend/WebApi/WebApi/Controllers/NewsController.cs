using System.Text;
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
    private readonly string defaultSrcImage = $"Images/News/default.png";

    [HttpGet("get-all-news")]
    public async Task<IActionResult> GetNewsAsync()
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
                        Body = ParsingStringData(news.Body),
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

    [HttpPost("create-news")]
    public async Task<IActionResult> CreateNewsAsync(int userId, [FromBody] NewsModel? request)
    {
        try
        {
            var user = await dbContext.Users.FindAsync(userId);
            if (user == null)
            {
                loggerNewsController.Error($"Пользователя (id = {userId}) не существует");
                return NotFound(new { message = $"Пользователя не существует" });
            }

            if (user.Role != "admin")
            {
                loggerNewsController.Error($"У пользователя {user.Login} недостаточно прав");
                return BadRequest(new { message = $"У пользователя {user.Login} недостаточно прав" });
            }

            if (request == null)
            {
                loggerNewsController.Error($"Данные пустые");
                return BadRequest(new { message = $"Данные пустые" });
            }

            if (string.IsNullOrEmpty(request.Type))
            {
                loggerNewsController.Error($"Тип новости обязателен для заполнения");
                return BadRequest(new { message = $"Тип новости обязателен для заполнения" });
            }

            if (string.IsNullOrEmpty(request.Body))
            {
                loggerNewsController.Error($"Описание новости обязательно для заполнения");
                return BadRequest(new { message = $"Описание новости обязательно для заполнения" });
            }

            if (string.IsNullOrEmpty(request.Theme))
            {
                loggerNewsController.Error($"Тема новости обязательна для заполнения");
                return BadRequest(new { message = $"Тема новости обязательна для заполнения" });
            }

            if (Convert.ToDateTime(request.Date) > DateTime.Now.AddDays(1))
            {
                loggerNewsController.Error($"Дата опубликования должна быть актуальна на сегодняшний день");
                return BadRequest(new { message = $"Дата опубликования должна быть актуальна на сегодняшний день" });
            }

            loggerNewsController.Info($"Создание новости...");
            var newNews = new NewsModel
            {
                Date = request.Date,
                Body = request.Body,
                Theme = request.Theme,
                Type = request.Type,
                Image = !string.IsNullOrEmpty(request.Image) ? request.Image : defaultSrcImage
            };

            var existingNews = await dbContext.News.Where(n =>
                    n.Date == newNews.Date && n.Body == newNews.Body && n.Theme == newNews.Theme &&
                    n.Type == newNews.Type)
                .FirstOrDefaultAsync();
            if (existingNews != null)
            {
                loggerNewsController.Error($"Данная новость уже существует");
                return BadRequest(new { message = $"Данная новость уже существует" });
            }

            await dbContext.News.AddAsync(newNews);
            loggerNewsController.Info($"Новость успешно создана");
            await dbContext.SaveChangesAsync();
            loggerNewsController.Info($"Все изменения внесены в БД");

            return Ok();
        }
        catch (Exception ex)
        {
            loggerNewsController.Error($"Внутренняя ошибка сервера: {ex.Message}");
            return StatusCode(500, new { message = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }

    [HttpPut("update-news")]
    public async Task<IActionResult> UpdateNewsAsync(int userId, [FromBody] NewsModel? request)
    {
        try
        {
            var user = await dbContext.Users.FindAsync(userId);
            if (user == null)
            {
                loggerNewsController.Error($"Пользователя (id = {userId}) не существует");
                return NotFound(new { message = $"Пользователя не существует" });
            }

            if (user.Role != "admin")
            {
                loggerNewsController.Error($"У пользователя {user.Login} недостаточно прав");
                return BadRequest(new { message = $"У пользователя {user.Login} недостаточно прав" });
            }

            if (request == null)
            {
                loggerNewsController.Error($"Данные пустые");
                return BadRequest(new { message = $"Данные пустые" });
            }

            var dbNews = await dbContext.News.FindAsync(request.Id);
            if (dbNews == null)
            {
                loggerNewsController.Error($"Данной новости (id = {request.Id}) не существует");
                return NotFound(new { message = $"Данной новости не существует" });
            }

            if (request.Body != dbNews.Body)
            {
                dbNews.Body = request.Body;
                loggerNewsController.Info($"Обновлено описание новости");
            }

            if (request.Theme != dbNews.Theme)
            {
                dbNews.Theme = request.Theme;
                loggerNewsController.Info($"Обновлена тема новости");
            }

            if (request.Image != dbNews.Image)
            {
                dbNews.Image = request.Image;
                loggerNewsController.Info($"Обновлено изображение новости");
            }

            if (request.Date != dbNews.Date)
            {
                dbNews.Date = request.Date;
                loggerNewsController.Info($"Обновлена дата публикации новости");
            }

            if (request.Type != dbNews.Type)
            {
                dbNews.Type = request.Type;
                loggerNewsController.Info($"Обновлен тип новости");
            }

            await dbContext.SaveChangesAsync();
            loggerNewsController.Info($"Все изменения внесены в БД");

            return Ok();
        }
        catch (Exception ex)
        {
            loggerNewsController.Error($"Внутренняя ошибка сервера: {ex.Message}");
            return StatusCode(500, new { message = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }

    [HttpDelete("delete-news")]
    public async Task<IActionResult> DeleteNewsByIdAsync(int userId, int newsId)
    {
        try
        {
            var user = await dbContext.Users.FindAsync(userId);
            if (user == null)
            {
                loggerNewsController.Error($"Пользователя (id = {userId}) не существует");
                return NotFound(new { message = $"Пользователя не существует" });
            }

            if (user.Role != "admin")
            {
                loggerNewsController.Error($"У пользователя {user.Login} недостаточно прав");
                return BadRequest(new { message = $"У пользователя {user.Login} недостаточно прав" });
            }

            var news = await dbContext.News.FindAsync(newsId);
            if (news == null)
            {
                loggerNewsController.Error($"Новости (id = {newsId}) не существует");
                return NotFound(new { message = $"Данной новости не существует" });
            }

            dbContext.News.Remove(news);
            loggerNewsController.Info($"Новость {newsId} удалена");
            await dbContext.SaveChangesAsync();
            loggerNewsController.Info($"Все изменения внесены в БД");


            return Ok();
        }
        catch (Exception ex)
        {
            loggerNewsController.Error($"Внутренняя ошибка сервера: {ex.Message}");
            return StatusCode(500, new { message = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }

    private string ParsingStringData(string text)
    {
        if (string.IsNullOrEmpty(text))
        {
            throw new ArgumentNullException(nameof(text), "Текст не может быть null или пустым");
        }

        const char separator = ';';
        if (!text.Contains(separator))
        {
            return text;
        }

        StringBuilder parsingBuilder = new StringBuilder();
        string[] parts = text.Split(separator);

        for (int i = 0; i < parts.Length; i++)
        {
            string trimmedPart = parts[i].Trim();
            if (!string.IsNullOrEmpty(trimmedPart))
            {
                parsingBuilder.Append(trimmedPart);

                if (i < parts.Length - 1)
                {
                    parsingBuilder.AppendLine();
                }
            }
        }

        return parsingBuilder.ToString();
    }
}