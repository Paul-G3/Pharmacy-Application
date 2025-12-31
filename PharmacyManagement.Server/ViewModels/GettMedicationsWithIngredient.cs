namespace PharmacyManagement.Server.ViewModels
{
    public class GettMedicationsWithIngredient
    {
        public int? MedicationID { get; set; }
        public string? MedName { get; set; }
        public string? DosageForm { get; set; }
        public string? ScheduleLevel { get; set; }
        public double? Price { get; set; }
        public int? CurrentQuantity { get; set; }
        public int? ReOrderLevel { get; set; }
        public string? Status { get; set; }
        public int?  SupplierID { get; set; }
        public string? Ingredient { get; set; }
        public float? Vat { get; set; }

    }
}
