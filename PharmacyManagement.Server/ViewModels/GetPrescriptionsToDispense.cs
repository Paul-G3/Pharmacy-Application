namespace PharmacyManagement.Server.ViewModels
{
    public class GetPrescriptionsToDispense
    {
        public int? CustomerID{ get; set; }
        public int? PrescriptionID { get; set; }        
        public string? DoctorName { get; set; }       
        public DateTime PrescriptionDate { get; set; }
        public List<MedicationToDispenseDetails> ?MedicationDetails { get; set; }
    }


    public class MedicationToDispenseDetails
    {
        public int? PrescribedMedicationID { get; set; }
        public int? MedicationId { get; set; }
        public string? Instructions { get; set; }
        public double? Vat { get; set; }
        public string? Ingredients { get; set; }
        public string? MedName { get; set; }
        public decimal? Price { get; set; }
        public int? PrescribedMedID { get; set; }
        public int? OrderMedicationID { get; set; }
        public int? CurrentQuantity { get; set; }
        public int? Quantity { get; set; }
        public int? RepeatsLeft { get; set; }
        public int? NumberOfRepeats { get; set; }
        public string? DosageForm { get; set; }
    }
}
