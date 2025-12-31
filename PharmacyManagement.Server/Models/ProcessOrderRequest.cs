using PharmacyManagement.Server.ViewModels;

namespace PharmacyManagement.Server.Models
{
    public class ProcessOrderRequest
    {
            public int UserID { get; set; }
            public List<MedicationProcessDto> Medications { get; set; }
        

    }
}
