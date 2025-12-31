using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using PharmacyManagement.Server.Models;
using PharmacyManagement.Server.Repositories.Pharmacist;
using PharmacyManagement.Server.ViewModels;
using System;
using System.Globalization;
using System.Numerics;
using System.Reflection;

namespace PharmacyManagement.Server.Controllers.PharmacistControllers
{
    [ApiController]
    [Route("api/[controller]")]

    public class UploadScriptController : ControllerBase
    {
        private readonly IPharmacistRepository _pharmacistRepository;

        public UploadScriptController( IPharmacistRepository pharmacistRepository)
        {
            _pharmacistRepository = pharmacistRepository;
        }

        /// Posting Data
        [Authorize]
        [HttpPost("add-prescription")]
        public async Task<IActionResult> AddPrescription([FromForm] IFormFile prescriptionBlob, [FromForm] string Name, [FromForm] string prescription, [FromForm] string medications,[FromForm] string date, [FromForm] int prescriptionID)
        {
            var id = User.FindFirst("UserId")?.Value;

            try
            {
                if (prescriptionBlob == null || prescriptionBlob.Length == 0 )
                    return BadRequest("No PDF uploaded.");

                // Read the uploaded PDF into a byte array
                byte[] fileBytes;
                using (var ms = new MemoryStream())
                {
                    await prescriptionBlob.CopyToAsync(ms);
                    fileBytes = ms.ToArray();
                }

                // Deserialize JSON data that comes as strings into C# objects
                var prescriptionData = JsonConvert.DeserializeObject<UploadScriptViewModel>(prescription);
                var medicationList = JsonConvert.DeserializeObject<List<PrescribedMedication>>(medications);
                var parsedDateOnly = DateOnly.ParseExact(date, "yyyy-MM-dd", CultureInfo.InvariantCulture);

                // Call repo to save everything
                var success = await _pharmacistRepository.UploadPrescriptiom(prescriptionData, medicationList, fileBytes, Name, int.Parse(id), parsedDateOnly, prescriptionID);

                if (success)
                    return Ok(new { success = true, message =Name+ " Prescription added succesfully" });
                return Ok(new { success = false, message =Name +" Prescription added unsuccesfully" });

               
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Server error: {ex.Message}");
            }
        }

        [Authorize]
        [HttpPost("addAndDispense-prescription")]
        public async Task<IActionResult> AddDispensePrescription([FromForm] IFormFile prescriptionBlob, [FromForm] string Name, [FromForm] string prescription, [FromForm] string medications, [FromForm] string totalPrice, [FromForm] string vatAmount, [FromForm] string date, [FromForm] int prescriptionID)
        {
            var id = User.FindFirst("UserId")?.Value;

            try
            {
                if (prescriptionBlob == null || prescriptionBlob.Length == 0)
                    return BadRequest("No PDF uploaded.");

                // Read the uploaded PDF into a byte array
                byte[] fileBytes;
                using (var ms = new MemoryStream())
                {
                    await prescriptionBlob.CopyToAsync(ms);
                    fileBytes = ms.ToArray();
                }

                // Deserialize JSON data that comes as strings into C# objects
                var prescriptionData = JsonConvert.DeserializeObject<UploadScriptViewModel>(prescription);
                var medicationList = JsonConvert.DeserializeObject<List<PrescribedMedication>>(medications);

                // Parse with InvariantCulture to handle dot as decimal
                float totalPriceValue = float.Parse(totalPrice, CultureInfo.InvariantCulture);
                float vatAmountValue = float.Parse(vatAmount, CultureInfo.InvariantCulture);
                var parsedDateOnly = DateOnly.ParseExact(date, "yyyy-MM-dd", CultureInfo.InvariantCulture);

                var success = await _pharmacistRepository.UploadDispensePrescriptiom(prescriptionData, medicationList, fileBytes, Name, totalPriceValue, vatAmountValue, int.Parse(id), parsedDateOnly, prescriptionID);

                if(success)
                    return Ok(new { success = true, message = Name+" Prescription dispensed, now ready for collection" });
                return Ok(new { success = false, message = Name+ " Couldn't dispense Prescription" });

                //else if (!success)
                //    return StatusCode(500, "Failed to upload prescription.");

                //return Ok("Prescription uploaded successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Server error: {ex.Message}");
            }
        }

        [HttpPost("reject-script")]
        public async Task<IActionResult> RejectPrescription(int id)
        {
            try
            {
                var reject = await _pharmacistRepository.RejectPrescription(id);

                if (reject)
                    return Ok(new { success = true, message = " Prescription successfully rejected " });
                return Ok(new { success = false, message = " Couldn't reject prescription" });

            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Server error: {ex.Message}");
            }
            
        }

        [HttpPost("add-doctor")]
        public async Task<IActionResult> AddDoctor([FromBody] Doctor doc)
        {
            try
            {
                var doctor = await _pharmacistRepository.AddDoctorAsync(doc);

                if (doctor)
                    return Ok(new { success = true, message = "Dr " + doc.DoctorName + " " + doc.DoctorSurname + " added succesfully" });
                return Ok(new { success = false, message = "Dr " + doc.DoctorName + " " + doc.DoctorSurname + " added unsuccesfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex });
            }

           // return null;

        }

        [HttpPost("add-customer")]
        public async Task<IActionResult> AddCustomer([FromBody] AddCustomerViewModel addCustomer)
        {

            if (addCustomer == null || addCustomer.user == null)
                return BadRequest("Invalid data.");

            try
            {
                var newCustomerID = await _pharmacistRepository.AddCustomerAsync(addCustomer);

                if (newCustomerID != null)
                    return Ok(new { success = true, message = "Customer " + addCustomer.user.Name + " " + addCustomer.user.Surname + " added succesfully" });
                return Ok(new { success = false, message = "Customer " + addCustomer.user.Name + " " + addCustomer.user.Surname + " added unsuccesfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex });
            }

            //return null;

        }


        /// Getting Data
        

        [HttpGet ("get-customers")]
        public async Task<IActionResult> GetAllCustomers()
        {
            var customers = await _pharmacistRepository.GetCustomersAsync();

            return Ok(customers);
        }


        [HttpGet ("get-doctors")]
        public async Task<IActionResult> GetAllDoctors()
        {
            var doctors = await _pharmacistRepository.GetDoctorsAsync();

            return Ok(doctors);
        }

        [HttpGet("get-activeIngredients")]
        public async Task<IActionResult> GetActiveIngredients()
        {
            var ingredients = await _pharmacistRepository.GetActiveIngredients();
            return Ok(ingredients);
        }

        [HttpGet("get-medication")]
        public async Task<IActionResult> GetActiveMedication()
        {
            var medication = await _pharmacistRepository.GetMedications();
            return Ok(medication);
        }

        [HttpGet ("get-pendingScripts")]   
        public async Task<IActionResult> GetPendingScripts()
        {
            var scripts = await _pharmacistRepository.GetPendingPrescriptions();
            return Ok(scripts);
        }

    }
}
