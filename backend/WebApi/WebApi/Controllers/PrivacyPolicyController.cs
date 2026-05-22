using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NLog;
using WebApi.Methods;
using WebApi.Models.DataBase;

namespace WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class PrivacyPolicyController(ServerDbContext dbContext) : ControllerBase
{
    private Logger loggerPrivacyPolicyController = LogManager.GetCurrentClassLogger();
    private readonly string defaultSrcIcon = $"\ud83d\udccc";

    [HttpGet("get-all-privacy-policy")]
    public async Task<IActionResult> GetTermsOfUse()
    {
        try
        {
            var privacyPolicyData = await dbContext.PrivacyPolicy.ToListAsync();
            if (privacyPolicyData.Count > 0)
            {
                List<PrivacyPolicyModel> responsePrivacyPolicy = new List<PrivacyPolicyModel>();
                foreach (var privPol in privacyPolicyData)
                {
                    responsePrivacyPolicy.Add(new PrivacyPolicyModel()
                    {
                        Id = privPol.Id,
                        Content = ParsingStringData(privPol.Content),
                        Date = privPol.Date,
                        Icon = privPol.Icon,
                        Title = privPol.Title,
                    });
                }

                return Ok(responsePrivacyPolicy);
            }

            loggerPrivacyPolicyController.Error($"Данных о политике конфиденциальности не существует");
            return NotFound(new { message = $"Данных о политике конфиденциальности не существует" });
        }
        catch (Exception ex)
        {
            loggerPrivacyPolicyController.Error($"Внутренняя ошибка сервера: {ex.Message}");
            return StatusCode(500, new { message = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }

    [HttpPost("create-privacy-policy")]
    public async Task<IActionResult> CreatePrivacyPolicyAsync(int userId, [FromBody] PrivacyPolicyModel? request)
    {
        try
        {
            var user = await dbContext.Users.FindAsync(userId);
            if (user == null)
            {
                loggerPrivacyPolicyController.Error($"Пользователя (id = {userId}) не существует");
                return NotFound(new { message = $"Пользователя не существует" });
            }

            if (user.Role != "admin")
            {
                loggerPrivacyPolicyController.Error($"У пользователя {user.Login} недостаточно прав");
                return BadRequest(new { message = $"У пользователя {user.Login} недостаточно прав" });
            }

            if (request == null)
            {
                loggerPrivacyPolicyController.Error($"Данные пустые");
                return BadRequest(new { message = $"Данные пустые" });
            }

            if (string.IsNullOrEmpty(request.Title))
            {
                loggerPrivacyPolicyController.Error($"Заголовок политики конфиденциальности обязателен для заполнения");
                return BadRequest(new { message = $"Заголовок политики конфиденциальности обязателен для заполнения" });
            }

            if (string.IsNullOrEmpty(request.Content))
            {
                loggerPrivacyPolicyController.Error($"Описание политики конфиденциальности обязательно для заполнения");
                return BadRequest(new { message = $"Описание политики конфиденциальности обязательно для заполнения" });
            }

            if (Convert.ToDateTime(request.Date) > DateTime.Now.AddDays(1))
            {
                loggerPrivacyPolicyController.Error($"Дата опубликования должна быть актуальна на сегодняшний день");
                return BadRequest(new { message = $"Дата опубликования должна быть актуальна на сегодняшний день" });
            }

            loggerPrivacyPolicyController.Info($"Создание пункта политики конфиденциальности...");
            var newPrivacyPolicy = new PrivacyPolicyModel()
            {
                Date = request.Date,
                Title = request.Title,
                Content = request.Content,
                Icon = !string.IsNullOrEmpty(request.Icon) ? request.Icon : defaultSrcIcon
            };

            var existingPrivacyPolicy = await dbContext.PrivacyPolicy.Where(pp =>
                    pp.Date == newPrivacyPolicy.Date && pp.Title == newPrivacyPolicy.Title &&
                    pp.Content == newPrivacyPolicy.Content)
                .FirstOrDefaultAsync();
            if (existingPrivacyPolicy != null)
            {
                loggerPrivacyPolicyController.Error($"Данный пункт политики конфиденциальности уже существует");
                return BadRequest(new { message = $"Данный пункт политики конфиденциальности уже существует" });
            }

            await dbContext.PrivacyPolicy.AddAsync(newPrivacyPolicy);
            loggerPrivacyPolicyController.Info($"Новый пункт политики конфиденциальности успешно создан");
            await dbContext.SaveChangesAsync();
            loggerPrivacyPolicyController.Info($"Все изменения внесены в БД");

            return Ok();
        }
        catch (Exception ex)
        {
            loggerPrivacyPolicyController.Error($"Внутренняя ошибка сервера: {ex.Message}");
            return StatusCode(500, new { message = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }

    [HttpPut("update-privacy-policy")]
    public async Task<IActionResult> UpdatePrivacyPolicyAsync(int userId, [FromBody] PrivacyPolicyModel? request)
    {
        try
        {
            var user = await dbContext.Users.FindAsync(userId);
            if (user == null)
            {
                loggerPrivacyPolicyController.Error($"Пользователя (id = {userId}) не существует");
                return NotFound(new { message = $"Пользователя не существует" });
            }

            if (user.Role != "admin")
            {
                loggerPrivacyPolicyController.Error($"У пользователя {user.Login} недостаточно прав");
                return BadRequest(new { message = $"У пользователя {user.Login} недостаточно прав" });
            }

            if (request == null)
            {
                loggerPrivacyPolicyController.Error($"Данные пустые");
                return BadRequest(new { message = $"Данные пустые" });
            }

            var dbPrivacyPolicy = await dbContext.PrivacyPolicy.FindAsync(request.Id);
            if (dbPrivacyPolicy == null)
            {
                loggerPrivacyPolicyController.Error(
                    $"Данного пункта политики конфиденциальности (id = {request.Id}) не существует");
                return NotFound(new { message = $"Данного пункта политики конфиденциальности не существует" });
            }

            if (request.Title != dbPrivacyPolicy.Title)
            {
                dbPrivacyPolicy.Title = request.Title;
                loggerPrivacyPolicyController.Info($"Обновлено название пункта политики конфиденциальности");
            }

            if (request.Date != dbPrivacyPolicy.Date)
            {
                dbPrivacyPolicy.Date = request.Date;
                loggerPrivacyPolicyController.Info($"Обновлена дата пункта политики конфиденциальности");
            }

            if (request.Icon != dbPrivacyPolicy.Icon)
            {
                dbPrivacyPolicy.Icon = request.Icon;
                loggerPrivacyPolicyController.Info($"Обновлено изображение пункта политики конфиденциальности");
            }

            if (request.Content != dbPrivacyPolicy.Content)
            {
                dbPrivacyPolicy.Content = request.Content;
                loggerPrivacyPolicyController.Info($"Обновлено описание пункта политики конфиденциальности");
            }

            await dbContext.SaveChangesAsync();
            loggerPrivacyPolicyController.Info($"Все изменения внесены в БД");

            return Ok();
        }
        catch (Exception ex)
        {
            loggerPrivacyPolicyController.Error($"Внутренняя ошибка сервера: {ex.Message}");
            return StatusCode(500, new { message = $"Внутренняя ошибка сервера: {ex.Message}" });
        }
    }

    [HttpDelete("delete-privacy-policy")]
    public async Task<IActionResult> DeletePrivacyPolicyByIdAsync(int userId, int privacyPolicyId)
    {
        try
        {
            var user = await dbContext.Users.FindAsync(userId);
            if (user == null)
            {
                loggerPrivacyPolicyController.Error($"Пользователя (id = {userId}) не существует");
                return NotFound(new { message = $"Пользователя не существует" });
            }

            if (user.Role != "admin")
            {
                loggerPrivacyPolicyController.Error($"У пользователя {user.Login} недостаточно прав");
                return BadRequest(new { message = $"У пользователя {user.Login} недостаточно прав" });
            }

            var privacyPolicy = await dbContext.PrivacyPolicy.FindAsync(privacyPolicyId);
            if (privacyPolicy == null)
            {
                loggerPrivacyPolicyController.Error(
                    $"Пункта политики конфиденциальности (id = {privacyPolicyId}) не существует");
                return NotFound(new { message = $"Пункта политики конфиденциальности не существует" });
            }

            dbContext.PrivacyPolicy.Remove(privacyPolicy);
            loggerPrivacyPolicyController.Info($"Пункт политики конфиденциальности {privacyPolicyId} удален");
            await dbContext.SaveChangesAsync();
            loggerPrivacyPolicyController.Info($"Все изменения внесены в БД");

            return Ok();
        }
        catch (Exception ex)
        {
            loggerPrivacyPolicyController.Error($"Внутренняя ошибка сервера: {ex.Message}");
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