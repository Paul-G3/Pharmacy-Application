using Microsoft.VisualBasic;

namespace PharmacyManagement.Server.ViewModels
{
    public class CustomerMedication
    {
        public int PrescriptionID { get; set; }
        public DateAndTime? Date { get; set; }

        public string? Doctor { get; set; }
        public string? Name { get; set; }
        public int PrescribedMedicationID { get; set; }
        public string?  MedName { get; set; }
        public string? Instructions { get; set; }
        public int NumberOfRepeats { get; set; }
        public int Quantity { get; set; } 
    }
}
