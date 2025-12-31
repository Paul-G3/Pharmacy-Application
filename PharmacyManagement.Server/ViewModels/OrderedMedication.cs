using System.Text.Json.Serialization;

namespace PharmacyManagement.Server.ViewModels
{
    public class OrderedMedication
    {
        public int PrescribedMedicationID { get; set; }
        public double price { get; set; } 
        public int quantity { get; set; }

    }
    public class PlaceOrderRequest
    {
        public List<OrderedMedication> medications { get; set; } = new();
        public double totalCost { get; set; }
        public double totalVat { get; set; }
    }
}
