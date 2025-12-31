using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using PharmacyManagement.Server.Repositories.Manager;
using PharmacyManagement.Server.Repositories.Settings;
using PharmacyManagement.Server.ViewModels;
using System.Security.Claims;

namespace PharmacyManagement.Server.Controllers.SettingsController
{
    [ApiController]
    [Route("manager/settings")]
    public class SettingsController : Controller
    {
        private readonly ISettingsRepositories settings;
        public SettingsController(ISettingsRepositories settings)
        {
            this.settings = settings;
        }
        [Authorize]
        [HttpGet("UserDetails")]
        public async Task<IActionResult> UserDetails()
        {
            var id = User.FindFirst("UserId")?.Value;
            if (id == null) { return NotFound("Invalid Loggin"); }

            try
            {   
                var data = await settings.GetUserDetails(int.Parse(id));
                if (data == null) { return NotFound("User Not Found"); }
                return Ok(data);
            }catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        } 
        [Authorize]
        [HttpPost("UpdateSettings")]
        public async Task<IActionResult> UpdateSettings([FromBody] UserDetails User)
        {
            User.UserID = int.Parse(this.User.FindFirst("UserId")?.Value);

            if (User == null) return BadRequest("No data Provided");
            try
            {
                await settings.UpdateDetails(User);
                return Ok(new { success = true, message = "personal details updated successfully" });
            }
            catch(Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
        [Authorize]
        [HttpPost("UpdatePassword")]
        public async Task<IActionResult> UpdatePassword([FromBody] UpdatePasswordDTO model)
        {
            var id = User.FindFirst("UserId")?.Value;
            if (model == null || string.IsNullOrWhiteSpace(model.Password))
                return BadRequest("No password provided");
            model.UserID = int.Parse(id);

            try
            {
               var isUpdated= await settings.UpdatePassword(model);

                if(isUpdated)
                    return Ok(new { success = true, message = "Password Updated successfully" });
                else
                    return Ok(new { success = false, message = "Password Incorrect" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
        [Authorize]
        [HttpGet("ProfileImage")]
        public async Task<IActionResult> GetProfilePic()
        {
            var id = User.FindFirst("UserId")?.Value;
            if (id == null) return Unauthorized();

            try
            {
                var image = await settings.GetProfilePic(int.Parse(id));

                if (!string.IsNullOrEmpty(image))
                    return Ok(new { base64Image = image }); // Return as JSON object

                var name = User.FindFirst(ClaimTypes.Name)?.Value;
                var Surname = User.FindFirst(ClaimTypes.Surname)?.Value;
                string initials = "";

                if (!string.IsNullOrEmpty(name)) initials += name[0];
                if (!string.IsNullOrEmpty(Surname)) initials += Surname[0];

                return Ok(new { initials }); 
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
        [Authorize]
        [HttpPost("UploadProfile")]
        public async Task<IActionResult> UploadProfile([FromForm] IFormFile image)
        {
            var id = User.FindFirst("UserId")?.Value;
            if (id == null) return Unauthorized();

            if (image == null || image.Length == 0)
                return BadRequest("No image uploaded.");

            // Read image bytes
            byte[] imageBytes;
            using (var ms = new MemoryStream())
            {
                await image.CopyToAsync(ms);
                imageBytes = ms.ToArray();
            }

            // Pass bytes to repository
            bool uploaded = await settings.UploadProfilePic(int.Parse(id), imageBytes);
            if (uploaded)
                return Ok(new { success = true, message = "Uploaded successfully" });
            else
                return StatusCode(500, new { success = false, message = "Upload not successful" });
        }
        [HttpGet("PharmacyName")]
        public async Task<IActionResult> GetPharmacyName()
        {
            var name = await settings.GetPharmacyName();
            if (name == null) return NotFound();
            return Ok(new { PharmacyName = name });
        }
    }
}
