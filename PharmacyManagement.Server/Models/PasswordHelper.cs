using System;
using System.Security.Cryptography;
using System.Text;

public static class PasswordHelper
{
    private const int SaltSize = 16;
    private const int KeySize = 32;  
    private const int Iterations = 100_000;

    public static string HashPassword(string password)
    {
        byte[] salt = RandomNumberGenerator.GetBytes(SaltSize);
        using var pbkdf2 = new Rfc2898DeriveBytes(password, salt, Iterations, HashAlgorithmName.SHA256);
        byte[] key = pbkdf2.GetBytes(KeySize);

        var resultBytes = new byte[SaltSize + KeySize];
        Buffer.BlockCopy(salt, 0, resultBytes, 0, SaltSize);
        Buffer.BlockCopy(key, 0, resultBytes, SaltSize, KeySize);

        return Convert.ToBase64String(resultBytes);
    }

    public static bool VerifyPassword(string password, string storedHash)
    {
        byte[] storedBytes = Convert.FromBase64String(storedHash);

        byte[] salt = new byte[SaltSize];
        byte[] storedKey = new byte[KeySize];
        Buffer.BlockCopy(storedBytes, 0, salt, 0, SaltSize);
        Buffer.BlockCopy(storedBytes, SaltSize, storedKey, 0, KeySize);

        using var pbkdf2 = new Rfc2898DeriveBytes(password, salt, Iterations, HashAlgorithmName.SHA256);
        byte[] computedKey = pbkdf2.GetBytes(KeySize);

        return CryptographicOperations.FixedTimeEquals(storedKey, computedKey);
    }
}
