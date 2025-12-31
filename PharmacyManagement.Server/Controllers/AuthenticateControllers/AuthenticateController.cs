using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PharmacyManagement.Server.Jwt;
using PharmacyManagement.Server.Models;
using PharmacyManagement.Server.Repositories.Authenticate;
using PharmacyManagement.Server.ViewModels;

namespace PharmacyManagement.Server.Controllers.AuthenticateControllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthenticateController : Controller
    {
        private readonly IAuthenticateUsers authenticateUsers;
        private readonly JwtHelper jwtHelper;
        private readonly EmailService emailService;
        public AuthenticateController(IAuthenticateUsers authenticate, JwtHelper jwt, EmailService email)
        {
            authenticateUsers = authenticate;
            jwtHelper = jwt;
            emailService = email;  
        }


        [HttpPost("authenticate")]
        public async Task<IActionResult> AuthenticateUsers(User user)
        {
            var data = await authenticateUsers.AuthenticateUser(user);

            if (data == null)
                return Unauthorized(new { message = "Invalid email or password" });

            var token = jwtHelper.GenerateToken(data);
            user.UserID = data.UserID;

            //var token = jwtHelper.GenerateToken(user);

            return Ok(new
            {
                token = token,
                data = data
            });
        }
        [HttpGet("ResposnsiblePharmacist")]
        public async Task<IActionResult> GetResposnsiblePharmacist()
        {
            try
            {
                var data = await authenticateUsers.GetResposnsiblePharmacist();
                if (data == null) return NotFound(new { success = false, message = "No Responsible Pharmacist Found" });

                return Ok(data);
            }
            catch(Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }

        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> GetNewPassword([FromBody] ForgotPassword forgotPassword)
        {
            try
            {
                var data = await authenticateUsers.ForgotPassword(forgotPassword);

                if (data != null)
                {
                    var generate = PasswordGenerator.Generate();
                    emailService.SendEmailAsync(data.User, data.Email, "New Password", generate);
                    var encrptedPass = PasswordHelper.HashPassword(generate);

                    await authenticateUsers.UpdatePassword(encrptedPass, data.UserID);
                    return Ok(data);
                }
                else
                {
                    return NotFound(new { success = false, message = "User not found. Please check your details and try again." });

                }


            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }

        }

    }
}
