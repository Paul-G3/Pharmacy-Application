namespace PharmacyManagement.Server.Models
{
    public class OrderedMedication
    {
        public int OrderedMedID { get; set; }
        public int PrescribedMedID { get; set; }
        public double ItemPrice { get; set; }
        public double LineTotal { get; set; }
        public int Quantity { get; set; }
        public string Status { get; set; }
        public string RejectReason { get; set; }
        public int CustomerOrderID { get; set; }
    }
}
