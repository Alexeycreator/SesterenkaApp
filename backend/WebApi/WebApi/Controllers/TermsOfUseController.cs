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