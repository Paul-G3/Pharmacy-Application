using Microsoft.AspNetCore.Mvc;
using PharmacyManagement.Server.Repositories.Manager;

namespace PharmacyManagement.Server.Controllers.ManagerControllers
{
    [ApiController]
    [Route("manager/orders")]
    public class OrdersController : Controller
    {
        private readonly IManagerRepository manager;
        public OrdersController(IManagerRepository manager)
        {
            this.manager = manager;
        }
        [HttpGet("GetOrders")]
        public async Task<IActionResult> GetOrders()
        {
            try
            {
                var data = await manager.GetOrderDetails();
                if (data == null) return NotFound(new { success = false, message = "Order details was not found" });
                return Ok(data);
            }
            catch(Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpPost("ApproveOrder")]
        public async Task<IActionResult> UpdateOrder([FromBody] int id)
        {
            try
            {
                var approved = await manager.ApproveOrder(id);
                if (!approved) return BadRequest(new { success = false, message = "Order failed to be recieved" });
                return Ok(new { success = true, message = "Order number "+id+" has been Recieved" });
            }
            catch(Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
    }
}
