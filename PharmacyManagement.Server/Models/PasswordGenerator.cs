using System;
using System.Security.Cryptography;
using System.Text;

public static class PasswordGenerator
{
    public static string Generate(int length = 8)
    {
        const string validChars = "ABCDEFGHJKLMNOPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz0123456789!@#$%";
        var result = new StringBuilder();
        using (var rng = RandomNumberGenerator.Create())
        {
            byte[] buffer = new byte[sizeof(uint)];

            while (result.Length < length)
            {
                rng.GetBytes(buffer);
                uint num = BitConverter.ToUInt32(buffer, 0);
                result.Append(validChars[(int)(num % validChars.Length)]);
            }
        }
        return result.ToString();
    }
}
