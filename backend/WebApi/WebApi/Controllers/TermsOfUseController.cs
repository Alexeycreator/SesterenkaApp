using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NLog;
using WebApi.Methods;
using WebApi.Models.DataBase;

namespace WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class TermsOfUseController(ServerDbContext dbContext) : ControllerBase
{
    private Logger loggerTermsOfUseController = LogManager.GetCurrentClassLogger();
    private readonly string defaultSrcIcon = $"\ud83d\udccc";

    [HttpGet("get-all-terms-of-use")]
    public async Task<IActionResult> GetTermsOfUse()
    {
        try
        {
            var termsOfUseData = await dbContext.TermsOfUse.ToListAsync();
            if (termsOfUseData.Count > 0)
            {
                List<TermsOfUseModel> responseTermsOfUse = new List<TermsOfUseModel>();
                foreach (var tou in termsOfUseData)
                {
                    responseTermsOfUse.Add(new TermsOfUseModel()
                    {
                        Id = tou.Id,
                        Content = ParsingStringData(tou.Content),
                        Date = tou.Date,
                        Icon = tou.Icon,
                        Title = tou.Title,
                    });
                }

                return Ok(responseTermsOfUse);
            }

            loggerTermsOfUseController.Error($"Данных об условиях эксплуатации не существует");
            return NotFound(new { message = $"Данных об условиях эксплуатации не существует" });
        }
        catch (Exception ex)
        {
            loggerTermsOfUseController.Error($"Внутренняя ошибка сервера: {ex.Message}");
            return StatusCode(500, new { message = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }

    [HttpPost("create-terms-of-use")]
    public async Task<IActionResult> CreateTermsOfUseAsync(int userId, [FromBody] TermsOfUseModel? request)
    {
        try
        {
            var user = await dbContext.Users.FindAsync(userId);
            if (user == null)
            {
                loggerTermsOfUseController.Error($"Пользователя (id = {userId}) не существует");
                return NotFound(new { message = $"Пользователя не существует" });
            }

            if (user.Role != "admin")
            {
                loggerTermsOfUseController.Error($"У пользователя {user.Login} недостаточно прав");
                return BadRequest(new { message = $"У пользователя {user.Login} недостаточно прав" });
            }

            if (request == null)
            {
                loggerTermsOfUseController.Error($"Данные пустые");
                return BadRequest(new { message = $"Данные пустые" });
            }

            if (string.IsNullOrEmpty(request.Title))
            {
                loggerTermsOfUseController.Error($"Заголовок условия эксплуатации обязателен для заполнения");
                return BadRequest(new { message = $"Заголовок условия эксплуатации обязателен для заполнения" });
            }

            if (string.IsNullOrEmpty(request.Content))
            {
                loggerTermsOfUseController.Error($"Описание условия эксплуатации обязательно для заполнения");
                return BadRequest(new { message = $"Описание условия эксплуатации обязательно для заполнения" });
            }

            if (Convert.ToDateTime(request.Date) > DateTime.Now.AddDays(1))
            {
                loggerTermsOfUseController.Error($"Дата опубликования должна быть актуальна на сегодняшний день");
                return BadRequest(new { message = $"Дата опубликования должна быть актуальна на сегодняшний день" });
            }

            loggerTermsOfUseController.Info($"Создание пункта условия эксплуатации...");
            var newTermsOfUse = new TermsOfUseModel()
            {
                Date = request.Date,
                Title = request.Title,
                Content = request.Content,
                Icon = !string.IsNullOrEmpty(request.Icon) ? request.Icon : defaultSrcIcon
            };

            var existingPrivacyPolicy = await dbContext.PrivacyPolicy.Where(pp =>
                    pp.Date == newTermsOfUse.Date && pp.Title == newTermsOfUse.Title &&
                    pp.Content == newTermsOfUse.Content)
                .FirstOrDefaultAsync();
            if (existingPrivacyPolicy != null)
            {
                loggerTermsOfUseController.Error($"Данный пункт условия эксплуатации уже существует");
                return BadRequest(new { message = $"Данный пункт условия эксплуатации уже существует" });
            }

            await dbContext.TermsOfUse.AddAsync(newTermsOfUse);
            loggerTermsOfUseController.Info($"Новый пункт условия эксплуатации успешно создан");
            await dbContext.SaveChangesAsync();
            loggerTermsOfUseController.Info($"Все изменения внесены в БД");

            return Ok();
        }
        catch (Exception ex)
        {
            loggerTermsOfUseController.Error($"Внутренняя ошибка сервера: {ex.Message}");
            return StatusCode(500, new { message = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }

    [HttpPut("update-terms-of-use")]
    public async Task<IActionResult> UpdateTermsOfUseAsync(int userId, [FromBody] TermsOfUseModel? request)
    {
        try
        {
            var user = await dbContext.Users.FindAsync(userId);
            if (user == null)
            {
                loggerTermsOfUseController.Error($"Пользователя (id = {userId}) не существует");
                return NotFound(new { message = $"Пользователя не существует" });
            }

            if (user.Role != "admin")
            {
                loggerTermsOfUseController.Error($"У пользователя {user.Login} недостаточно прав");
                return BadRequest(new { message = $"У пользователя {user.Login} недостаточно прав" });
            }

            if (request == null)
            {
                loggerTermsOfUseController.Error($"Данные пустые");
                return BadRequest(new { message = $"Данные пустые" });
            }

            var dbTermsOfUse = await dbContext.TermsOfUse.FindAsync(request.Id);
            if (dbTermsOfUse == null)
            {
                loggerTermsOfUseController.Error(
                    $"Данного пункта условия эксплуатации (id = {request.Id}) не существует");
                return NotFound(new { message = $"Данного пункта условия эксплуатации не существует" });
            }

            if (request.Title != dbTermsOfUse.Title)
            {
                dbTermsOfUse.Title = request.Title;
                loggerTermsOfUseController.Info($"Обновлено название пункта условия эксплуатации");
            }

            if (request.Date != dbTermsOfUse.Date)
            {
                dbTermsOfUse.Date = request.Date;
                loggerTermsOfUseController.Info($"Обновлена дата пункта условия эксплуатации");
            }

            if (request.Icon != dbTermsOfUse.Icon)
            {
                dbTermsOfUse.Icon = request.Icon;
                loggerTermsOfUseController.Info($"Обновлено изображение пункта условия эксплуатации");
            }

            if (request.Content != dbTermsOfUse.Content)
            {
                dbTermsOfUse.Content = request.Content;
                loggerTermsOfUseController.Info($"Обновлено описание пункта условия эксплуатации");
            }

            await dbContext.SaveChangesAsync();
            loggerTermsOfUseController.Info($"Все изменения внесены в БД");

            return Ok();
        }
        catch (Exception ex)
        {
            loggerTermsOfUseController.Error($"Внутренняя ошибка сервера: {ex.Message}");
            return StatusCode(500, new { message = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }

    [HttpDelete("delete-terms-of-use")]
    public async Task<IActionResult> DeleteTermsOfUseByIdAsync(int userId, int termsOfUseId)
    {
        try
        {
            var user = await dbContext.Users.FindAsync(userId);
            if (user == null)
            {
                loggerTermsOfUseController.Error($"Пользователя (id = {userId}) не существует");
                return NotFound(new { message = $"Пользователя не существует" });
            }

            if (user.Role != "admin")
            {
                loggerTermsOfUseController.Error($"У пользователя {user.Login} недостаточно прав");
                return BadRequest(new { message = $"У пользователя {user.Login} недостаточно прав" });
            }

            var termsOfUse = await dbContext.TermsOfUse.FindAsync(termsOfUseId);
            if (termsOfUse == null)
            {
                loggerTermsOfUseController.Error(
                    $"Пункта условия эксплуатации (id = {termsOfUseId}) не существует");
                return NotFound(new { message = $"Пункта условия эксплуатации не существует" });
            }

            dbContext.TermsOfUse.Remove(termsOfUse);
            loggerTermsOfUseController.Info($"Пункт условия эксплуатации {termsOfUseId} удален");
            await dbContext.SaveChangesAsync();
            loggerTermsOfUseController.Info($"Все изменения внесены в БД");

            return Ok();
        }
        catch (Exception ex)
        {
            loggerTermsOfUseController.Error($"Внутренняя ошибка сервера: {ex.Message}");
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