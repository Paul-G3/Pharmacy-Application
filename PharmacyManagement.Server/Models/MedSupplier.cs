namespace PharmacyManagement.Server.Models
{
    public class MedSupplier
    {
        public int SupplierID { get; set; }
        public string SupplierName { get; set; }
        public string ContactNumber { get; set; }
        public string ContactPerson { get; set; }
        public string EmailAddress { get; set; }
        public string? Status { get; set; }
    }
}
