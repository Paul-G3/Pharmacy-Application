using Microsoft.AspNetCore.Mvc;
using PharmacyManagement.Server.Repositories.Manager;

namespace PharmacyManagement.Server.Controllers.ManagerControllers
{
    [ApiController]
    [Route("manager/dashboard")]

    public class DashBoardController : Controller
    {
        private readonly IManagerRepository manager;
        public DashBoardController(IManagerRepository manager)
        {
            this.manager = manager;
        }
        [HttpGet("CriticalStockItems")]
        public async Task<IActionResult> GetStockItems()
        {
            try
            {
                var data = await manager.GetStockItems();
                return Ok(data);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
        [HttpGet("OrderItems")]
        public async Task<IActionResult> GetOrderItems()
        {
            try
            {
                var data = await manager.GetOrderItems();
                return Ok(data);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
        [HttpGet("MedicationCount")]
        public async Task<IActionResult> GetActiveMedication()
        {
            try
            {
                var data = await manager.GetActiveMedicationCount();
                return Ok(data);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
        [HttpGet("SupplierCount")]
        public async Task<IActionResult> GetActiveSupplier()
        {
            try
            {
                var data = await manager.GetActiveSupplierCount();
                return Ok(data);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

    }
}
