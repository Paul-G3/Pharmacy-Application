using PharmacyManagement.Server.Models;
using PharmacyManagement.Server.ViewModels;

using System.Collections;

namespace PharmacyManagement.Server.Repositories.Customer
{
    public interface ICustomerRepository
    {

        Task<int> RegisterUser(User user);
        Task<bool> UploadCustomerPrescription(byte[] file, int userId, string fileName, string Status);
        Task<bool> AddUserAllergies(int UserId, int AllergyId);
        Task<bool> DeleteUserAllergy(int AllergyId);
        Task<bool> DeletePrescription(int id);
        Task<bool> EditPrescriptionWithFile(byte[] file, int userId, string fileName, string Status, int prescriptionId);
        Task<bool> EditPrescriptionWithoutFile(int userId, string Status, int prescriptionId);
        Task<bool> PlaceOrder(PlaceOrderRequest medication, int userId);
        Task<User?> VerifyUserExists(User user);
        Task<IEnumerable<ActiveIngredientCustomer>> GetAllAllergies();
        
        Task<IEnumerable<ActiveIngredientCustomer>> GetUserAllergies(int id);
        Task<IEnumerable<Prescription>> GetCustomerPrescriptions(int id);
        Task<IEnumerable<dynamic>> GetCustomerPrescribedMed(int userId);
        Task<IEnumerable<dynamic>> CustomerReport(int userId);
        Task<IEnumerable<dynamic>> CustomerReportByMedication(int userId);
        Task<IEnumerable<dynamic>> GetCustomerOders(int userId);
        Task<IEnumerable<dynamic>> GetCustomerOrdersHistory(int userId);
        Task<dynamic> GetTotalAllergies(int  UserId);
        Task<dynamic> GetTotalProcessedScripts(int UserId);
        Task<dynamic> GetTotalUnprocessedScripts(int UserId);
        Task<dynamic> GetTotalOrders(int UserId);
        Task<IEnumerable<dynamic>> GetCustomerRepeatHistory(int PrescribedMedId);


    }
}
