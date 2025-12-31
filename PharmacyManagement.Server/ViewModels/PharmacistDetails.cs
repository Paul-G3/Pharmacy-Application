using PharmacyManagement.Server.Models;

namespace PharmacyManagement.Server.ViewModels
{
    public class PharmacistDetails
    {
        public int PharmacistID { get; set; }
        public string Name { get; set; }
        public string Surname { get; set; }
        public DateTime DOB { get; set; }
        public string AddressLine { get; set; }
        public string Email { get; set; }
        public string IDNumber { get; set; }
        public string HCRN { get; set; }
        public string PhoneNumber { get; set; }
        public string Gender { get; set; }
        public string? Status { get; set; }
        public byte[]? ProfilePic { get; set; }
    }
    public class IngredientDTO
    {
        public string Ingredient { get; set; }
    }
    public class DosageFormDTO
    {
        public string DosageForm { get; set; }
    }
    public class DoctorDTO
    {
        public string DoctorName { get; set; }
        public string DoctorSurname { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public string PracticeNumber { get; set; }
    }
    public class SupplierDTO
    {
        public string SupplierName { get; set; }
        public string ContactNumber { get; set; }
        public string ContactPerson { get; set; }
        public string EmailAddress { get; set; }
    }
    public class MedicationDTO
    {
        public MedicationItem Medication { get; set; }
        public SupplierItem Supplier { get; set; }
        public DosageItem Dosage { get; set; }

        public int ScheduleLevel { get; set; }
        public decimal Price { get; set; }
        public int CurrentQuantity { get; set; }
        public int ReOrderLevel { get; set; }
        public string Status { get; set; }

        public List<IngredientItem> ActiveIngredients { get; set; }
    }
    public class StockOrderDetails
    {
        public int MedicationID { get; set; }
        public string? MedicationName { get; set; }
        public int CurrentQuantity { get; set; }
        public int ReOrderLevel { get; set; }
        public string OrderedStatus { get; set; }
    }
    public class MedicationItem
    {
        public int MedicationID { get; set; }
        public string? MedicationName { get; set; }
    }

    public class SupplierItem
    {
        public int SupplierID { get; set; }
        public string? SupplierName { get; set; }
    }

    public class DosageItem
    {
        public int DosageID { get; set; }
        public string? DosageForm { get; set; }
    }

    public class IngredientItem
    {
        public int ActiveIngredientID { get; set; }
        public string? Ingredient { get; set; }
        public int Strength { get; set; }
        public string Status { get; set; }
    }

    public class MedBySupplierDTO
    {
        public int SupplierID { get; set; }
        public string SupplierName { get; set; }
        public List<MedicationName> MedArray { get; set; }
    }
    public class MedicationName
    {
        public int MedicationID { get; set; }
        public string MedName { get; set; }
    }
    public class MedicationOrderDTO
    {
        public int MedicationID { get; set; }
        public int QuantityOrdered { get; set; }
    }
    public class OrderDetails
    {
        public int StockOrderID { get; set; }
        public string SupplierName { get; set; }
        public DateTime OrderDate { get; set; }
        public string Status { get; set; }
        public List<OrderDt> Items { get; set; }
    }
    public class OrderDt
    {
        public string MedicationName { get; set; }
        public int QuantityOrdered { get; set; }
    }
    public class MedicationAddDTO
    {
        public int? MedicationID { get; set; }
        public string? MedicationName { get; set; }
        public int DosageID { get; set; }
        public int ScheduleLevel { get; set; }
        public decimal Price { get; set; }
        public int MedSupplierID { get; set; }
        public int ReOrderLevel { get; set; }
        public int? CurrentQuantity { get; set; }
        public List<Ingredientclass>? Ingredient {get; set;}
    }
    public class Ingredientclass
    {
        public int IngredientID { get; set; }
        public int Strength { get; set; }
    }
    public class ActivePharmacist
    {
        public int UserID { get; set; }
        public string Name { get; set; }
        public string Surname { get; set; }
        public string Phonenumber { get; set; }
    }
    public class UserDetails
    {
        public int UserID { get; set; }
        public string Name { get; set; }
        public string Surname { get; set; }
        public string Email { get; set; }
        public DateTime DOB { get; set; }
        public string PhoneNumber { get; set; }
        public string IDnumber { get; set; }
        public string AddressLine { get; set; }
    }
    public class UpdatePasswordDTO
    {
        public int? UserID { get; set; }
        public string Password { get; set; }
        public string CurrentPassword { get; set; }
    }
    public class StockTakingMeds
    {
        public int MedicationID { get; set; }
        public string MedName { get; set; }
        public int ReOrderLevel { get; set; }
        public int CurrentQuantity { get; set; }
        public string SupplierName { get; set; }
        public string DosageForm { get; set; }
        public string ScheduleLevel { get; set; }
    }
}
