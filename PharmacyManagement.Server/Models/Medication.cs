namespace PharmacyManagement.Server.Models
{
    public class Medication
    {
        public int MedicationID { get; set; }
        public string MedName { get; set; }
        public int DosageID { get; set; }
        public string ScheduleLevel { get; set; }
        public double Price { get; set; }
        public int CurrentQuantity { get; set; }
        public int ReOrderLevel { get; set; }
        public string Status { get; set; }
        public int SupplierID { get; set; }
    }
}
