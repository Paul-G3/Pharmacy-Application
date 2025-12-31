using PharmacyManagement.Server.Models;
using PharmacyManagement.Server.ViewModels;

namespace PharmacyManagement.Server.Repositories.Pharmacist
{
    public interface IPharmacistRepository
    {
        // Adding .......
        Task<bool> UploadPrescriptiom(UploadScriptViewModel prescriptionData, List<PrescribedMedication> medicationList, byte[] prescriptionFileBytes, string Name,int id, DateOnly parsedDateOnly, int prescriptionID);
        Task<bool> UploadDispensePrescriptiom(UploadScriptViewModel prescriptionData, List<PrescribedMedication> medicationList, byte[] prescriptionFileBytes, string Name, float totalPriceValue, float vatAmountValue, int id, DateOnly parsedDateOnly, int prescriptionID);
        Task<bool> AddDoctorAsync(Doctor doctor);
        Task<int> AddCustomerAsync(AddCustomerViewModel addCustomer);

        //Updating .......
        Task DispenseMedication(int customerId, List<int> ids, float TotalAmount, float VatAmount, int id);
        Task<bool> CollectPrescription(List<int> prescribedMedicationIds);
        Task<bool> ProcessOrder(List<(int? PrescribedMedicationID, int? OrderedMedicationID)> medications, int id, int userID);
        Task<bool> RejectOrder(int CustomerOrderID);
        Task<bool> RejectPrescription(int id);

        //Getting .......
        Task<IEnumerable<dynamic>> GetDashoardCounts();
        Task<IEnumerable<dynamic>> GetDashoardWalkinCounts();
        Task<IEnumerable<dynamic>> GetDashoardPendingOrderCounts();
        Task<IEnumerable<dynamic>> GetDashoardProcessedOrderCounts();
        Task<IEnumerable<dynamic>> GetDashoardCollectedOrderCounts();
        Task<IEnumerable<GetCustomerWallergyViewModel>> GetCustomersAsync();
        Task<IEnumerable<Doctor>> GetDoctorsAsync();
        Task<IEnumerable<ActiveIngredient>> GetActiveIngredients();
        Task<IEnumerable<GettMedicationsWithIngredient>> GetMedications();
        Task<IEnumerable<PendingScriptsViewModel>> GetPendingPrescriptions();
        Task<IEnumerable<GetPrescriptionsToDispense>> GetMedicationsToDispense(GetPrescriptionsToDispense meds);
        Task<IEnumerable<User>> GetDispenseUserDropDown();
        Task<IEnumerable<DespinsedPriscriptionsViewModel>> GetDespinsedPriscriptions();
        Task<IEnumerable<DespinsedPriscriptionsViewModel>> GetCollectedPriscriptions();
        Task<IEnumerable<DespinsedPriscriptionsViewModel>> GetWalkInOrders();
        Task<IEnumerable<CustomerOrdersViewModel>> GetPeningOrders();
        Task<IEnumerable<CustomerOrdersViewModel>> GetProcessedRejectedOrders();
        Task<IEnumerable<PharmacistReport>> GetPharmacistReport(int id);
    }
}
