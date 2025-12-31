using PharmacyManagement.Server.ViewModels;

namespace PharmacyManagement.Server.Repositories.Settings
{
    public interface ISettingsRepositories
    {
        Task<string> GetProfilePic(int id);
        Task<bool> UploadProfilePic(int id,byte[] image);
        Task<IEnumerable<dynamic>> GetUserDetails(int id);
        Task<bool> UpdateDetails(UserDetails user);
        Task<bool> UpdatePassword(UpdatePasswordDTO model);
        Task<string> GetPharmacyName();
    }
}
