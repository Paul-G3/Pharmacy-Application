namespace PharmacyManagement.Server.Models
{
    public class CustomerOrder
    {
        public int CustomerOrderID { get; set; }
        public int CustomerID { get; set; }
        public int PharmacistID { get; set; }
        public DateTime Date { get; set; }
        public string Status { get; set; }
        public double TotalAmount { get; set; }
        public double VATAmount { get; set; }
    }
}
