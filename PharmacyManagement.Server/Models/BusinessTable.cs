namespace PharmacyManagement.Server.Models
{
    public class BusinessTable
    {
        public int BusinessID { get; set; }
        public string PharmacyName { get; set; }
        public string HCRNumber { get; set; }
        public string PhysicalAddress { get; set; }
        public List<int?> EmergencyContacts { get; set; }
        public string EmailAddress { get; set; }
        public string websiteurl { get; set; }
        public double VAT { get; set; }
    }
}