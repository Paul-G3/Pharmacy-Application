namespace PharmacyManagement.Server.Models
{
    public class StockOrderMedication
    {
        public int MedStockID { get; set; }
        public int MedicationID { get; set; }
        public int StockOrderID { get; set; }
        public int Quantity { get; set; }
    }
}
