namespace PharmacyManagement.Server.ViewModels
{
    public class DispenseRequest
    {
        public int CustomerID { get; set; }
        public List<int>? Ids { get; set; }
        public float TotalAmount { get; set; }
        public float VatAmount { get; set; }
    }
}
