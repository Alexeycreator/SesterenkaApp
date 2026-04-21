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
    public async Task<ActionResult<IEnumerable<UsersModel>>> GetUsers()
    {
        return await dbContext.Users.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<UsersModel>> GetUser(int id)
    {
        var user = await dbContext.Users.FindAsync(id);
        if (user == null)
        {
            return NotFound(new
            {
                StatusCode = 404,
                Message = $"Данного пользователя не существует",
                Timestamp = DateTime.UtcNow
            });
        }

        return Ok(user);
    }

    [HttpPost("register")]
    public async Task<ActionResult<UserResponseDto>> Register(CreateUserDto createDto)
    {
        try
        {
            // Проверка уникальности
            if (await dbContext.Users.AnyAsync(c => c.Login == createDto.Login))
                return Conflict(new { message = "Логин уже существует" });

            if (await dbContext.Users.AnyAsync(c => c.Email == createDto.Email))
                return Conflict(new { message = "Email уже существует" });

            if (await dbContext.Users.AnyAsync(c => c.PhoneNumber == createDto.PhoneNumber))
                return Conflict(new { message = "Телефон уже существует" });

            // Хэшируем пароль для поля PasswordHash
            string hashedPassword = passwordService.HashPassword(createDto.Password);

            loggerUsersController.Info($"Пароль захэширован для пользователя {createDto.Login}");

            var user = new UsersModel
            {
                SecondName = createDto.SecondName,
                FirstName = createDto.FirstName,
                SurName = createDto.SurName,
                PhoneNumber = createDto.PhoneNumber,
                Email = createDto.Email,
                Login = createDto.Login,
                Password = createDto.Password, // Сохраняем оригинальный пароль
                PasswordHash = hashedPassword, // Сохраняем хэш
                LoginAttempts = 0,
            };

            dbContext.Users.Add(user);
            await dbContext.SaveChangesAsync();

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
                Role = user.Role
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            loggerUsersController.Error(ex, "Ошибка при регистрации пользователя {Login}", createDto.Login);
            return StatusCode(500, new { message = "Внутренняя ошибка сервера" });
        }
    }

    [HttpPost("login")]
    public async Task<ActionResult<LoginResponseDto>> Login(LoginRequestDto loginDto)
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

    private bool IsPasswordHashed(string password)
    {
        return !string.IsNullOrEmpty(password) &&
               (password.StartsWith("$2a$") ||
                password.StartsWith("$2b$") ||
                password.StartsWith("$2y$"));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUser(int id, UpdateUserDto userDto)
    {
        var existsUser = await dbContext.Users.FindAsync(id);
        if (existsUser == null)
        {
            return NotFound(new
            {
                StatusCode = 404,
                Error = "NotFound",
                Message = $"Пользователя не существует!",
                Timestamp = DateTime.UtcNow,
            });
        }

        if (userDto.SecondName != null)
        {
            existsUser.SecondName = userDto.SecondName;
        }

        if (userDto.FirstName != null)
        {
            existsUser.FirstName = userDto.FirstName;
        }

        if (userDto.SurName != null)
        {
            existsUser.SurName = userDto.SurName;
        }

        if (userDto.Gender != null)
        {
            existsUser.Gender = userDto.Gender;
        }

        if (userDto.Birthday.HasValue)
        {
            existsUser.Birthday = userDto.Birthday.Value;
            existsUser.Age = CalculateAge(userDto.Birthday.Value);
        }

        if (userDto.Age.HasValue)
        {
            existsUser.Age = userDto.Age.Value;
        }

        if (userDto.PhoneNumber != null)
        {
            existsUser.PhoneNumber = userDto.PhoneNumber;
        }

        if (userDto.Email != null)
        {
            existsUser.Email = userDto.Email;
        }

        // Смена пароля
        if (!string.IsNullOrEmpty(userDto.NewPassword))
        {
            // Проверяем старый пароль
            if (string.IsNullOrEmpty(userDto.CurrentPassword) ||
                !passwordHasher.VerifyPassword(userDto.CurrentPassword, existsUser.PasswordHash))
            {
                return BadRequest(new { Message = "Неверный текущий пароль" });
            }

            // Устанавливаем новый пароль
            existsUser.Password = userDto.NewPassword;
            existsUser.PasswordHash = passwordHasher.HashPassword(userDto.NewPassword);
        }

        await dbContext.SaveChangesAsync();

        return NoContent();
    }

    [HttpPut("changePassword")]
    public async Task<IActionResult> UpdatePasswordUser(int userId, string oldPassword, string newPassword)
    {
        try
        {
            var user = await dbContext.Users.FindAsync(userId);
            if (user != null)
            {
                if (user.Password == newPassword)
                {
                    return Unauthorized(new { Message = "Старый и новый пароли совпадают" });
                }

                if (oldPassword != newPassword)
                {
                    user.Password = newPassword;
                    user.PasswordHash = passwordHasher.HashPassword(newPassword);
                    await dbContext.SaveChangesAsync();
                    return Ok();
                }
                else
                {
                    return Unauthorized(new { Message = "Старый и новый пароли совпадают" });
                }
            }
            else
            {
                return NotFound(new
                {
                    StatusCode = 404,
                    Error = "NotFound",
                    Message = $"Пользователя не существует!",
                    Timestamp = DateTime.UtcNow,
                });
            }
        }
        catch (NullReferenceException ex)
        {
            return StatusCode(500, new { message = "Ошибка при обновлении", error = ex.Message });
        }
        catch (DbUpdateException ex)
        {
            return StatusCode(500, new { message = $"Ошибка базы данных: {ex.Message}" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Ошибка при обновлении", error = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var user = await dbContext.Users.FirstOrDefaultAsync(u => u.Id == id);
        if (user == null)
        {
            return NotFound(new
            {
                StatusCode = 404,
                Error = "NotFound",
                Message = $"Такого пользователя не существует!",
                Timestamp = DateTime.UtcNow,
            });
        }

        dbContext.Users.Remove(user);
        await dbContext.SaveChangesAsync();

        return Ok(new
        {
            StatusCode = 200,
            Message = "Пользователь успешно удален",
            DeletedId = id,
            Timestamp = DateTime.UtcNow
        });
    }
}