using Microsoft.Data.SqlClient;
using NLog;

namespace WebApi.Services;

public sealed class DatabaseBackupBackgroundService : BackgroundService
{
    private Logger loggerDatabaseBackupBackgroundService = LogManager.GetCurrentClassLogger();
    private readonly string dirPath = Path.Combine(Directory.GetCurrentDirectory(), "Backups");
    private string backupPath;
    private string databaseName;
    private readonly string? connectionString;
    private readonly string backupDateTime = DateTime.Now.ToString("yyyy-MM-dd");
    private string typePath;
    private string defaultBackupsPath;

    public DatabaseBackupBackgroundService()
    {
    }

    public DatabaseBackupBackgroundService(string? connectionString)
    {
        this.connectionString = connectionString;
        CheckExistDirPath();
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);
        loggerDatabaseBackupBackgroundService.Info($"Запущена фоновая задача для создания резервной копии БД.");
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                if (DateTime.Now.Hour == 0 && DateTime.Now.Minute == 0)
                {
                    loggerDatabaseBackupBackgroundService.Info(
                        $"Попытка создать ежедневную резервную копию БД в {DateTime.Now}");
                    await CreateBackupAsync();
                }
            }
            catch (Exception ex)
            {
                loggerDatabaseBackupBackgroundService.Error($"Неизвестная ошибка: {ex.Message}");
            }

            await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
        }
    }

    public override async Task StopAsync(CancellationToken cancellationToken)
    {
        try
        {
            loggerDatabaseBackupBackgroundService.Info($"Создание резервной копии при КОРРЕКТНОЙ остановке сервера.");
            await CreateBackupAsync();
        }
        catch (Exception ex)
        {
            loggerDatabaseBackupBackgroundService.Error($"Неизвестная ошибка: {ex.Message}");
        }

        await base.StopAsync(cancellationToken);
    }

    private void CheckExistDirPath()
    {
        if (!Directory.Exists(dirPath))
        {
            Directory.CreateDirectory(dirPath);
        }
    }

    private async Task CreateBackupAsync()
    {
        using (var connection = new SqlConnection(connectionString))
        {
            try
            {
                await connection.OpenAsync();
                loggerDatabaseBackupBackgroundService.Info($"Подключени к БД прошло успешно");
                databaseName = connection.Database;
                backupPath = Path.Combine(dirPath, $"backup_{databaseName}_{backupDateTime}.bak");
                typePath = "application";
                await ExecutingBackupCommand(connection, backupPath, typePath);
            }
            catch (SqlException ex)
            {
                defaultBackupsPath =
                    $@"C:\Program Files\Microsoft SQL Server\MSSQL15.SQLEXPRESS\MSSQL\Backup\backup_{databaseName}_{backupDateTime}.bak";
                typePath = "default";
                loggerDatabaseBackupBackgroundService.Error(
                    $"Ошибка при создании резервной копии по пути {backupPath}: {ex.Message}. Будет применен путь по умолчанию: {defaultBackupsPath}");
                await ExecutingBackupCommand(connection, defaultBackupsPath, typePath);
            }
            catch (Exception ex)
            {
                loggerDatabaseBackupBackgroundService.Error($"Неизвестная ошибка: {ex.Message}");
            }
        }
    }

    private async Task ExecutingBackupCommand(SqlConnection connection, string backupDatabasePath, string typeSavePath)
    {
        if (File.Exists(backupDatabasePath))
        {
            try
            {
                File.Delete(backupDatabasePath);
                loggerDatabaseBackupBackgroundService.Info($"Удален существующий файл: {backupDatabasePath}");
            }
            catch (Exception ex)
            {
                loggerDatabaseBackupBackgroundService.Error(ex,
                    $"Не удалось удалить существующий файл. Возможно, файл заблокирован SQL Server.");
            }
        }

        var command = new SqlCommand($@"
                    BACKUP DATABASE [{databaseName}] 
                    TO DISK = N'{backupDatabasePath}' 
                    WITH INIT, FORMAT,
                         STATS = 10", connection);

        await command.ExecuteNonQueryAsync();
        if (File.Exists(backupDatabasePath))
        {
            loggerDatabaseBackupBackgroundService.Info($"Резервная копия БД успешно создана.");
        }

        if (typeSavePath == "default")
        {
            CopyingBackupDefault(defaultBackupsPath, backupPath);
        }
    }

    private void CopyingBackupDefault(string oldFilePath, string newFilePath)
    {
        File.Copy(oldFilePath, newFilePath);
        loggerDatabaseBackupBackgroundService.Info(
            $"Резервная копия БД скопирована из {oldFilePath} и добавлена в {newFilePath}");
    }
}