using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PharmacyManagement.Server;
using PharmacyManagement.Server.Models;
using PharmacyManagement.Server.ViewModels;
using PharmacyManagement.Server.Repositories.Customer;

namespace PharmacyManagement.Server.Controllers.CustomerControllers
{
    [ApiController]
    [Route("/api/[controller]")]
    public class CustomerController : Controller
    {
        private readonly ICustomerRepository customerRepository;
        private readonly EmailService emailService;
        public CustomerController(ICustomerRepository repository, EmailService email)
        {  
            customerRepository = repository;
            emailService = email;
        }

        //get end points
        [Authorize]
        [HttpGet("dashBoard-data")]
        public async Task<IActionResult> GetDashBoardData()
        {
            var userId = User.Claims.FirstOrDefault(c => c.Type == "UserId")?.Value;

            var totalAllergies = await customerRepository.GetTotalAllergies(int.Parse(userId!));
            var totalOrders = await customerRepository.GetTotalOrders(int.Parse(userId!));
            var totalProcesedScripts = await customerRepository.GetTotalProcessedScripts(int.Parse(userId!));
            var totalUprocesedScripts = await customerRepository.GetTotalUnprocessedScripts(int.Parse(userId!));


            return Ok(new { totalAllergies, totalOrders, totalProcesedScripts, totalUprocesedScripts });

        }

        [Authorize]
        [HttpGet("customer-medication")]
        public async Task<IActionResult> GetCustomerMedication()
        {
            // Extract user ID from token claims
            var userId = User.Claims.FirstOrDefault(c => c.Type == "UserId")?.Value;
            IEnumerable<dynamic> data = await customerRepository.GetCustomerPrescribedMed(int.Parse(userId!));

            return Ok(data);
        }

        [Authorize]
        [HttpGet("get-medication-repeat-history")]
        public async Task<IActionResult> GetMedicationRepeatHistory([FromQuery]int id)
        {
            // Extract user ID from token claims
            var userId = User.Claims.FirstOrDefault(c => c.Type == "UserId")?.Value;

            IEnumerable<dynamic> data = await customerRepository.GetCustomerRepeatHistory(id);
            return Ok(data);
        }

        [HttpGet("getAllergies")]
        public async Task<IActionResult> GetAllAllergies()
        {
            IEnumerable<ActiveIngredientCustomer> data = await customerRepository.GetAllAllergies();
            return Ok(data);
        }

        [Authorize]
        [HttpGet("get-saved-Allergies")]
        public async Task<IActionResult> GetSavedAllergies()
        {
            // Extract user ID from token claims
            var userId = User.Claims.FirstOrDefault(c => c.Type == "UserId")?.Value;

            IEnumerable<ActiveIngredientCustomer> data = await customerRepository.GetUserAllergies(int.Parse(userId!));

            return Ok(data);
        }

        [Authorize]
        [HttpGet("get-customer-prescriptions")]
        public async Task<IActionResult> GetCustomerPrescriptions()
        {
            var userId = User.Claims.FirstOrDefault(c => c.Type == "UserId")?.Value;
            IEnumerable<Prescription> data = await customerRepository.GetCustomerPrescriptions(int.Parse(userId!));

            return Ok(data);
        }

        [Authorize]
        [HttpGet("get-customer-orders")]
        public async Task<IActionResult> GetCustomerOrders()
        {
            var userId = User.Claims.FirstOrDefault(c => c.Type == "UserId")?.Value;
            IEnumerable<dynamic> data = await customerRepository.GetCustomerOders(int.Parse(userId!));
            

            return Ok(data);
        }

        [Authorize]
        [HttpGet("customer-orders-history")]
        public async Task<IActionResult> GetCustomerOrdersHistory()
        {
            // Extract user ID from token claims
            var userId = User.Claims.FirstOrDefault(c => c.Type == "UserId")?.Value;
            IEnumerable<dynamic> data = await customerRepository.GetCustomerOrdersHistory(int.Parse(userId!));

            return Ok(data);
        }

