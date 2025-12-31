using Dapper;
using Microsoft.Data.SqlClient;
using PharmacyManagement.Server.DataAccess;
using PharmacyManagement.Server.Models;
using PharmacyManagement.Server.ViewModels;
using System.Data;
using System.Diagnostics;
using System.Text;
using static System.Net.WebRequestMethods;

namespace PharmacyManagement.Server.Repositories.Manager
{
    public class ManagerRepository : IManagerRepository
    {
        private readonly ISqlDataAccess _db;
        private readonly EmailService emailService;


        public ManagerRepository(ISqlDataAccess _db, EmailService emailService)
        {
            this._db = _db;
            this.emailService = emailService;
        }
        #region DashBoard Page
        public async Task<IEnumerable<dynamic>> GetStockItems()
        {
            try
            {
                return await _db.GetData<dynamic, dynamic>("spGetCriticalStock", new { });
            }
            catch
            {
                return new List<dynamic>();
            }
        }
        public async Task<IEnumerable<dynamic>> GetOrderItems()
        {
            try
            {
                return await _db.GetData<dynamic, dynamic>("spGetTop3OrderDetails", new { });
            }
            catch
            {
                return new List<dynamic>();
            }
        }
        public async Task<IEnumerable<dynamic>> GetActiveMedicationCount()
        {
            try
            {
                return await _db.GetData<dynamic, dynamic>("spGetMedicationCount", new { });
            }
            catch
            {
                return new List<dynamic>();
            }
        }
        public async Task<IEnumerable<dynamic>> GetActiveSupplierCount()
        {
            try
            {
                return await _db.GetData<dynamic, dynamic>("spGetSupplierCount", new { });
            }
            catch
            {
                return new List<dynamic>();
            }
        }
        #endregion

        #region Management Page
        public async Task<IEnumerable<Doctor>> GetDoctors()
        {
            try
            {
                return await _db.GetData<Doctor, dynamic>("spGetDoctors", new { });
            }
            catch
            {
                return null;
            }
        }

        public async Task<IEnumerable<DosageForms>> GetDosageForm()
        {
            try
            {
                return await _db.GetData<DosageForms, dynamic>("spGetDosageForm", new { });
            }
            catch
            {
                return null;
            }
        }

        public async Task<IEnumerable<ActiveIngredient>> GetIngredients()
        {
            try
            {
                return await _db.GetData<ActiveIngredient, dynamic>("spGetIngredients", new { });
            }
            catch
            {
                return null;
            }
        }

        public async Task<IEnumerable<PharmacistDetails>> GetPharmacist()
        {
            try
            {
                return await _db.GetData<PharmacistDetails, dynamic>("spGetPharmacist", new { });
            }
            catch
            {
                return null;
            }
        }

        public async Task<IEnumerable<MedSupplier>> GetSuppliers()
        {
            try
            {
                return await _db.GetData<MedSupplier, dynamic>("spGetSuppliers", new { });
            }
            catch
            {
                return null;
            }
        }



