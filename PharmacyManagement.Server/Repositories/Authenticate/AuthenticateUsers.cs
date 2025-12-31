using Microsoft.SqlServer.Server;
using PharmacyManagement.Server.DataAccess;
using PharmacyManagement.Server.Models;
using PharmacyManagement.Server.ViewModels;

namespace PharmacyManagement.Server.Repositories.Authenticate
{
    public class AuthenticateUsers:IAuthenticateUsers
    {
        private readonly ISqlDataAccess dataAccess;
        public AuthenticateUsers(ISqlDataAccess sqlDataAccess)
        {
            dataAccess = sqlDataAccess;
        }
        public async Task<User?> AuthenticateUser(User user)
        {
            var passwordList = await dataAccess.GetData<dynamic, dynamic>("spIsUserPassword", new { user.Email });

            var record = passwordList.FirstOrDefault();
            string storedHash = record?.Password ?? string.Empty;

            bool isValidPassword = PasswordHelper.VerifyPassword(user.Password, storedHash);

            if (!isValidPassword) return null;

            var data = await dataAccess.GetData<User, dynamic>("sp_Login",new { user.Email });

            return data.FirstOrDefault();
        }

        public async Task<IEnumerable<dynamic>> GetResposnsiblePharmacist()
        {
            try
            {
                return await dataAccess.GetData<dynamic, dynamic>("spGetResposnsiblePharmacist", new { });
            }
            catch
            {
                return new List<dynamic>();
            }
        }

        public async Task<dynamic> ForgotPassword(ForgotPassword forgot)
        {
            try
            {
                var data =  await dataAccess.GetData<dynamic, dynamic>("spUserForgotPassword", new {forgot.Email, forgot.IDNumber });
                return data.FirstOrDefault();
            }
            catch (Exception ex)
            {
                throw; // rethrow so you see 500
            }
        }

        public async Task<bool> UpdatePassword(string Password, int UserID)
        {
            try
            {
                await dataAccess.SaveData("sp_NewPassowrdForgotten", new { Password, UserID });
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }
    }
}
