using PharmacyManagement.Server.Models;

namespace PharmacyManagement.Server.ViewModels
{
    public class GetCustomerWallergyViewModel
    {
        public int? UserID { get; set; }
        public string? Name { get; set; }
        public string? Surname { get; set; }
        public string? DOB { get; set; }
        public string? AddressLine { get; set; }
        public string? Email { get; set; }
        public string? IDNumber { get; set; }
        public string? Password { get; set; }
        public string? UserType { get; set; }
        public string? Gender { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Status { get; set; }
        public string? Allergy { get; set; }

    }
}
