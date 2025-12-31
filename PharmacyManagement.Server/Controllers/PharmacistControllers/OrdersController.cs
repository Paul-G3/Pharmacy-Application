using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ActionConstraints;
using PharmacyManagement.Server.Models;
using PharmacyManagement.Server.Repositories.Pharmacist;
using PharmacyManagement.Server.ViewModels;

namespace PharmacyManagement.Server.Controllers.PharmacistControllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController:ControllerBase
    {
        private readonly IPharmacistRepository _pharmacistRepository;
        public OrdersController(IPharmacistRepository pharmacistRepository)
        {
            _pharmacistRepository = pharmacistRepository;
        }
        /// Getting Data 
        
        [HttpGet("get-PendingOrders")]
        public async Task<IActionResult> GetPendingOrder()
        {
            var orders = await _pharmacistRepository.GetPeningOrders();
            return Ok(orders);
        }

        [HttpGet("get-processedORrejecctOrders")]
        public async Task<IActionResult> GetProcessedRejectedOrders()
        {
            var orders = await _pharmacistRepository.GetProcessedRejectedOrders();
            return Ok(orders);
        }

        [Authorize]
        [HttpGet("get-report")]
        public async Task<IActionResult> GetReport()
        {
            var id = int.Parse(User.FindFirst("UserId")?.Value);

            var report = await _pharmacistRepository.GetPharmacistReport(id);
            return Ok(report);
        }


        /// Posting Data 
        [Authorize]
        [HttpPost("processCustomer-order")]
        public async Task<IActionResult> ProcessCustomerOrder([FromBody] ProcessOrderRequest request)
        {
            var id = int.Parse(User.FindFirst("UserId")?.Value);

            if (request.Medications== null || request.Medications.Count == 0)
            {
                return BadRequest("No medications provided.");
           }

            // Convert DTO to tuple list for repo
            var medTuples = request.Medications
                .Select(m => (m.PrescribedMedicationID, m.OrderedMedicationID))
                .ToList();

            try
            {
                await _pharmacistRepository.ProcessOrder(medTuples, id, request.UserID);

                return Ok(new { success = true, message = "Order succesfully peocessed and ready for collection" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Server error: {ex.Message}");
            }


        }


        [HttpPost("reject-order")]
        public async Task<IActionResult> RejectOrder([FromBody] RejectCustomerOrderDto dto)
        {
            var rejected = await _pharmacistRepository.RejectOrder(dto.CustomerOrderID);
            return Ok(rejected);
        }

    }
}
