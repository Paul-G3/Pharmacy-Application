using Dapper;
using Microsoft.OpenApi.Models;
using PharmacyManagement.Server.DataAccess;
using PharmacyManagement.Server.Models;
using PharmacyManagement.Server.ViewModels;
using System.Data;

namespace PharmacyManagement.Server.Repositories.Customer
{
    public class CustomerRepository:ICustomerRepository
    {
        private readonly ISqlDataAccess sqlDataAccess;
        public CustomerRepository(ISqlDataAccess dataAccess)
        {
            sqlDataAccess = dataAccess;
        }

        public async Task<int> RegisterUser(User user)
        {
            try
            {
                string hashedpassword = PasswordHelper.HashPassword(user.Password);
                var data = await sqlDataAccess.GetData<int, dynamic>("sp_InserNewUser", new {user.Name, user.Surname,user.PhoneNumber,user.IDNumber,user.Email, Password = hashedpassword});
                int id = data.FirstOrDefault();

                return id;
            }
            catch(Exception)
            {
                return 0;
            }
        }
        public async Task<User?> VerifyUserExists(User user)
        {
           var data =  await sqlDataAccess.GetData<User, dynamic>("sp_VerifyUserExists", new { user.Email, user.IDNumber });
            return data.FirstOrDefault();
        }

        public async Task<IEnumerable<ActiveIngredientCustomer>> GetAllAllergies()
        {
            return await sqlDataAccess.GetData<ActiveIngredientCustomer, dynamic>("sp_GetAllAllergies", new { });
        }

        public async Task<bool> AddUserAllergies(int UserID, int AllergyID)
        {
            try
            {
                await sqlDataAccess.SaveData("sp_InsertNewUserAllergies", new { UserID,AllergyID });
                return true;
            }
            catch(Exception)
            {
                return false;
            }
        }

        public async Task<IEnumerable<ActiveIngredientCustomer>> GetUserAllergies(int id)
        {
            return await sqlDataAccess.GetData<ActiveIngredientCustomer, dynamic>("sp_GetCustomerAllergies", new { UserId = id });
        } 

        public async Task<bool> DeleteUserAllergy(int AllergyId)
        {
            try
            {
                await sqlDataAccess.SaveData("sp_DeleteCustomerAllegy", new { AllergyId });
                return true;
            }
            catch(Exception)
            {
                return false;
            }
        }

        public async Task<bool> UploadCustomerPrescription(byte [] file, int userId,string fileName, string Status)
        {
            try
            {
                await sqlDataAccess.SaveData("sp_UploadPrescription", new { file, userId, fileName,Status });
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }

        public async Task<IEnumerable<Prescription>> GetCustomerPrescriptions(int userId)
        {
            //return await sqlDataAccess.GetData<Prescription, dynamic>("sp_GetCustomerPrescriptions", new { userId });
            try
            {
                return await sqlDataAccess.GetData<Prescription, dynamic>("sp_GetCustomerPrescriptions",new { userId });
            }
            catch (Exception ex)
            { 
                throw; // rethrow so you see 500
            }
        }

        public async Task<IEnumerable<dynamic>> CustomerReport(int userId)
        {
            try
            {
                return await sqlDataAccess.GetData<dynamic, dynamic>("sp_CustomerReports", new { userId });
            }
            catch (Exception ex)
            {
                throw; // rethrow so you see 500
            }
        }

        public async Task<IEnumerable<dynamic>> CustomerReportByMedication(int userId)
        {
            try
            {
                return await sqlDataAccess.GetData<dynamic, dynamic>("sp_CustomerReportsByMedication", new { userId });
            }
            catch (Exception ex)
            {
                throw; // rethrow so you see 500
            }
        }

        public async Task<bool> DeletePrescription(int PrescriptionId)
        {
            try
            {
                await sqlDataAccess.SaveData("sp_CustomerDeletePrescription", new { PrescriptionId });
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }

        public async Task<IEnumerable<dynamic>> GetCustomerPrescribedMed(int userId)
        {
            return await sqlDataAccess.GetData<dynamic, dynamic>("sp_CustomerGetMedicationPrescribed", new { userId });

        }
        public async Task<bool> PlaceOrder(PlaceOrderRequest med, int UserId)
        {
            try
            {
                var table = new DataTable();
                table.Columns.Add("PrescribedMedicationID", typeof(int));
                table.Columns.Add("Price", typeof(double));
                table.Columns.Add("Quantity", typeof(int));
                foreach (var item in med.medications)
                {
                    table.Rows.Add(item.PrescribedMedicationID, item.price, item.quantity);

                }

                var parameters = new DynamicParameters();

                parameters.Add("CustomerOrderMedication", table.AsTableValuedParameter("dbo.CustomerOrderTVP"));
                parameters.Add("UserId", UserId);
                parameters.Add("totalCost", med.totalCost);

                await sqlDataAccess.SaveData("sp_CustomerPlaceOrderMedications", parameters);

                return true;
            }
            catch(Exception)
            {
                return false;
            }
        }

       public async Task<IEnumerable<dynamic>> GetCustomerOders(int userId)
       {
            return await sqlDataAccess.GetData<dynamic, dynamic>("sp_CustomerGetAllCustomerOrders", new { userId });
       }

        public async Task<bool> EditPrescriptionWithFile(byte[] file, int userId, string fileName, string Status, int prescriptionId)
        {
            try
            {
                await sqlDataAccess.SaveData("sp_UpdataPresscriptionWithFile", new { file, userId, fileName, Status, prescriptionId });
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }
        public async Task<bool> EditPrescriptionWithoutFile(int userId, string Status, int prescriptionId)
        {
            try
            {
                await sqlDataAccess.SaveData("sp_UpdataPresscriptionWithOutFile", new {userId,Status, prescriptionId });
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }

        public async Task<dynamic> GetTotalAllergies(int UserId)
        {

            var data = await sqlDataAccess.GetData<int, dynamic>("sp_CustomerCountTotalAllergies", new { UserId });
            return data.FirstOrDefault();
        }
        public async Task<dynamic> GetTotalProcessedScripts(int UserId)
        {
            var data = await sqlDataAccess.GetData<int, dynamic>("sp_CustomerGetProcessedScripts", new { UserId });
            return data.FirstOrDefault();
        }
        public async Task<dynamic> GetTotalUnprocessedScripts(int UserId)
        {
            var data = await sqlDataAccess.GetData<int, dynamic>("sp_CustomerGetUnprocessedScripts", new { UserId });
            return data.FirstOrDefault();
        }
        public async Task<dynamic> GetTotalOrders(int UserId)
        {
            var data = await sqlDataAccess.GetData<int, dynamic>("sp_CustomerGetTotalOrders", new { UserId });
            return data.FirstOrDefault();
        }

        public async Task<IEnumerable<dynamic>> GetCustomerRepeatHistory(int PrescribedMedId)
        {
            try
            {
                var data = await sqlDataAccess.GetData<dynamic, dynamic>("sp_CutomerRepeatHisoty", new { PrescribedMedId });
                return data;
            }
            catch(Exception)
            {
                throw ;
            }                       
            
        }

        public async Task<IEnumerable<dynamic>> GetCustomerOrdersHistory(int userId)
        {
            try
            {
                var data = await sqlDataAccess.GetData<dynamic, dynamic>("sp_CustomerGetAllCustomerOrdersHistory", new { userId });
                return data;
            }
            catch (Exception)
            {
                throw;
            }
        }
    }
}
