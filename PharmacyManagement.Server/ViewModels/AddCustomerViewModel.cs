using PharmacyManagement.Server.Models;

namespace PharmacyManagement.Server.ViewModels
{
    public class AddCustomerViewModel
    {
        public User? user { get; set; }
        public List<CustomerAllergies>? customerAllergies { get; set; }
    }
}
