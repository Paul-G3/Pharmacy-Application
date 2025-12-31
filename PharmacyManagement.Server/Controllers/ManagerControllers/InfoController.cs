using Microsoft.AspNetCore.Mvc;
using PharmacyManagement.Server.Models;
using PharmacyManagement.Server.Repositories.Manager;

namespace PharmacyManagement.Server.Controllers.ManagerControllers
{
    [ApiController]
    [Route("manager/Info")]
    public class InfoController : Controller
    {
        private readonly IManagerRepository manager;
        public InfoController(IManagerRepository manager)
        {
            this.manager = manager;   
        }
        [HttpGet("PharmacyDetails")]
        public async Task<IActionResult> GetPharmacyDetails()
        {
            try
            {
                var data = await manager.GetBusinessTables();
                if (data == null)
                {
                    return NotFound(new { success = false, message = "No Business Data found" });
                }

                return Ok(data);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
        [HttpGet("ActivePharmacists")]
        public async Task<IActionResult> GetPharmacist()
        {
            try
            {
                var data = await manager.GetActivePharmacists();
                if (data == null)
                {
                    return NotFound(new { success = false, message = "No pharmacists Data found" });
                }

                return Ok(data);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
        [HttpGet("Events")]
        public async Task<IActionResult> GetEvents()
        {
            try
            {
                var data = await manager.GetEvents();
                if (data == null)
                {
                    return NotFound(new { success = false, message = "No Event Data found" });
                }

                return Ok(data);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
        [HttpPost("UpdatePharmacyDetails")]
        public async Task<IActionResult> UpdateBusinessInfo([FromBody]BusinessTable businessTable)
        {
            if (businessTable == null) return BadRequest("Business Data required ");
            try
            {
                await manager.UpdatePharmacy(businessTable);
                return Ok(new { success = true, message = "Business data updated successfully" });

            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpPost("AddNewEvent")]
        public async Task<IActionResult> AddNewEvent([FromBody]Events Event)
        {
            if (Event == null) return BadRequest("Event Data required ");
            try
            {
                await manager.AddNewEvent(Event);
                return Ok(new { success = true, message = "Event "+Event.EventName+"  updated successfully" });

            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpPost("UpdateEvent")]
        public async Task<IActionResult> UpdateEvent(Events Event)
        {
            if (Event == null) return BadRequest("Event Data required ");
            try
            {
                await manager.UpdateEvent(Event);
                return Ok(new { success = true, message = "Event "+Event.EventName+" added successfully" });

            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpPost("DeleteEvent")]
        public async Task<IActionResult> DeleteEvent([FromBody] int id)
        {
            if (id < 1) return BadRequest();

            await manager.DeleteEvent(id);
            return Ok(new { success = true, message = "Event disabled successfully" });
        }
    }
}
