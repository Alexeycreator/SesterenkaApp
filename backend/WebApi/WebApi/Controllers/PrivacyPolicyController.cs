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