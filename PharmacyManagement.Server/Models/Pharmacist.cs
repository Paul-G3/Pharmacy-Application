namespace PharmacyManagement.Server.Models
{
    public class Pharmacist
    {
        public int UserID { get; set; }
        public string HCRN { get; set; }
        public string Role { get; set; }
        public int ManagerID { get; set; }
        public string Status { get; set; }
    }
}
