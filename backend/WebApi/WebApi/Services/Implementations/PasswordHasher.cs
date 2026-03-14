using System.Security.Cryptography;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;
using WebApi.Services.Interfaces;

namespace WebApi.Services.Implementations;

public sealed class PasswordHasher : IPasswordHasher
{
    public string HashPassword(string password)
    {
        byte[] salt = new byte[128 / 8];
        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(salt);
        }

        string hashed = Convert.ToBase64String(KeyDerivation.Pbkdf2(
            password: password,
            salt: salt,
            prf: KeyDerivationPrf.HMACSHA256,
            iterationCount: 100000,
            numBytesRequested: 256 / 8));

        return $"{Convert.ToBase64String(salt)}:{hashed}";
    }

    public bool VerifyPassword(string password, string storedHash)
    {
        if (string.IsNullOrEmpty(storedHash) || !storedHash.Contains(':'))
            return false;

        var parts = storedHash.Split(':');
        if (parts.Length != 2)
            return false;

        byte[] salt = Convert.FromBase64String(parts[0]);
        string storedPasswordHash = parts[1];

        string hashed = Convert.ToBase64String(KeyDerivation.Pbkdf2(
            password: password,
            salt: salt,
            prf: KeyDerivationPrf.HMACSHA256,
            iterationCount: 100000,
            numBytesRequested: 256 / 8));

        return storedPasswordHash == hashed;
    }
}