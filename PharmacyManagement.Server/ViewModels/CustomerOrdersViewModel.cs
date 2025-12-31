namespace PharmacyManagement.Server.ViewModels
{
    public class CustomerOrdersViewModel
    {
        public int CustomerOrderID { get; set; }   
        public DateTime? Date { get; set; }
        public string? CustomerName { get; set; }
        public string? DocSurname { get; set; }
        public string? IDNumber { get; set; }
        public string? Status { get; set; }
        public string? CustomerAllergies { get; set; }
        public int? UserID { get; set; }
        public List<MedicationDetails> MedicationDetails { get; set; }
    }

    public class MedicationDetails
    {
        public double? vat { get; set; }
        public string? MedName { get; set; }
        public decimal? Price { get; set; }
        public int? PrescribedMedID { get; set; }
        public int? OrderMedicationID { get; set; }
        public int? CurrentQuantity { get; set; }
        public int? Quantity { get; set; }
        public int? RepeatsLeft { get; set; }
        public int? NumberOfRepeats { get; set; }
        public string? DosageForm { get; set; }
        public string? MedicationIngredients { get; set; }
    }
}