        public async Task<bool> AddDoctors(DoctorDTO Dr)
        {
            try
            {
                await _db.SaveData<dynamic>("spAddDoctors", new { Dr.DoctorName, Dr.DoctorSurname, Dr.Email, Dr.PracticeNumber, Dr.PhoneNumber });
                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> AddDosageForm(DosageFormDTO Dosage)
        {
            try
            {
                await _db.SaveData<dynamic>("spAddDosageForm", new { Dosage.DosageForm });
                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> AddIngredients(IngredientDTO ingredient)
        {
            try
            {
                await _db.SaveData<dynamic>("spAddIngredients", new { ingredient.Ingredient });
                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> AddPharmacist(PharmacistDetails pharmacist)
        {
            var randompassword = PasswordGenerator.Generate();
            var password= PasswordHelper.HashPassword(randompassword);
            string emailBody = $@"Your new account has been successfully created.

                                Here is your temporary password: <strong>{randompassword}</strong>

                                For your security, you will be required to change this password immediately after you log in for the first time, so you will be redirected to the profile page.

                                You can log in at: <a href='https://soit-iis.mandela.ac.za/grp-04-11'>our official website</a>

                                We're excited to have you!

                                Kind Regards,
                                Manager";
            await emailService.SendEmailAsync($"{pharmacist.Name} {pharmacist.Surname}", pharmacist.Email!, "New Account", emailBody.Replace("\n", "<br />"));
            try
            {
                await _db.SaveData<dynamic>("spAddPharmacist", new
                {
                    pharmacist.Name,
                    pharmacist.Surname,
                    pharmacist.Email,
                    pharmacist.HCRN,
                    pharmacist.DOB,
                    pharmacist.AddressLine,
                    pharmacist.IDNumber,
                    pharmacist.PhoneNumber,
                    pharmacist.Gender,
                    Password = password
                });
                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> AddSuppliers(SupplierDTO sup)
        {
            try
            {
                await _db.SaveData<dynamic>("spAddSuppliers", new { sup.SupplierName, sup.ContactNumber,sup.ContactPerson, sup.EmailAddress });
                return true;
            }
            catch
            {
                return false;
            }
        }



        public async Task<bool> UpdateIngredient(ActiveIngredient ingredient)
        {
            try
            {
                await _db.SaveData<dynamic>("spUpdateIngredients", new { ingredient.ActiveIngredientID, ingredient.Ingredient });
                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> UpdateSuppliers(MedSupplier sup)
        {
            try
            {
                await _db.SaveData<dynamic>("spUpdateSupplier", new { sup.SupplierID, sup.SupplierName, sup.ContactNumber, sup.EmailAddress,sup.ContactPerson });
                return true;
            }
            catch
            {
                return false;

            }
        }

        public async Task<bool> UpdateDosageForm(DosageForms Dos)
        {
            try
            {
                await _db.SaveData<dynamic>("spUpdateDosageForm", new { Dos.DosageID, Dos.DosageForm });
                return true;
            }
            catch
            {
                return false;

            }
        }

        public async Task<bool> UpdatePharmacist(PharmacistDetails pharmacist)
        {
            try
            {
                await _db.SaveData<dynamic>("spUpdatePharmacist", new
                {
                    pharmacist.PharmacistID,
                    pharmacist.Name,
                    pharmacist.Surname,
                    pharmacist.Email,
                    pharmacist.HCRN,
                    pharmacist.DOB,
                    pharmacist.AddressLine,
                    pharmacist.IDNumber,
                    pharmacist.PhoneNumber,
                    pharmacist.Gender,
                });
                return true;
            }
            catch
            {
                return false;

            }
        }

        public async Task<bool> UpdateDoctors(Doctor Dr)
        {
            try
            {
                await _db.SaveData<dynamic>("spUpdateDoctor", new { Dr.DoctorName, Dr.DoctorSurname, Dr.DoctorID, Dr.ContactNumber, Dr.PracticeNumber, Dr.Email });
                return true;
            }
            catch
            {
                return false;

            }
        }



        public async Task<bool> DeleteIngredients(int IngredientID)
        {
            try
            {
                await _db.SaveData<dynamic>("spDeleteIngredient", new { IngredientID });
                return true;
            }
            catch
            {
                return false;

            }
        }

        public async Task<bool> DeleteSuppliers(int SupplierID)
        {
            try
            {
                await _db.SaveData<dynamic>("spDeleteSupplier", new { SupplierID });
                return true;
            }
            catch
            {
                return false;

            }
        }

        public async Task<bool> DeleteDosageForm(int DosageFormID)
        {
            try
            {
                await _db.SaveData<dynamic>("spDeleteDosageForm", new { DosageFormID });
                return true;
            }
            catch
            {
                return false;

            }
        }

        public async Task<bool> DeletePharmacist(int PharmacistID)
        {
            try
            {
                await _db.SaveData<dynamic>("spDeletePharmacist", new { PharmacistID });
                return true;
            }
            catch
            {
                return false;

            }
        }

        public async Task<bool> DeleteDoctors(int DoctorID)
        {
            try
            {
                await _db.SaveData<dynamic>("spDeleteDoctor", new { DoctorID });
                return true;
            }
            catch
            {
                return false;

            }
        }
        #endregion

        #region Medication Page
        public async Task<IEnumerable<MedicationDTO>> GetMedication()
        {
            try
            {
                var result = await _db.GetData<dynamic, dynamic>("spGetMedication", new { });

                var medications = new List<MedicationDTO>();

                foreach (var x in result)
                {
                    // Split IDs and names
                    var ingredientIDs = (x.IngredientIDs as string)?
                        .Split(',', StringSplitOptions.RemoveEmptyEntries) ?? Array.Empty<string>();

                    var ingredientNames = (x.Ingredients as string)?
                        .Split(',', StringSplitOptions.RemoveEmptyEntries) ?? Array.Empty<string>();

                    // Replace the following block in GetMedication() method:

                    var ingredientstrength = (x.Strength as string)?
                        .Split(',', StringSplitOptions.RemoveEmptyEntries) ?? Array.Empty<string>();

                    // Add this line to split Statuses
                    var ingredientStatuses = (x.IngredientStatuses as string)?
                        .Split(',', StringSplitOptions.RemoveEmptyEntries) ?? Array.Empty<string>();

                    var activeIngredients = ingredientIDs
                        .Zip(
                            ingredientNames.Zip(
                                ingredientstrength.Zip(ingredientStatuses, (strength, status) => new { strength, status }),
                                (name, ss) => new { name, ss.strength, ss.status }
                            ),
                            (id, nss) => new IngredientItem
                            {
                                ActiveIngredientID = int.Parse(id.Trim()),
                                Ingredient = nss.name.Trim(),
                                Strength = int.TryParse(nss.strength.Trim(), out var s) ? s : 0,
                                Status = nss.status?.Trim()
                            }
                        )
                        .ToList();

                    medications.Add(new MedicationDTO
                    {
                        Medication = new MedicationItem
                        {
                            MedicationID = x.MedicationID,
                            MedicationName = x.MedName
                        },
                        Dosage = new DosageItem
                        {
                            DosageID = x.DosageID,
                            DosageForm = x.DosageForm
                        },
                        Supplier = new SupplierItem
                        {
                            SupplierID = x.SupplierID,
                            SupplierName = x.SupplierName
                        },
                        ScheduleLevel = x.ScheduleLevel,
                        ReOrderLevel = x.ReOrderLevel,
                        CurrentQuantity = x.CurrentQuantity,
                        Price = x.Price,
                        Status = x.Status,
                        ActiveIngredients = activeIngredients
                    });
                }

                return medications;
            }
            catch
            {
                return null;
            }
        }
        public async Task<IEnumerable<StockOrderDetails>> GetStockOrderDetails()
        {
            try
            {
                var data = await _db.GetData<StockOrderDetails, dynamic>("spGetStockOrderDetails", new { });
                return data;
            }
            catch
            {
                return Enumerable.Empty<StockOrderDetails>();
            }
        }
        public async Task<IEnumerable<MedBySupplierDTO>> GetMedicationsBySupplier()
        {
            try
            {
                var result = await _db.GetData<dynamic, dynamic>("spGetMedBySupplier", new { });

                var grouped = result
                    .GroupBy(s => new { s.SupplierID, s.SupplierName })
                    .Select(g => new MedBySupplierDTO
                    {
                        SupplierID = g.Key.SupplierID,
                        SupplierName = g.Key.SupplierName,
                        MedArray = g.Select(x => new MedicationName
                        {
                            MedicationID = x.MedicationID,
                            MedName = x.MedName
                        }).ToList()
                    });

                return grouped;
            }
            catch
            {
                return null;
            }
        }
        public async Task<IEnumerable<dynamic>> GetActiveSupplier()
        {
            try
            {
                return await _db.GetData<dynamic, dynamic>("spGetActiveSupplier", new { });
            }
            catch
            {
                return null;
            }
        }
        public async Task<IEnumerable<dynamic>> GetActiveDosageForm()
        {
            try
            {
                return await _db.GetData<dynamic, dynamic>("spGetActiveDosageForm", new { });
            }
            catch
            {
                return null;
            }
        }
        public async Task<IEnumerable<ActiveIngredient>> GetActiveIngredients()
        {
            try
            {
                return await _db.GetData<ActiveIngredient, dynamic>("spGetActiveIngredients", new { });
            }
            catch
            {
                return null;
            }
        }
        public async Task<IEnumerable<StockTakingMeds>> GetStockTaking()
        {
            try
            {
                return await _db.GetData<StockTakingMeds, dynamic>("spGetMedicationReport", new { });
            }
            catch
            {
                return null;
            }
        }
        public async Task<bool> AddMedication(MedicationAddDTO medication)
        {
            try
            {
          
                var ingredientTable = ToIngredientTVP(medication.Ingredient ?? Enumerable.Empty<Ingredientclass>());

                var parameters = new DynamicParameters();
                parameters.Add("@MedicationName", medication.MedicationName);
                parameters.Add("@DosageID", medication.DosageID);
                parameters.Add("@ScheduleLevel", medication.ScheduleLevel);
                parameters.Add("@Price", medication.Price);
                parameters.Add("@MedSupplierID", medication.MedSupplierID);
                parameters.Add("@ReOrderLevel", medication.ReOrderLevel);
                parameters.Add("@Ingredient", ingredientTable.AsTableValuedParameter("dbo.IngredientTVP"));

                await _db.SaveData<dynamic>("spAddMedication", parameters);
                return true;
            }
            catch
            {
                return false;
            }
        }
        private static DataTable ToIngredientTVP(IEnumerable<Ingredientclass> ingredient)
        {
            var table = new DataTable();
            table.Columns.Add("IngredientID", typeof(int));
            table.Columns.Add("Strength", typeof(int));

            // Fix: Add both values in a single row, not as separate rows
            foreach (var ing in ingredient)
            {
                table.Rows.Add(ing.IngredientID, ing.Strength);
            }

            return table;
        }
        public async Task<bool> EditMedication(MedicationAddDTO medication)
        {
            try
            {
                var ingredientTable = ToIngredientTVP(medication.Ingredient ?? Enumerable.Empty<Ingredientclass>());

                var parameters = new DynamicParameters();
                parameters.Add("@MedicationID", medication.MedicationID);
                parameters.Add("@MedicationName", medication.MedicationName);
                parameters.Add("@DosageID", medication.DosageID);
                parameters.Add("@ScheduleLevel", medication.ScheduleLevel);
                parameters.Add("@Price", medication.Price);
                parameters.Add("@CurrentQuantity", medication.CurrentQuantity);
                parameters.Add("@MedSupplierID", medication.MedSupplierID);
                parameters.Add("@ReOrderLevel", medication.ReOrderLevel);
                parameters.Add("@Ingredient", ingredientTable.AsTableValuedParameter("dbo.IngredientTVP"));

                await _db.SaveData<dynamic>("spUpdateMedication", parameters);
                return true;
            }
            catch
            {
                return false;
            }
        }
        public async Task<bool> OrderMedication(List<MedicationOrderDTO> MedOrder)
        {
            var table = new DataTable();
            table.Columns.Add("MedicationID", typeof(int));
            table.Columns.Add("QuantityOrdered", typeof(int));

            foreach (var item in MedOrder)
            {
                table.Rows.Add(item.MedicationID, item.QuantityOrdered);
            }

            var parameters = new DynamicParameters();
            parameters.Add("OrderMedication", table.AsTableValuedParameter("dbo.OrderMedicationTVP"));

            // --- NEW: Define your admin email and a summary builder ---
            string adminEmail = "s225250306@mandela.ac.za";
            string adminName = "Health Hive Admin";
            var summaryBodyBuilder = new StringBuilder();
            summaryBodyBuilder.Append("<h1>Medication Order Summary</h1><p>The following orders were successfully sent to suppliers:</p>");
            // ---

            try
            {
                var suppliersData = await _db.GetData<dynamic, dynamic>("spCreateOrder", parameters);
                var groupedBySupplier = suppliersData.GroupBy(s => (string)s.EmailAddress);

                if (!groupedBySupplier.Any())
                {
                    // Handle case where the order resulted in no suppliers
                    summaryBodyBuilder.Append("<p><strong>No suppliers were found for this order.</strong></p>");
                }

                // 3. Loop through each GROUP (one group = one supplier)
                foreach (var supplierGroup in groupedBySupplier)
                {
                    // 4. Get the shared info for this supplier
                    string supplierEmail = supplierGroup.Key;
                    string contactPerson = (string)supplierGroup.First().ContactPerson;

                    // 5. Build an HTML table for the supplier's email body
                    var bodyBuilder = new StringBuilder();
                    bodyBuilder.Append("<p>We would like to place an order for the following medications:</p>");
                    bodyBuilder.Append("<table style='width: 100%; border-collapse: collapse; margin-top: 15px;'>");
                    bodyBuilder.Append("<thead><tr style='background-color: #f2f2f2;'>");
                    bodyBuilder.Append("<th style='padding: 10px; border: 1px solid #ddd; text-align: left;'>Medication Name</th>");
                    bodyBuilder.Append("<th style='padding: 10px; border: 1px solid #ddd; text-align: left;'>Quantity Ordered</th>");
                    bodyBuilder.Append("</tr></thead><tbody>");

                    // 6. Add a table row for each medication
                    foreach (var item in supplierGroup)
                    {
                        bodyBuilder.Append("<tr>");
                        bodyBuilder.Append($"<td style='padding: 10px; border: 1px solid #ddd;'>{item.MedName}</td>");
                        bodyBuilder.Append($"<td style='padding: 10px; border: 1px solid #ddd;'>{item.QuantityOrdered}</td>");
                        bodyBuilder.Append("</tr>");
                    }
                    bodyBuilder.Append("</tbody></table>");
                    bodyBuilder.Append("<p style='margin-top: 20px;'>Please confirm receipt of this order and provide an estimated delivery date.</p>");

                    // 7. Send the email to the supplier
                    await emailService.SendEmailAsync(
                        contactPerson,
                        supplierEmail,
                        "New Medication Order - Health Hive",
                        bodyBuilder.ToString()
                    );

                    // --- NEW: Add this supplier's order to your summary email ---
                    summaryBodyBuilder.Append($"<h2 style='margin-top: 30px; border-bottom: 2px solid #ccc; padding-bottom: 5px;'>Supplier: {contactPerson} ({supplierEmail})</h2>");
                    summaryBodyBuilder.Append(bodyBuilder.ToString()); // Append the same HTML table
                                                                       // ---
                }

                // --- NEW: Send the final summary email to yourself ---
                await emailService.SendEmailAsync(
                    adminName,
                    adminEmail,
                    "SUMMARY: All Medication Orders Placed",
                    summaryBodyBuilder.ToString()
                );
                // ---

                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Failed to process or send order emails: {ex.Message}");

                // --- NEW: Send a failure email to yourself ---
                try
                {
                    await emailService.SendEmailAsync(
                        adminName,
                        adminEmail,
                        "FAILED: Medication Order Attempt",
                        $"<p>The medication order process failed with an exception:</p><p><strong>{ex.Message}</strong></p><pre>{ex.StackTrace}</pre>"
                    );
                }
                catch (Exception emailEx)
                {
                    Console.WriteLine($"❌❌ Failed to send failure notification email: {emailEx.Message}");
                }
                // ---

                return false;
            }
        }
        public async Task<bool> DeleteMedication(int MedicationID)
        {
            try
            {
                await _db.SaveData<dynamic>("spDeleteMedication", new { MedicationID });
                return true;
            }
            catch
            {
                return false;
            }
        }
        public async Task<bool> RemoveProfilePic(int id)
        {
            try
            {
                await _db.SaveData<dynamic>("spRemoveProfilePicture", new { id });
                return true;
            }
            catch
            {
                return false;
            }
        }
        #endregion

        #region OrderPage
        public async Task<IEnumerable<OrderDetails>> GetOrderDetails()
        {
            try
            {
                // Use concrete types instead of dynamic
                var data = await _db.GetData<dynamic, dynamic>("spGetOrderDetails", new { });

                var groupedData = data
                    .GroupBy(x => new
                    {
                        x.StockOrderID,
                        x.SupplierName,
                        x.OrderDate,
                        x.Status
                    })
                    .Select(group => new OrderDetails
                    {
                        StockOrderID = group.Key.StockOrderID,
                        SupplierName = group.Key.SupplierName,
                        OrderDate = group.Key.OrderDate,
                        Status = group.Key.Status,
                        Items = group.Select(item => new OrderDt
                        {
                            MedicationName = item.MedicationName,
                            QuantityOrdered = item.QuantityOrdered
                        }).ToList()
                    });

                return groupedData;
            }
            catch (Exception ex)
            {
                // Log error
                return Enumerable.Empty<OrderDetails>();
            }
        }


        public async Task<bool> ApproveOrder(int stockOrderID)
        {
            try
            {
                await _db.SaveData<dynamic>("spApproveOrder", new { stockOrderID });
                return true;
            }
            catch
            {
                return false;
            }
        }
        #endregion

        #region InfoPage
        public async Task<IEnumerable<BusinessTable>> GetBusinessTables()
        {
            try
            {
                var data=await _db.GetData<dynamic, dynamic>("spGetPharmacyDetails",new {});
                var Password = PasswordHelper.HashPassword("Hadebe123!");
                await _db.SaveData<dynamic>("spUpdatePassword", new { Password, UserID = 2 });
                var result = data.Select(x => new BusinessTable
                {
                    BusinessID = x.BusinessID,
                    PharmacyName = x.PharmacyName,
                    websiteurl = x.websiteurl,
                    VAT = x.Vat,
                    HCRNumber = x.HCRNumber,
                    EmailAddress = x.EmailAddress,
                    PhysicalAddress = x.PhysicalAddress,
                    EmergencyContacts = new List<int?> { x.EmergencyContact1, x.EmergencyContact2 }
                });
                return result;
            }
            catch
            {
                return new List<BusinessTable>();
            }
        }
        public async Task<IEnumerable<ActivePharmacist>> GetActivePharmacists() 
        {
            try
            {
                return await _db.GetData<ActivePharmacist, dynamic>("spGetActivePharmacist", new { });
            }
            catch
            {
                return new List<ActivePharmacist>();
            }
        }
        public async Task<bool> UpdatePharmacy(BusinessTable bt)
        {
            try
            {
                await _db.SaveData<dynamic>("spUpdatePharmacydetails", new { bt.BusinessID, bt.PharmacyName, bt.EmailAddress, bt.websiteurl, bt.HCRNumber, bt.PhysicalAddress, bt.VAT, EmergencyContact1= bt.EmergencyContacts[0]});
                return true;
            }
            catch
            {
                return false;
            }
        }
        public async Task<IEnumerable<Events>> GetEvents()
        {
            try
            {
                return await _db.GetData<Events,dynamic>("spGetEvents", new { });
            }
            catch
            {
                return new List<Events>();
            }
        }
        public async Task<bool> AddNewEvent(Events Event)
        {
            try
            {
                await _db.SaveData<dynamic>("spAddEvent", new { Event.EventName, Event.EventDescription, Event.EventDate });
                return true;
            }
            catch
            {
                return false;
            }
        }
        public async Task<bool> UpdateEvent(Events events)
        {
            try
            {
                await _db.SaveData<dynamic>("spUpdateEvent", new { eventID=events.EventsID,events.EventName,events.EventDescription,events.EventDate });
                return true;

            }
            catch
            {
                return false;
            }
        }
        public async Task<bool> DeleteEvent(int EventID)
        {
            try
            {
                await _db.SaveData<dynamic>("sptoggleEvent", new { EventID });
                return true;
            }
            catch
            {
                return false;
            }
        }

        #endregion
    }
}
