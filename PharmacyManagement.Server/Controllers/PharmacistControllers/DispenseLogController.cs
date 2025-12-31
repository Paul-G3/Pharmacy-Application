using Microsoft.AspNetCore.Mvc;
using PharmacyManagement.Server.Repositories.Pharmacist;
using PharmacyManagement.Server.ViewModels;

namespace PharmacyManagement.Server.Controllers.PharmacistControllers
{
    [ApiController]
    [Route("api/[controller]")]

    public class DispenseLogController: ControllerBase
    {
        private readonly IPharmacistRepository _pharmacistRepository;

        public DispenseLogController(IPharmacistRepository pharmacistRepository)
        {
            _pharmacistRepository = pharmacistRepository;
        }

        [HttpGet("get-dispensedPrescriptions")]
        public async Task<IActionResult> GetDispensedPrescription()
        {
            var dispensedPrescription = await _pharmacistRepository.GetDespinsedPriscriptions();

            return Ok(dispensedPrescription);
        }

        [HttpGet("get-collectedPrescriptions")]
        public async Task<IActionResult> GetCollectedPrescriptions()
        {
           
             var collected = await _pharmacistRepository.GetCollectedPriscriptions();

             return Ok(collected);

        }

        [HttpGet("get-walkInOrders")]
        public async Task<IActionResult> GetWalkinPrescriptions()
        {
            var collected = await _pharmacistRepository.GetWalkInOrders();
            return Ok(collected);
        }

        [HttpPost("collectPrescription")]
        public async Task<IActionResult> CollectScript(List<int> id)
        {
            try
            {
                var collecting = await _pharmacistRepository.CollectPrescription(id);
                
                if(collecting)
                    return Ok(new { success = true, message = "Order collected succesfully" });
                return Ok(new { success = false, message = "Sorry couldn't collect order" });

            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Server error: {ex.Message}");
            }

        }
    }
}
