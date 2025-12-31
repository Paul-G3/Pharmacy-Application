using Microsoft.AspNetCore.Mvc;
using PharmacyManagement.Server.Repositories.Pharmacist;

namespace PharmacyManagement.Server.Controllers.PharmacistControllers
{
    [ApiController]
    [Route("api/[controller]")]

    public class DashboardController : ControllerBase
    {
        private readonly IPharmacistRepository _pharmacistRepository;

        public DashboardController(IPharmacistRepository pharmacistRepository)
        {
            _pharmacistRepository = pharmacistRepository;
        }

        [HttpGet("get-DashboardCounts")]
        public async Task<IActionResult> GetDashboardCount()
        {
            var counts = await _pharmacistRepository.GetDashoardCounts();
            return Ok(counts);
        }

        [HttpGet("get-walkinCounts")]
        public async Task<IActionResult> GetWalkinCount()
        {
            var counts = await _pharmacistRepository.GetDashoardWalkinCounts();
            return Ok(counts);
        }

        [HttpGet("get-pendingOrderCounts")]
        public async Task<IActionResult> GetPendingOrdCount()
        {
            var counts = await _pharmacistRepository.GetDashoardPendingOrderCounts();
            return Ok(counts);
        }

        [HttpGet("get-processedOrderCounts")]
        public async Task<IActionResult> GetPrecessedOrdCount()
        {
            var counts = await _pharmacistRepository.GetDashoardProcessedOrderCounts();
            return Ok(counts);
        }

        [HttpGet("get-collectedOrderCounts")]
        public async Task<IActionResult> GetCollectedOrdCount()
        {
            var counts = await _pharmacistRepository.GetDashoardCollectedOrderCounts();
            return Ok(counts);
        }



    }
}
