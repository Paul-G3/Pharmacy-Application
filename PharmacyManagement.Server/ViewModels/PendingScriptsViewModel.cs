namespace PharmacyManagement.Server.ViewModels
{
    public class PendingScriptsViewModel
    {
        public string? CustomerName { get; set; }
        public string? IDNumber { get; set; }
        public string? Surname { get; set; }
        public DateTime? DOB { get; set; }
        public byte[]? PrescriptionBlob { get; set; }
        public string? FileName { get; set; }
        public int? UserID { get; set; }
        public int? PrescriptionID { get; set; }
        public string? Allergy { get; set; }
        public string? Dispense { get; set; }

    }
}
