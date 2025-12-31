using Microsoft.AspNetCore.Mvc;
using PharmacyManagement.Server.Repositories.Manager;
using PharmacyManagement.Server.ViewModels;
using System.Security.Claims;

namespace PharmacyManagement.Server.Controllers.ManagerControllers
{
    [ApiController]
    [Route("manager/medication")]
    public class MedicationController : Controller
    {
        private readonly IManagerRepository manager;
        public MedicationController(IManagerRepository manager)
        {
            this.manager = manager;
        }
        [HttpGet("Medication")]
        public async Task<IActionResult> Index()
        {
            try
            {
                var data = await manager.GetMedication();
                if (data == null)
                {
                    return NotFound(new { success = false, message = "No Medication found" });
                }

                return Ok(data);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
        [HttpGet("GetMedBySupplier")]
        public async Task<IActionResult> MedBySupplier()
        {
            try
            {
                var data =await manager.GetMedicationsBySupplier();
                if (data == null)
                {
                    return NotFound(new { success = false, message = "No Medication with Supplier Found" });
                }
                return Ok(data);
            }
            catch(Exception ex)
            {
                return StatusCode(500,new {success=false,message=ex.Message});
            }
        }

        [HttpGet("GetStockOrderDetails")]
        public async Task<IActionResult> StockOrderDetails()
        {
            try
            {
                var data = await manager.GetStockOrderDetails();
                if (data == null)
                {
                    return NotFound(new { success = false, message = "No Stock Found" });
                }
                return Ok(data);
            }
            catch(Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpGet("ActiveIngredients")]
        public async Task<IActionResult> ActiveIngredients()
        {
            try
            {
                var data = await manager.GetActiveIngredients();
                if (data == null) return NotFound(new { sucess = false, message = "Active Ingredients not found" });
                return Ok(data);
            }catch(Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
        [HttpGet("ActiveDosageForm")]
        public async Task<IActionResult> ActiveDosageForm()
        {
            try
            {
                var data = await manager.GetActiveDosageForm();
                if (data == null) return NotFound(new { sucess = false, message = "Active Dosage Forms not found" });
                return Ok(data);
            }catch(Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
        [HttpGet("ActiveSupplier")]
        public async Task<IActionResult> ActiveSupplier()
        {
            try
            {
                var data = await manager.GetActiveSupplier();
                if (data == null) return NotFound(new { sucess = false, message = "Active Supplier Forms not found" });
                return Ok(data);
            }catch(Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
        [HttpGet("StockTaking")]
        public async Task<IActionResult> GetStockTakingMeds()
        {
            try
            {
                var data = await manager.GetStockTaking();
                if (data == null) return NotFound(new { sucess = false, message = "Medication not found" });
                return Ok(data);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
        [HttpGet("GeneratedName")]
        public IActionResult GetPersonGenerated()
        {
            try
            {
                var fullName = $"{User.FindFirst(ClaimTypes.Name)?.Value} {User.FindFirst(ClaimTypes.Surname)?.Value}".Trim();
                if (string.IsNullOrWhiteSpace(fullName))
                    return NotFound(new { success = false, message = "User name not found" });

                return Ok(new { success = true, message = fullName });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
        [HttpPost("UpdateMedication")]
        public async Task<IActionResult> UpdateMedicaion([FromBody] MedicationAddDTO Meds)
        {
            if (Meds == null) return NotFound(new { success = false, message = "Not Meds to Update Provided" });
            try
            {
                await manager.EditMedication(Meds);
                return Ok(new {success=true,message=Meds.MedicationName+" Updated successfully"});
            }
            catch(Exception ex)
            {
                return StatusCode(500, new {success=false, message = ex });
            }
           
        }

        [HttpPost("NewMedication")]
        public async Task<IActionResult> AddMedication([FromBody] MedicationAddDTO Meds)
        {
            if (Meds == null) return NotFound(new { success = false, message = "Not Meds to Add Provided" });
            try
            {
                var results= await manager.AddMedication(Meds);
               if(results)
                    return Ok(new { success = true, message = Meds.MedicationName + " Added successfully" });
                return Ok(new { success = false, message = Meds.MedicationName + " Added unsuccessfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex });
            }
        }

        [HttpPost("OrderMedication")]
        public async Task<IActionResult> OrderMedication([FromBody] List<MedicationOrderDTO> MedOrder)
        {
            if(MedOrder==null) return NotFound(new { success = false, message = "ID Invalid" });

            try
            {
                var result=await manager.OrderMedication(MedOrder);
                if(result) return Ok(new { success = true, message = "ordered successfully" });
                return Ok(new { success = false, message = "Order Could Not Be Created" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex });
            }
        }
        [HttpPost("DeleteMedication")]
        public async Task<IActionResult> DeleteMeds([FromBody]int id)
        {
            if(id<1) return NotFound(new { success = false, message = "ID Invalid" });

            try
            {
                await manager.DeleteMedication(id);
                return Ok(new { success = true, message = "status changed successfully" });

            }catch(Exception ex)
            {
                return StatusCode(500, new { success = false, message =ex.Message });
            }
        }
    }
}
