namespace PharmacyManagement.Server.Models
{
    public class StockOrder
    {
        public int StockOrderID { get; set; }
        public double StockOrderTotal { get; set; }
        public string Status { get; set; }
        public DateTime OrderDate { get; set; }
    }
}