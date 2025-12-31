using PharmacyManagement.Server.Models;
using PharmacyManagement.Server.ViewModels;

namespace PharmacyManagement.Server.Repositories.Manager
{
    public interface IManagerRepository
    {
        #region DashBoard Page
        Task<IEnumerable<dynamic>> GetStockItems();
        Task<IEnumerable<dynamic>> GetOrderItems();
        Task<IEnumerable<dynamic>> GetActiveMedicationCount();
        Task<IEnumerable<dynamic>> GetActiveSupplierCount();
        #endregion
        #region managementPage 
        Task<IEnumerable<ActiveIngredient>> GetIngredients();
        Task<IEnumerable<MedSupplier>> GetSuppliers();
        Task<IEnumerable<DosageForms>> GetDosageForm();
        Task<IEnumerable<PharmacistDetails>> GetPharmacist();
        Task<IEnumerable<Doctor>> GetDoctors();

        Task<bool> AddIngredients(IngredientDTO ingredient);
        Task<bool> AddSuppliers(SupplierDTO supplier);
        Task<bool> AddDosageForm(DosageFormDTO Dosage);
        Task<bool> AddPharmacist(PharmacistDetails pharmacist);
        Task<bool> AddDoctors(DoctorDTO Dr);

        Task<bool> UpdateIngredient(ActiveIngredient ingredient);
        Task<bool> UpdateSuppliers(MedSupplier supplier);
        Task<bool> UpdateDosageForm(DosageForms Dosage);
        Task<bool> UpdatePharmacist( PharmacistDetails pharmacist);
        Task<bool> UpdateDoctors(Doctor Dr);

        Task<bool> DeleteIngredients(int ActiveIgredientID);
        Task<bool> DeleteSuppliers(int SupplerID);
        Task<bool> DeleteDosageForm(int DosageID);
        Task<bool> DeletePharmacist(int PharmacistID);
        Task<bool> DeleteDoctors(int DoctorID);

        Task<bool> RemoveProfilePic(int id);
        #endregion

        #region MedicationPage
        Task<IEnumerable<MedicationDTO>> GetMedication();
        Task<IEnumerable<StockOrderDetails>> GetStockOrderDetails();
        Task<IEnumerable<MedBySupplierDTO>> GetMedicationsBySupplier();
        Task<IEnumerable<dynamic>> GetActiveSupplier();
        Task<IEnumerable<dynamic>> GetActiveDosageForm();
        Task<IEnumerable<StockTakingMeds>> GetStockTaking();
        Task<IEnumerable<ActiveIngredient>> GetActiveIngredients();

        Task<bool> AddMedication(MedicationAddDTO M);
        Task<bool> EditMedication(MedicationAddDTO M);
        Task<bool> OrderMedication(List<MedicationOrderDTO> O);
        Task<bool> DeleteMedication(int id);
        #endregion

        #region OrderPage
        Task<IEnumerable<OrderDetails>> GetOrderDetails();
        Task<bool> ApproveOrder(int id);
        #endregion

        #region InfoPage
        Task<IEnumerable<BusinessTable>> GetBusinessTables();
        Task<IEnumerable<ActivePharmacist>> GetActivePharmacists();
        Task<bool> UpdatePharmacy(BusinessTable bt);
        Task<IEnumerable<Events>> GetEvents();
        Task<bool> AddNewEvent(Events Event);
        Task<bool> UpdateEvent(Events events);
        Task<bool> DeleteEvent(int EventID);
        #endregion
    }
}
