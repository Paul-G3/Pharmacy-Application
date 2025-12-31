using PharmacyManagement.Server.Models;

namespace PharmacyManagement.Server.ViewModels
{
    public class UploadScriptViewModel
    {
        public int CustomerID { get; set; }
        public int DoctorID { get; set; }
        public int PharmacistID { get; set; }
        public string? Name { get; set; }
        public float? TotalAmount { get; set; }
        public float? VatAmount { get; set; }
        public List<PrescribedMedication>? Medications { get; set; }
    }
}