        [Authorize]
        [HttpGet("customer-report")]
        public async Task<IActionResult> CustomerReport()
        {
            var userId = User.Claims.FirstOrDefault(c => c.Type == "UserId")?.Value;
            IEnumerable<dynamic> reportByDoctor = await customerRepository.CustomerReport(int.Parse(userId!));
            IEnumerable<dynamic> reportByMedication = await customerRepository.CustomerReportByMedication(int.Parse(userId!));
            return Ok(new
            {
                DoctorReport = reportByDoctor,
                MedicationReport = reportByMedication
            });
        }

        //post end points 
        [Authorize]
        [HttpPost("add-allergies")]
        public async Task<IActionResult> AddCustomerAllergy([FromBody] Allegy allergy)
        {
            var userId = User.Claims.FirstOrDefault(c => c.Type == "UserId")?.Value;
            await customerRepository.AddUserAllergies(int.Parse(userId!), allergy.value);
            return Ok(200);
        }
         
        [HttpPost("remove-customer-allergy")]
        public async Task<IActionResult> RemoveCustomerAllergy([FromBody] Allegy allergy)
        { 
            await customerRepository.DeleteUserAllergy(allergy.value);
            return Ok(200);
        }

        [Authorize]
        [HttpPost("Add-Prescription")]
        public async Task<IActionResult> AddPrescription([FromForm] IFormFile PrescriptionBlob, [FromForm] string Status)
        {
            var userId = User.Claims.FirstOrDefault(c => c.Type == "UserId")?.Value;
            string fileName = PrescriptionBlob.FileName;

            //this lines of code are converting pdf into bytes so they can be added to the server
            using var memoryStream = new MemoryStream();
            await PrescriptionBlob.CopyToAsync(memoryStream);
            byte[] fileBytes = memoryStream.ToArray();

            await customerRepository.UploadCustomerPrescription(fileBytes, int.Parse(userId!), fileName,Status);
            return Ok(200);
        }

        [Authorize]
        [HttpPost("edit-Prescription")]
        public async Task<IActionResult> EditPrescription([FromForm] IFormFile? PrescriptionBlob, [FromForm] string Status, [FromForm] int PrescriptionId)
        {
            var userId = User.Claims.FirstOrDefault(c => c.Type == "UserId")?.Value;
            //string fileName = PrescriptionBlob.FileName;

            if (PrescriptionBlob != null)
            {
                //this lines of code are converting pdf into bytes so they can be added to the server
                using var memoryStream = new MemoryStream();
                await PrescriptionBlob.CopyToAsync(memoryStream);
                byte[] fileBytes = memoryStream.ToArray();
                await customerRepository.EditPrescriptionWithFile(fileBytes, int.Parse(userId!), PrescriptionBlob.FileName, Status, PrescriptionId);
            }
            else
            {
                await customerRepository.EditPrescriptionWithoutFile(int.Parse(userId!), Status, PrescriptionId);
            }

            return Ok(200);
        }


        [Authorize]
        [HttpPost("delete-Prescription")]
        public async Task<IActionResult> DeletePrescription([FromBody] DeletePrescriptionDto dto)
        {
            var userId = User.Claims.FirstOrDefault(c => c.Type == "UserId")?.Value;

            await customerRepository.DeletePrescription(dto.prescriptionId);
            return Ok(200);
        }

        [HttpPost("regiser")]
        public async Task<IActionResult> RegisterUser([FromBody] User user)
        {
            var data = await customerRepository.VerifyUserExists(user);

            if (data == null)
            {
                int id = await customerRepository.RegisterUser(user);
                user.UserID = id;

                if (user.Allergies?.Count > 0)
                {
                    foreach (var allergy in user.Allergies)
                    {
                        await customerRepository.AddUserAllergies(user.UserID, allergy.value);
                    }
                }

                await emailService.SendEmailAsync($"{user.Name} {user.Surname}","New Account", user.Email!,"");
                return Ok(new { success = true, message = "User registered successfully." });
            }
            else
            {
                return Conflict(new { success = false, message = "User already exists.Try logging in instead" });
            }
        }

        [Authorize]
        [HttpPost("place-order")]
        public async Task<IActionResult> PlaceOrder([FromBody] PlaceOrderRequest medications)
        {
          
            var userId = User.Claims.FirstOrDefault(c => c.Type == "UserId")?.Value;

            await customerRepository.PlaceOrder(medications, int.Parse(userId!));
            return Ok(200);
        }

    }
}
