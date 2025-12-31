using PharmacyManagement.Server.DataAccess;
using PharmacyManagement.Server.ViewModels;

namespace PharmacyManagement.Server.Repositories.Settings
{
    public class SettingsRepositories:ISettingsRepositories
    {
        private readonly ISqlDataAccess _db;
        public SettingsRepositories(ISqlDataAccess _db)
        {
            this._db = _db;
        }

        public async Task<IEnumerable<dynamic>> GetUserDetails(int id)
        {
            try
            {
               var result= await _db.GetData<dynamic,dynamic>("spGetUserDetails", new { userID = id });
                return result;
            }
            catch
            {
                return Enumerable.Empty<dynamic>();
            }
        }

        public async Task<bool> UpdateDetails(UserDetails user)
        {
            try
            {
                await _db.SaveData<dynamic>("spUpdateUserDetails", new
                {
                    user.UserID,
                    user.Name,
                    user.Surname,
                    user.Email,
                    user.DOB,
                    user.PhoneNumber,
                    user.IDnumber,
                    user.AddressLine
                });
                await _db.SaveData<dynamic>("spUpdateUserDetails", new { user });
                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> UpdatePassword(UpdatePasswordDTO model)
        {
            bool isPasswordChange=await CheckCurrentPassword(model.CurrentPassword, (int)model.UserID);
            if (!isPasswordChange) return false;

            var Password= PasswordHelper.HashPassword(model.Password);
            try
            {
                await _db.SaveData<dynamic>("spUpdatePassword", new { Password,model.UserID });
                return true;
            }
            catch
            {
                return false;
            }
        }
        public async Task<bool> CheckCurrentPassword(string currentPassword,int userid)
        {
            try
            {

                //await _db.SaveData<dynamic>("updateTeams", new { passwordplay= CurrentPasswordHashed });

                var password = await _db.GetData<dynamic, dynamic>("spCheckPassword", new {userid});

                var record = password.FirstOrDefault();
                string storedHash = record?.Password ?? string.Empty;
                var isCorrect = PasswordHelper.VerifyPassword(currentPassword, storedHash);
                return isCorrect;
            }
            catch
            {
                return false;
            }
        }
        public async Task<string> GetProfilePic(int id)
        {
            try
            {
                // Fetch the image as a byte array (varbinary) from the database
                var imageList = await _db.GetData<byte[], dynamic>("spGetProfilePic", new { userId = id });
                var imageBytes = imageList?.FirstOrDefault();

                if (imageBytes != null && imageBytes.Length > 0)
                {
                    // Convert to base64 string for web display
                    return Convert.ToBase64String(imageBytes);
                }
                return null;
            }
            catch
            {
                return null;
            }
        }
        public async Task<bool> UploadProfilePic(int userId,byte[] image)
        {
            try
            {
                await _db.SaveData<dynamic>("spUploadProfilePic", new { userId,image });
                return true;
            }
            catch
            {
                return false;
            }
        }
        public async Task<string> GetPharmacyName()
        {
            try
            {
                var result = await _db.GetData<string, dynamic>("spGetPharmacyName", new { });
                return result?.FirstOrDefault();
            }
            catch
            {
                return null;
            }
        }

    }
}
