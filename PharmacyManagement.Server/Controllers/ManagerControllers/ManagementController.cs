using Microsoft.AspNetCore.Mvc;
using PharmacyManagement.Server.Models;
using PharmacyManagement.Server.Repositories.Manager;
using PharmacyManagement.Server.ViewModels;

namespace PharmacyManagement.Server.Controllers.ManagerControllers
{
    [ApiController]
    [Route("manager/management")]
    public class ManagementController : Controller
    {
        private IManagerRepository manager;
        public ManagementController(IManagerRepository manager)
        {
            this.manager = manager;
        }

        // Fetching initial data
        [HttpGet("ActiveIngredients")]
        public async Task<IActionResult> Ingredients()
        {
            try
            {
                var data = await manager.GetIngredients();
                if (data == null)
                {
                    return NotFound(new { success = false, message = "No active ingredients found" });
                }

                return Ok(data);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpGet("DosageForms")]
        public async Task<IActionResult> DosageForm()
        {
            try
            {
                var data = await manager.GetDosageForm();
                if (data == null)
                {
                    return NotFound(new { success = false, message = "No dosage forms found" });
                }

                return Ok(data);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpGet("Pharmacist")]
        public async Task<IActionResult> Pharamcist()
        {
            try
            {
                var data = await manager.GetPharmacist();
                if (data == null)
                {
                    return NotFound(new { success = false, message = "No pharmacists found" });
                }

                return Ok(data);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpGet("Doctors")]
        public async Task<IActionResult> Doctors()
        {
            try
            {
                var data = await manager.GetDoctors();
                if (data == null)
                {
                    return NotFound(new { success = false, message = "No doctors found" });
                }

                return Ok(data);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpGet("Suppliers")]
        public async Task<IActionResult> Supplier()
        {
            try
            {
                var data = await manager.GetSuppliers();
                if (data == null)
                {
                    return NotFound(new { success = false, message = "No suppliers found" });
                }

                return Ok(data);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }


        // Adding
        [HttpPost("AddActiveIngredients")]
        public IActionResult AddIngredients([FromBody] IngredientDTO ingredient)
        {
            if (ingredient == null)
            {
                return BadRequest("Ingredient data is required");
            }

            try
            {
                manager.AddIngredients(ingredient);
                return Ok(new { success = true, message = ingredient.Ingredient+" added successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpPost("AddDosageForm")]
        public async Task<IActionResult> AddDosageForm([FromBody] DosageFormDTO dosage)
        {
            if (dosage == null)
            {
                return BadRequest("Dosage Form is required");
            }

            try
            {
                await manager.AddDosageForm(dosage);
                return Ok(new { success = true, message = dosage.DosageForm+" added successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpPost("AddPharmacist")]
        public async Task<IActionResult> AddPharamcist([FromBody] PharmacistDetails pharmacist)
        {
            if (pharmacist == null)
            {
                return BadRequest("Pharmacist data is required");
            }

            try
            {
                await manager.AddPharmacist(pharmacist);
                return Ok(new { success = true, message = pharmacist.Name+" added successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpPost("AddDoctors")]
        public async Task<IActionResult> AddDoctors([FromBody] DoctorDTO doctor)
        {
            if (doctor == null)
            {
                return BadRequest("Doctor data is required");
            }

            try
            {
                await manager.AddDoctors(doctor);
                return Ok(new { success = true, message = doctor.DoctorName+" Doctor added successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpPost("AddSupliers")]
        public async Task<IActionResult> AddSupplier([FromBody] SupplierDTO supplier)
        {
            if (supplier == null)
            {
                return BadRequest("Supplier data is required");
            }

            try
            {
                await manager.AddSuppliers(supplier);
                return Ok(new { success = true, message = supplier.SupplierName+" added successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        // Updating
        [HttpPost("UpdateActiveIngredients")]
        public async Task<IActionResult> UpdateIngredients(ActiveIngredient activeIngredient)
        {
            if (activeIngredient == null)
            {
                return BadRequest();
            }

            await manager.UpdateIngredient(activeIngredient);
            return Ok(new { success=true,message=activeIngredient.Ingredient+" Updated Successfully"});
        }

        [HttpPost("UpdateDosageForm")]
        public async Task<IActionResult> UpdateDosageForm([FromBody] DosageForms dosageForm)
        {
            if (dosageForm == null)
            {
                return BadRequest("Dosage form is required");
            }

            try
            {
                await manager.UpdateDosageForm(dosageForm);
                return Ok(new { success = true, message = dosageForm.DosageForm+" Updated Successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpPost("UpdatePharmacist")]
        public async Task<IActionResult> UpdatePharamcist([FromBody] PharmacistDetails pharmacist)
        {
            if (pharmacist == null)
            {
                return BadRequest("Pharmacist data is required");
            }

            try
            {
                await manager.UpdatePharmacist(pharmacist);
                return Ok(new { success = true, message = pharmacist.Name+" Updated Successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpPost("UpdateDoctors")]
        public async Task<IActionResult> UpdateDoctors([FromBody] Doctor doctor)
        {
            if (doctor == null)
            {
                return BadRequest("Doctor data is required");
            }

            try
            {
                await manager.UpdateDoctors(doctor);
                return Ok(new { success = true, message = doctor.DoctorName+" Updated Successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpPost("UpdateSupliers")]
        public async Task<IActionResult> UpdateSupplier([FromBody] MedSupplier supplier)
        {
            if (supplier == null)
            {
                return BadRequest("Supplier data is required");
            }

            try
            {
                await manager.UpdateSuppliers(supplier);
                return Ok(new { success = true, message = supplier.SupplierName+" Updated Successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        // Disabling (Status Update)
        [HttpPost("ActiveIngredientsStatus")]
        public async Task<IActionResult> IngredientsStatus([FromBody] int id)
        {
            if (id < 1) return BadRequest();

            await manager.DeleteIngredients(id);
            return Ok(new { success = true, message = "Ingredient Disabled Successfully" });

        }

        [HttpPost("DosageFormStatus")]
        public async Task<IActionResult> DosageFormStatus([FromBody] int id)
        {
            if (id < 1) return BadRequest();

            await manager.DeleteDosageForm(id);
            return Ok(new { success = true, message = "Dosage Form Disabled Successfully" });
        }

        [HttpPost("PharmacistStatus")]
        public async Task<IActionResult> PharamcistStatus([FromBody] int id)
        {
            if (id < 1) return BadRequest();

            await manager.DeletePharmacist(id);
            return Ok(new { success = true, message = "Pharmacist Disabled Successfully" });
        }

        [HttpPost("DoctorsStatus")]
        public async Task<IActionResult> DoctorsStatus([FromBody] int id)
        {
            if (id < 1) return BadRequest();

            await manager.DeleteDoctors(id);
            return Ok(new { success = true, message = "Doctor Disabled Successfully" });
        }

        [HttpPost("SupliersStatus")]
        public async Task<IActionResult> SupplierStatus([FromBody] int id)
        {
            if (id < 1) return BadRequest();

            await manager.DeleteSuppliers(id);
            return Ok(new { success = true, message = "Supplier Disabled Successfully" });
        }
        [HttpPost("RemoveProfilePic")]
        public async Task<IActionResult> RemoveProfile([FromBody] int id)
        {
            if (id < 1) return BadRequest();

            var result =await manager.RemoveProfilePic(id);
            if(result)
                return Ok(new { sucess = true, message = "Profile Picture removed Successfully" });
            return Ok(new { sucess = false, message = "Profile Pic Not Removed please try again" });
        }
    }
}
