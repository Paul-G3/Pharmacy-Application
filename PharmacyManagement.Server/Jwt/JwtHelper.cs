using Microsoft.IdentityModel.Tokens;
using PharmacyManagement.Server.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace PharmacyManagement.Server.Jwt
{
    public class JwtHelper
    {
        private readonly IConfiguration _config;

        public JwtHelper(IConfiguration config)
        {
            _config = config;
        }

        public string GenerateToken(User user)  
        {

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
            new Claim(ClaimTypes.Name, user.Name ?? ""),
            new Claim(ClaimTypes.Surname, user.Surname ?? ""),
            new Claim("UserId", user.UserID.ToString()),
            new Claim("Role",user.UserType??"")
            };

            var token = new JwtSecurityToken(
                _config["Jwt:Issuer"],
                _config["Jwt:Audience"],
                claims,
                expires: DateTime.Now.AddHours(2),
                signingCredentials: credentials
             );

            try
            {
                var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

                if (!string.IsNullOrEmpty(tokenString))
                {
                    // Token generated successfully
                    return tokenString;
                }
                else
                {
                    // Extremely rare - handle empty token case
                    throw new Exception("Generated token string is empty.");
                }
            }
            catch (Exception ex)
            {
                // Log exception details here
                Console.WriteLine($"Exception during token generation: {ex.Message}");
                // Optionally return an error response or rethrow
                throw; // or return StatusCode(500, "Token generation failed");
            }
        }
    }
}
