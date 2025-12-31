namespace PharmacyManagement.Server.ViewModels
{
    public class DespinsedPriscriptionsViewModel
    {
        public DateTime? DispensedDate { get; set; }
        public int? PrescriptionID { get; set; }
        public string? PrescribedMedicationID { get; set; }
        public string? DoctorFullName { get; set; }
        public string? MedicationList { get; set; }
        public string? CustomerName { get; set; }
        public string? Status { get; set; }
    }
}
