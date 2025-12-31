namespace PharmacyManagement.Server.Models
{
    public class PrescribedMedication
    {
        public int PrescribedMedID { get; set; }
        public int MedicationID { get; set; }
        public int PrescriptionID { get; set; }
        public string Instructions { get; set; }
        public int NumberOfRepeats { get; set; }
        public int NumberOfRepeatsLeft { get; set; }
        public int Quantity { get; set; }
    }
}
