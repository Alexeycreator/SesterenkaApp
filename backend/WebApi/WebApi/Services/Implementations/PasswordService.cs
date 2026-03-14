using BCrypt.Net;
using NLog;
using WebApi.Services.Interfaces;

namespace WebApi.Services.Implementations;

public sealed class PasswordService : IPasswordService
{
    // Константа для workFactor - легко менять при необходимости
    private const int WorkFactor = 12;

    // Тип хэша (можно использовать BCryptEnhanced для лучшей защиты)
    private const HashType SelectedHashType = HashType.SHA384;
    private Logger loggerPasswordService = LogManager.GetCurrentClassLogger();

    public string HashPassword(string password)
    {
        try
        {
            // BCrypt.HashPassword с указанным workFactor
            // Enhanced версия использует SHA384 для дополнительной защиты
            return BCrypt.Net.BCrypt.HashPassword(password, WorkFactor);
        }
        catch (Exception ex)
        {
            loggerPasswordService.Error($"Ошибка при хэшировании пароля: {ex.Message}");
            throw new InvalidOperationException("Ошибка при хэшировании пароля", ex);
        }
    }

    public bool VerifyPassword(string password, string hash)
    {
        if (string.IsNullOrEmpty(password) || string.IsNullOrEmpty(hash))
            return false;

        try
        {
            return BCrypt.Net.BCrypt.Verify(password, hash);
        }
        catch
        {
            return false;
        }
    }

    public bool NeedsRehash(string hash)
    {
        try
        {
            // Проверяет, соответствует ли хэш текущим настройкам (workFactor и тип)
            return BCrypt.Net.BCrypt.PasswordNeedsRehash(hash, WorkFactor);
        }
        catch
        {
            // Если хэш поврежден или устарел, лучше перехэшировать
            return true;
        }
    }
}