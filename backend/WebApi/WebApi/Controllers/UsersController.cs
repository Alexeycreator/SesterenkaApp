using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using NLog;
using WebApi.Methods;
using WebApi.Models.DataBase;
using WebApi.Models.DTOs.Auth;
using WebApi.Models.DTOs.User;
using WebApi.Services.Interfaces;

namespace WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class UsersController(
    ServerDbContext dbContext,
    IPasswordService passwordService,
    IConfiguration configuration,
    IPasswordHasher passwordHasher) : ControllerBase
{
    private Logger loggerUsersController = LogManager.GetCurrentClassLogger();

    [HttpGet]
    public async Task<ActionResult<IEnumerable<UsersModel>>> GetUsersAsync()
    {
        return await dbContext.Users.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<UsersModel>> GetUsersByIdAsync(int id)
    {
        var user = await dbContext.Users.FindAsync(id);
        if (user == null)
        {
            loggerUsersController.Error($"Данного пользователя ({id}) не существует");
            return NotFound(new
            {
                StatusCode = 404,
                Message = $"Данного пользователя не существует",
                Timestamp = DateTime.Now
            });
        }

        return Ok(user);
    }

    [HttpPost("register")]
    public async Task<ActionResult<UserResponseDto>> RegisterAsync(CreateUserDto createDto)
    {
        try
        {
            if (await dbContext.Users.AnyAsync(c => c.Login == createDto.Login))
            {
                loggerUsersController.Error($"Логин ({createDto.Login}) уже существует");
                return Conflict(new { message = "Логин уже существует" });
            }

            if (await dbContext.Users.AnyAsync(c => c.Email == createDto.Email))
            {
                loggerUsersController.Error($"Email ({createDto.Email}) уже существует");
                return Conflict(new { message = "Email уже существует" });
            }

            if (await dbContext.Users.AnyAsync(c => c.PhoneNumber == createDto.PhoneNumber))
            {
                loggerUsersController.Error($"Телефон ({createDto.PhoneNumber}) уже существует");
                return Conflict(new { message = "Телефон уже существует" });
            }

            string hashedPassword = passwordService.HashPassword(createDto.Password);
            loggerUsersController.Info($"Пароль захэширован для пользователя {createDto.Login}");

            var user = new UsersModel
            {
                SecondName = createDto.SecondName,
                FirstName = createDto.FirstName,
                SurName = createDto.SurName,
                Gender = createDto.Gender,
                Birthday = createDto.Birthday,
                Age = createDto.Age,
                PhoneNumber = createDto.PhoneNumber,
                Email = createDto.Email,
                Login = createDto.Login,
                Password = createDto.Password,
                PasswordHash = hashedPassword,
                Role = createDto.Role,
                Position = createDto.Position,
                LoginAttempts = 0,
            };

            dbContext.Users.Add(user);
            loggerUsersController.Info($"Пользователь добавлен");
            await dbContext.SaveChangesAsync();
            loggerUsersController.Info($"Все изменения внесены в БД");

            // Возвращаем данные без пароля
            var response = new UserResponseDto
            {
                Id = user.Id,
                SecondName = user.SecondName,
                FirstName = user.FirstName,
                SurName = user.SurName,
                PhoneNumber = user.PhoneNumber,
                Email = user.Email,
                Login = user.Login,
                Age = user.Age,
                Birthday = user.Birthday,
                Gender = user.Gender,
                Role = user.Role,
                Position = user.Position
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            loggerUsersController.Error(ex, "Ошибка при регистрации пользователя {Login}", createDto.Login);
            return StatusCode(500, new { message = "Внутренняя ошибка сервера: " + ex.Message });
        }
    }

    [HttpPost("login")]
    public async Task<ActionResult<LoginResponseDto>> LoginAsync(LoginRequestDto loginDto)
    {
        try
        {
            // Ищем пользователя по логину
            var client = await dbContext.Users
                .FirstOrDefaultAsync(c =>
                    c.Login == loginDto.Login ||
                    c.Email == loginDto.Login ||
                    c.PhoneNumber == loginDto.Login);

            // Проверяем существование
            if (client == null)
            {
                loggerUsersController.Warn("Попытка входа с несуществующим логином: {Login}", loginDto.Login);
                return Unauthorized(new { message = "Неверный логин или пароль" });
            }

            // Проверка блокировки
            if (client.LockoutEnd.HasValue && client.LockoutEnd > DateTime.UtcNow)
            {
                loggerUsersController.Warn("Попытка входа заблокированного пользователя: {Login}", loginDto.Login);
                return Unauthorized(new
                {
                    message = $"Аккаунт заблокирован до {client.LockoutEnd:dd.MM.yyyy HH:mm}"
                });
            }

            bool isPasswordValid = false;

            // 1. Сначала проверяем по хэшу (PasswordHash)
            if (!string.IsNullOrEmpty(client.PasswordHash))
            {
                isPasswordValid = passwordService.VerifyPassword(loginDto.Password, client.PasswordHash);

                // Если хэш устарел, но пароль верный - обновляем хэш
                if (isPasswordValid && passwordService.NeedsRehash(client.PasswordHash))
                {
                    loggerUsersController.Info("Обновление устаревшего хэша для пользователя: {Login}",
                        loginDto.Login);
                    client.PasswordHash = passwordService.HashPassword(loginDto.Password);
                }
            }

            // 2. Если нет хэша или проверка по хэшу не прошла - проверяем по оригинальному паролю
            if (!isPasswordValid && !string.IsNullOrEmpty(client.Password))
            {
                isPasswordValid = client.Password == loginDto.Password;

                // Если пароль верный - создаем хэш для будущих входов
                if (isPasswordValid)
                {
                    loggerUsersController.Info("Создание хэша для пользователя с оригинальным паролем: {Login}",
                        loginDto.Login);
                    client.PasswordHash = passwordService.HashPassword(loginDto.Password);
                }
            }

            // Обработка неудачных попыток входа
            if (!isPasswordValid)
            {
                client.LoginAttempts++;

                // Блокировка после 5 неудачных попыток
                if (client.LoginAttempts >= 5)
                {
                    client.LockoutEnd = DateTime.UtcNow.AddMinutes(15);
                    loggerUsersController.Warn("Пользователь {Login} заблокирован на 15 минут", loginDto.Login);
                }

                await dbContext.SaveChangesAsync();

                loggerUsersController.Warn("Неверный пароль для пользователя: {Login}. Попытка {Attempts}",
                    loginDto.Login, client.LoginAttempts);

                return Unauthorized(new { message = "Неверный логин или пароль" });
            }

            // Сброс счетчика неудачных попыток при успешном входе
            client.LoginAttempts = 0;
            client.LockoutEnd = null;
            client.LastLoginAt = DateTime.UtcNow;

            await dbContext.SaveChangesAsync();

            loggerUsersController.Info("Успешный вход пользователя: {Login}", loginDto.Login);

            // Генерация JWT токена
            var token = GenerateJwtToken(client);

            var response = new LoginResponseDto
            {
                Token = token,
                Expiry = DateTime.UtcNow.AddHours(1),
                User = new UserResponseDto
                {
                    Id = client.Id,
                    SecondName = client.SecondName,
                    FirstName = client.FirstName,
                    SurName = client.SurName,
                    PhoneNumber = client.PhoneNumber,
                    Email = client.Email,
                    Login = client.Login,
                    Age = client.Age,
                    Birthday = client.Birthday,
                    Gender = client.Gender,
                    Role = client.Role
                }
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            loggerUsersController.Error(ex, "Ошибка при входе пользователя {Login}", loginDto.Login);
            return StatusCode(500, new { message = "Внутренняя ошибка сервера" });
        }
    }

    private string GenerateJwtToken(UsersModel client)
    {
        var jwtSettings = configuration.GetSection("Jwt");
        var key = Encoding.UTF8.GetBytes(jwtSettings["Key"]);

        // 1. СОЗДАЕМ CLAIMS (утверждения о пользователе)
        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, client.Id.ToString()), // Subject (ID)
            new Claim(JwtRegisteredClaimNames.Name, client.Login), // Имя пользователя
            new Claim(JwtRegisteredClaimNames.Email, client.Email), // Email
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()), // Уникальный ID токена
            new Claim("fullName", $"{client.SurName} {client.FirstName}"), // Кастомный claim
            new Claim("phoneNumber", client.PhoneNumber) // Кастомный claim
        };

        // Добавляем роль если есть
        // if (client.IsAdmin) claims.Add(new Claim(ClaimTypes.Role, "Admin"));

        // 2. СОЗДАЕМ КЛЮЧ ПОДПИСИ
        var securityKey = new SymmetricSecurityKey(key);
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        // 3. СОЗДАЕМ ТОКЕН
        var token = new JwtSecurityToken(
            issuer: jwtSettings["Issuer"],
            audience: jwtSettings["Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(int.Parse(jwtSettings["ExpiryInHours"] ?? "1")),
            signingCredentials: credentials
        );

        // 4. ВОЗВРАЩАЕМ СТРОКУ ТОКЕНА
        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private int CalculateAge(DateOnly birthday)
    {
        var today = DateOnly.FromDateTime(DateTime.Today);
        var age = today.Year - birthday.Year;
        if (birthday > today.AddYears(-age)) age--;
        return age;
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUserAsync(int id, UpdateUserDto userDto)
    {
        var existsUser = await dbContext.Users.FindAsync(id);
        if (existsUser == null)
        {
            loggerUsersController.Error($"Пользователя не существует!");
            return NotFound(new
            {
                StatusCode = 404,
                Error = "NotFound",
                Message = $"Пользователя не существует!",
                Timestamp = DateTime.Now,
            });
        }

        if (userDto.SecondName != null)
        {
            existsUser.SecondName = userDto.SecondName;
            loggerUsersController.Info($"Фамилия обновлена");
        }

        if (userDto.FirstName != null)
        {
            existsUser.FirstName = userDto.FirstName;
            loggerUsersController.Info($"Имя обновлено");
        }

        if (userDto.SurName != null)
        {
            existsUser.SurName = userDto.SurName;
            loggerUsersController.Info($"Отчество обновлено");
        }

        if (userDto.Gender != null)
        {
            existsUser.Gender = userDto.Gender;
            loggerUsersController.Info($"Пол обновлен");
        }

        if (userDto.Birthday.HasValue)
        {
            existsUser.Birthday = userDto.Birthday.Value;
            loggerUsersController.Info($"Дата рождения обновлена");
            existsUser.Age = CalculateAge(userDto.Birthday.Value);
            loggerUsersController.Info($"Возраст обновлен");
        }

        if (userDto.Age.HasValue)
        {
            existsUser.Age = userDto.Age.Value;
            loggerUsersController.Info($"Возраст обновлен");
        }

        if (userDto.PhoneNumber != null)
        {
            existsUser.PhoneNumber = userDto.PhoneNumber;
            loggerUsersController.Info($"Номер телефона обновлен");
        }

        if (userDto.Email != null)
        {
            existsUser.Email = userDto.Email;
            loggerUsersController.Info($"Email обновлен");
        }

        // Смена пароля
        if (!string.IsNullOrEmpty(userDto.NewPassword))
        {
            // Проверяем старый пароль
            if (string.IsNullOrEmpty(userDto.CurrentPassword) ||
                !passwordHasher.VerifyPassword(userDto.CurrentPassword, existsUser.PasswordHash))
            {
                loggerUsersController.Error($"Неверный текущий пароль");
                return BadRequest(new { Message = "Неверный текущий пароль" });
            }

            // Устанавливаем новый пароль
            existsUser.Password = userDto.NewPassword;
            existsUser.PasswordHash = passwordHasher.HashPassword(userDto.NewPassword);
            loggerUsersController.Info($"Установлен новый пароль");
        }

        await dbContext.SaveChangesAsync();
        loggerUsersController.Info($"Все изменения внесены в БД");

        return NoContent();
    }

    [HttpPut("changePassword")]
    public async Task<IActionResult> UpdatePasswordUserAsync(int userId, string oldPassword, string newPassword)
    {
        try
        {
            var user = await dbContext.Users.FindAsync(userId);
            if (user != null)
            {
                if (user.Password == newPassword)
                {
                    loggerUsersController.Error($"Старый и новый пароли совпадают");
                    return Unauthorized(new { Message = "Старый и новый пароли совпадают" });
                }

                if (oldPassword != newPassword)
                {
                    user.Password = newPassword;
                    user.PasswordHash = passwordHasher.HashPassword(newPassword);
                    loggerUsersController.Info($"Пароль изменен");
                    await dbContext.SaveChangesAsync();
                    loggerUsersController.Info($"Все изменения внесены в БД");
                    return Ok();
                }
                else
                {
                    loggerUsersController.Error($"Старый и новый пароли совпадают");
                    return Unauthorized(new { Message = "Старый и новый пароли совпадают" });
                }
            }
            else
            {
                loggerUsersController.Error($"Пользователя не существует!");
                return NotFound(new
                {
                    StatusCode = 404,
                    Error = "NotFound",
                    Message = $"Пользователя не существует!",
                    Timestamp = DateTime.Now,
                });
            }
        }
        catch (DbUpdateException ex)
        {
            loggerUsersController.Error($"Ошибка базы данных: {ex.Message}");
            return StatusCode(500, new { message = $"Ошибка базы данных: {ex.Message}" });
        }
        catch (Exception ex)
        {
            loggerUsersController.Error($"Внутрення ошибка сервера: {ex.Message}");
            return StatusCode(500, new { message = "Внутрення ошибка сервера", error = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUserAsync(int id)
    {
        var user = await dbContext.Users.FirstOrDefaultAsync(u => u.Id == id);
        if (user == null)
        {
            loggerUsersController.Error($"Такого пользователя ({id}) не существует!");
            return NotFound(new
            {
                StatusCode = 404,
                Error = "NotFound",
                Message = $"Такого пользователя не существует!",
                Timestamp = DateTime.Now,
            });
        }

        dbContext.Users.Remove(user);
        loggerUsersController.Info($"Пользователь удален");
        await dbContext.SaveChangesAsync();
        loggerUsersController.Info($"Все изменения внесены в БД");

        return Ok(new
        {
            StatusCode = 200,
            Message = "Пользователь успешно удален",
            DeletedId = id,
            Timestamp = DateTime.UtcNow
        });
    }

    [HttpPut("update-role-user")]
    public async Task<IActionResult> UpdateUserRoleAsync(int userId, string newRole)
    {
        try
        {
            var user = await dbContext.Users.FindAsync(userId);
            if (user == null)
            {
                loggerUsersController.Error($"Пользователь ({userId}) не найден");
                return NotFound(new { message = $"Пользователь не найден" });
            }

            if (user.Role == newRole)
            {
                loggerUsersController.Error($"Старая и новая роль пользователя совпадают");
                return BadRequest(new { message = $"Старая и новая роль пользователя совпадают" });
            }
            else
            {
                user.Role = newRole;
                loggerUsersController.Info($"Роль пользователя изменена");
                user = CheckPosition(user);
                var information = await dbContext.Informations.FirstOrDefaultAsync(i => i.Users_Id == user.Id);
                if (user.Position == "администратор" || user.Position == "сотрудник")
                {
                    if (information == null)
                    {
                        var newInformation = new InformationsModel()
                        {
                            AboutUs = null,
                            Questions = null,
                            OurMission = null,
                            OurValues = null,
                            Users_Id = user.Id,
                            Addresses_Id = null
                        };

                        await dbContext.Informations.AddAsync(newInformation);
                    }
                }
                else
                {
                    if (information != null)
                    {
                        dbContext.Informations.Remove(information);
                    }
                }

                await dbContext.SaveChangesAsync();
                loggerUsersController.Info($"Все изменения внесены в БД");
            }

            return Ok(new
            {
                StatusCode = 200,
                Message = $"Роль пользователя {user.Login} успешно изменена",
                NewRole = newRole,
                Timestamp = DateTime.Now
            });
        }
        catch (Exception ex)
        {
            loggerUsersController.Error($"{ex.Message}");
            return StatusCode(500, new { message = "Ошибка при обновлении", error = ex.Message });
        }
    }

    private UsersModel CheckPosition(UsersModel user)
    {
        switch (user.Role)
        {
            case "user":
                user.Position = "пользователь";
                break;
            case "employee":
                user.Position = "сотрудник";
                break;
            case "admin":
                user.Position = "администратор";
                break;
            default:
                loggerUsersController.Error($"Роль {user.Role} не существует в БД. Для нее нет позиции.");
                throw new ArgumentException($"Роль {user.Role} не существует в БД. Для нее нет позиции.");
        }

        loggerUsersController.Info($"Изменена позиция пользователя на {user.Position}");

        return user;
    }
}