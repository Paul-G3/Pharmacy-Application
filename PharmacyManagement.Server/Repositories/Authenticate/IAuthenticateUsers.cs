using PharmacyManagement.Server.Models;
using PharmacyManagement.Server.ViewModels;

namespace PharmacyManagement.Server.Repositories.Authenticate
{
    public interface IAuthenticateUsers
    {
        Task<User?> AuthenticateUser(User user);
        Task<IEnumerable<dynamic>> GetResposnsiblePharmacist();
        Task<dynamic> ForgotPassword(ForgotPassword forgot);
        Task<bool> UpdatePassword(string Password, int UserID);

    }

}
