namespace PharmacyManagement.Server.Models
{
    public class Prescription
    {
        public int? PrescriptionID { get; set; }
        public int? DoctorID { get; set; }
        public int? PharmacistID { get; set; }
        public DateTime? Date { get; set; }
        public byte[]? PrescriptionBlob { get; set; }
        public string? Status { get; set; }
        public string? Name { get; set; }
        public int? CustomerID { get; set; } 
    }
}
