using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PharmacyManagement.Server.Models;
using PharmacyManagement.Server.Repositories.Pharmacist;
using PharmacyManagement.Server.ViewModels;

namespace PharmacyManagement.Server.Controllers.PharmacistControllers
{
    [ApiController]
    [Route("api/[controller]")]

    public class DispenseController: ControllerBase
    {
        private readonly IPharmacistRepository _pharmacistRepository;

        public DispenseController( IPharmacistRepository pharmacistRepository)
        {
            _pharmacistRepository = pharmacistRepository;
        }

        /// Posting Data 
        [Authorize]
        [HttpPost("dispense-medications")]
        public async Task<IActionResult> DispenseMedications([FromBody] DispenseRequest request)
        {
            var id = int.Parse(User.FindFirst("UserId")?.Value);

            if (request.Ids == null || request.Ids.Count == 0)
            return BadRequest("No medication IDs provided");


            try
            {
                await _pharmacistRepository.DispenseMedication(request.CustomerID, request.Ids, request.TotalAmount, request.VatAmount, id);
                return Ok(new { success = true, message = "Medications dispensed succesfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Server error: {ex.Message}");
            }

        }


        /// Getting Data 
        [HttpPost ("get-ProcessedPrescriptions")]
        public async Task<IActionResult> GetProcessedPrescriptions(GetPrescriptionsToDispense meds)
        {
            var prescriptions = await _pharmacistRepository.GetMedicationsToDispense(meds);
            return Ok (prescriptions);
        }

        [HttpGet ("get-CustomerDropDown")]
        public async Task<IActionResult> GetCustomersDropdown()
        {
            var customers = await _pharmacistRepository.GetDispenseUserDropDown();
            return Ok (customers);
        }
               

    }
}
