using Dapper;
using Newtonsoft.Json;
using PharmacyManagement.Server.DataAccess;
using PharmacyManagement.Server.Models;
using PharmacyManagement.Server.ViewModels;
using System.Data;
using System.Net;
using System.Reflection;
using static System.Net.WebRequestMethods;

namespace PharmacyManagement.Server.Repositories.Pharmacist
{
    public class PharmacistRepository : IPharmacistRepository
    {
        private readonly ISqlDataAccess _db;
        private readonly EmailService emailService;

        public PharmacistRepository(ISqlDataAccess db,EmailService emailService)
        {
            _db = db;
            this.emailService = emailService;
        }

        // Upload Script Page

        //POSTING DATA
        public async Task<bool> UploadPrescriptiom(UploadScriptViewModel prescriptionData, List<PrescribedMedication> medicationList, byte[] prescriptionFileBytes, string Name, int id, DateOnly parsedDateOnly, int prescriptionID)
        {
            try
            {
                var medTable = new DataTable();
                medTable.Columns.Add("MedicationId", typeof(int));
                medTable.Columns.Add("Instructions", typeof(string));
                medTable.Columns.Add("NumberOfRepeats", typeof(int));
                medTable.Columns.Add("Quantity", typeof(int));

                foreach (var med in medicationList)
                {
                    medTable.Rows.Add(med.MedicationID, med.Instructions, med.NumberOfRepeats, med.Quantity);
                }

                var sql = "sp_PharmacistUploadScript";

                var parameters = new DynamicParameters();
                parameters.Add("@DoctorID", prescriptionData.DoctorID);
                parameters.Add("@CustomerID", prescriptionData.CustomerID);
                parameters.Add("@Prescription", prescriptionFileBytes);
                parameters.Add("@Name", Name);
                parameters.Add("@id", id);
                parameters.Add("@PrescriptionID", prescriptionID);
                parameters.Add("@Date", parsedDateOnly.ToDateTime(TimeOnly.MinValue), DbType.Date);
                parameters.Add("@Medications", medTable.AsTableValuedParameter("dbo.PrescribedMedicationTVP"));

                await _db.SaveData(sql, parameters);

                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> UploadDispensePrescriptiom(UploadScriptViewModel prescriptionData, List<PrescribedMedication> medicationList, byte[] prescriptionFileBytes, string Name, float totalPriceValue, float vatAmountValue, int id, DateOnly parsedDateOnly, int prescriptionID)
        {

            var customerData = await _db.GetData<User, dynamic>("sp_pharmacistGetCustomerEmail", new { id = prescriptionData.CustomerID });

            var medicationDetails = new List<string>();

            foreach (var med in medicationList)
            {
                var medData = await _db.GetData<Medication, dynamic>("sp_pharmacistGetMedicationEmail", new { id = med.MedicationID });

                var medInfo = medData.FirstOrDefault();
                if (medInfo != null)
                {
                    medicationDetails.Add($"- {medInfo.MedName} ({med.Quantity} units)");
                }
            }


            //var medicationName = await _db.GetData<Medication, dynamic>("sp_pharmacistGetMedicationEmail", new { id = medicationList.FirstOrDefault().MedicationID });

            string formattedMedicationList = string.Join("<br>", medicationDetails);

            // Create the email body
            string emailBody = $@"
                    <p>Dear {customerData.FirstOrDefault().Name},</p>

                    <p>Your prescription order is ready for collection.</p>

                    <p><strong>Order Details:</strong></p>
                    <p>{formattedMedicationList}</p>

                    <p>Please collect your order at your earliest convenience.</p>

                    <p>Kind regards,<br>Your Pharmacist</p>
                ";



            await emailService.SendEmailAsync($"{customerData.FirstOrDefault().Name} {customerData.FirstOrDefault().Surname}", customerData.FirstOrDefault().Email!, "Order Ready For Collection", emailBody);


            try
            {
                var medTable = new DataTable();
                medTable.Columns.Add("MedicationId", typeof(int));
                medTable.Columns.Add("Instructions", typeof(string));
                medTable.Columns.Add("NumberOfRepeats", typeof(int));
                medTable.Columns.Add("Quantity", typeof(int));

                foreach (var med in medicationList)
                {
                    medTable.Rows.Add(med.MedicationID, med.Instructions, med.NumberOfRepeats, med.Quantity);
                }

                var sql = "sp_PharmacistUploadandDispenseScript";

                var parameters = new DynamicParameters();
                parameters.Add("@DoctorID", prescriptionData.DoctorID);
                parameters.Add("@CustomerID", prescriptionData.CustomerID);
                parameters.Add("@Prescription", prescriptionFileBytes);
                parameters.Add("@Name", Name);
                parameters.Add("@TotalAmount", totalPriceValue);
                parameters.Add("@VatAmount", vatAmountValue);
                parameters.Add("@Medications", medTable.AsTableValuedParameter("dbo.PrescribedMedicationTVP"));
                parameters.Add("@id", id);
                parameters.Add("@PrescriptionID", prescriptionID);
                parameters.Add("@Date", parsedDateOnly.ToDateTime(TimeOnly.MinValue), DbType.Date);

                await _db.SaveData(sql, parameters);

                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> AddDoctorAsync(Doctor doctor)
        {
            try
            {
                var sql = "spAddDoctor";
                var parameters = new
                {
                    doctor.DoctorName,
                    doctor.DoctorSurname,
                    doctor.PracticeNumber,
                    doctor.ContactNumber,
                    doctor.Email
                };

                await _db.SaveData(sql, parameters);

                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<int> AddCustomerAsync(AddCustomerViewModel addCustomer)
        {
            var randompassword = PasswordGenerator.Generate();
            var password = PasswordHelper.HashPassword(randompassword);
            string emailBody = $@"Your new account has been successfully created.

                                Here is your temporary password: <strong>{randompassword}<strong/>

                                For your security, you will be required to change this password immediately after you log in for the first time.

                                You can log in at: <a href='https://soit-iis.mandela.ac.za/GRP-04-11'>our official website</a>

                                We're excited to have you!

                                Kind Regards
                                Your Pharmacist";
            await emailService.SendEmailAsync($"{addCustomer.user.Name} {addCustomer.user.Surname}", addCustomer.user.Email!, "New Account", emailBody);


            try
            {
                var allergyTable = new DataTable();

                allergyTable.Columns.Add("ActiveIngredientID", typeof(int));

                foreach (var id in addCustomer.customerAllergies)
                    allergyTable.Rows.Add(id.ActiveIngredientID);

                var parameters = new DynamicParameters();
                parameters.Add("@IDNumber", addCustomer.user.IDNumber);
                parameters.Add("@DOB", addCustomer.user.DOB);
                parameters.Add("@Surname", addCustomer.user.Surname);
                parameters.Add("@Name", addCustomer.user.Name);
                parameters.Add("@Password", password);
                parameters.Add("@AddressLine", addCustomer.user.AddressLine);
                parameters.Add("@Email", addCustomer.user.Email);
                parameters.Add("@PhoneNumber", addCustomer.user.PhoneNumber);
                parameters.Add("@Gender", addCustomer.user.Gender);
                parameters.Add("@Allergies", allergyTable.AsTableValuedParameter("dbo.AllergyList"));


                var sql = "sp_AddCustomerWithAllergies";

                var newCustomerID = await _db.ExecuteScalarAsync<int>(sql, parameters);
                return newCustomerID;

            }
            catch
            {
                return 0;
            }
        }

        public async Task DispenseMedication(int customerId, List<int> ids, float TotalAmount, float VatAmount, int pharmacistId)
        {
            try
            {
                //Here I convert the list of IDs into a DataTable
                var table = new DataTable();
                table.Columns.Add("ID", typeof(int));

                foreach (var id in ids)
                {
                    table.Rows.Add(id);
                }

                var parameters = new DynamicParameters();
                parameters.Add("@CustomerId", customerId);
                parameters.Add("@TotalAmount", TotalAmount);
                parameters.Add("@VatAmount", VatAmount);
                parameters.Add("@Ids", table.AsTableValuedParameter("dbo.IntList"));
                parameters.Add("@PharmacistID", pharmacistId);
                

                await _db.SaveData("sp_PharmacistDispenseMedication", parameters);
            }
            catch
            {
            }
           
        }




        //UPDATING DATA

        public async Task<bool> CollectPrescription(List<int> prescribedMedicationIds)
        {
            try
            {
                var table = new DataTable();
                table.Columns.Add("Id", typeof(int));

                foreach (var id in prescribedMedicationIds)
                    table.Rows.Add(id);

                var parameters = new DynamicParameters();

                parameters.Add("PrescribedMedicationIDs", table.AsTableValuedParameter("CollectScriptTvp"));

                await _db.SaveData("sp_PharmacistPrescriptionCollection", parameters);
                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> ProcessOrder(List<(int? PrescribedMedicationID, int? OrderedMedicationID)> medications, int id, int userID)
        {
           

            try
            {
                var tvpTable = new DataTable();

                tvpTable.Columns.Add("PrescribedMedicationID", typeof(int));
                tvpTable.Columns.Add("OrderedMedicationID", typeof(int));

                foreach( var med in medications)
                {
                    tvpTable.Rows.Add(med.PrescribedMedicationID, med.OrderedMedicationID);
                }

                var paameters = new DynamicParameters();

                paameters.Add("medications", tvpTable.AsTableValuedParameter("MedicationProcessTVP"));
                paameters.Add("@PharmacistID", id);

                await _db.SaveData("sp_PharmacistProcessOrder", paameters);

                var customerData = await _db.GetData<User, dynamic>("sp_pharmacistGetCustomerEmail", new { id = userID });

                var medicationDetails = new List<string>();

                foreach (var prescribedMedmed in medications)
                {
                    var prescribedMeds = await _db.GetData<PrescribedMedication, dynamic>("sp_pharmacistPrescribedMedReport", new { id = medications.FirstOrDefault().PrescribedMedicationID });

                    var medData = await _db.GetData<Medication, dynamic>("sp_pharmacistGetMedicationEmail", new { id = prescribedMeds.FirstOrDefault().MedicationID });

                    var medInfo = medData.FirstOrDefault();
                    if (medInfo != null)
                    {
                        medicationDetails.Add($"- {medInfo.MedName} ({prescribedMeds.FirstOrDefault().Quantity} units)");
                    }
                }


                //var medicationName = await _db.GetData<Medication, dynamic>("sp_pharmacistGetMedicationEmail", new { id = medicationList.FirstOrDefault().MedicationID });

                string formattedMedicationList = string.Join("<br>", medicationDetails);

                // Create the email body
                string emailBody = $@"
                    <p>Dear {customerData.FirstOrDefault().Name},</p>

                    <p>Your prescription order is ready for collection.</p>

                    <p><strong>Order Details:</strong></p>
                    <p>{formattedMedicationList}</p>

                    <p>Please collect your order at your earliest convenience.</p>

                    <p>Kind regards,<br>Your Pharmacist</p>
                ";



                await emailService.SendEmailAsync($"{customerData.FirstOrDefault().Name} {customerData.FirstOrDefault().Surname}", customerData.FirstOrDefault().Email!, "Order Ready For Collection", emailBody);




                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> RejectOrder(int CustomerOrderID)
        {
            try
            {
                var parameters = new
                {
                    CustomerOrderID,
                };

                await _db.SaveData("sp_PharmacistRejectOrder", parameters);

                return true;
            }
            catch
            {
                return false;
            }

        }

        public async Task<bool> RejectPrescription(int id)
        {
            try
            {

                await _db.SaveData("sp_PharmacistRejectPrescription", new { id });
                return true;
            }
            catch
            {
                return false;
            }
        }

        //GETTING DATA
        public async Task<IEnumerable<dynamic>>GetDashoardCounts()
        {
            try
            {
                return await _db.GetData<dynamic, dynamic>("sp_PharmacistDashboardCounts", new { });
            }
            catch
            {
                return null;
            }
        }

        public async Task<IEnumerable<dynamic>>GetDashoardWalkinCounts()
        {
            try
            {
                return await _db.GetData<dynamic, dynamic>("sp_PharmacistDashboardWalkinCounts", new { });
            }
            catch
            {
                return null;
            }
        }

        public async Task<IEnumerable<dynamic>> GetDashoardPendingOrderCounts()
        {
            try
            {
                return await _db.GetData<dynamic, dynamic>("sp_PharmacistDashboardPending", new { });
            }
            catch
            {
                return null;
            }
        }

        public async Task<IEnumerable<dynamic>> GetDashoardProcessedOrderCounts()
        {
            try
            {
                return await _db.GetData<dynamic, dynamic>("sp_PharmacistProcessedOrders", new { });
            }
            catch
            {
                return null;
            }
        }
        public async Task<IEnumerable<dynamic>> GetDashoardCollectedOrderCounts ()
        {
            try
            {
                return await _db.GetData<dynamic, dynamic>("sp_PharmacistCollectedOrders", new { });
            }
            catch
            {
                return null;
            }
        }

        public async Task<IEnumerable<GetCustomerWallergyViewModel>> GetCustomersAsync()
        {
            try
            {
                string sql = "sp_PharmacistGetAllCustomers";
                return await _db.GetData<GetCustomerWallergyViewModel, dynamic>(sql, new { });
            }
            catch
            {
                return null;
            }

        }

        public async Task<IEnumerable<Doctor>> GetDoctorsAsync()
        {
            try
            {
                string sql = "sp_PharmacistGetAllDoctors";
                return await _db.GetData<Doctor, dynamic>(sql, new { });
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
                return await _db.GetData<ActiveIngredient, dynamic>("sp_PharmacistGetActiveIngredients", new { });
            }
            catch
            {
                return null;
            }
        }

        public async Task<IEnumerable<GettMedicationsWithIngredient>> GetMedications()
        {
            try
            {
                var sql = "sp_PharmacistGetMedication";
                return await _db.GetData<GettMedicationsWithIngredient, dynamic>(sql, new { });
            }
            catch
            {
                return null;
            }
        }

        public async Task<IEnumerable<PendingScriptsViewModel>> GetPendingPrescriptions()
        {
            try
            {
                var sql = "sp_PharmacistGetPendingScripts";
                return await _db.GetData<PendingScriptsViewModel, dynamic>(sql, new { });
            }
            catch
            {
                return null;
            }
        }

        
        public async Task<IEnumerable<GetPrescriptionsToDispense>> GetMedicationsToDispense(GetPrescriptionsToDispense meds)
        {
            try
            {
                var sql = "sp_PharmacistGetMedicationToDispense";

                // Get the raw result set as dynamic objects
                var orderdata = await _db.GetData<dynamic, dynamic>(sql, new { meds.CustomerID });

                var grouped = orderdata
                    .GroupBy(s => new { s.CustomerID, s.PrescriptionDate, s.DoctorName, s.PrescriptionID })
                    .Select(g => new GetPrescriptionsToDispense
                    {
                        CustomerID = g.Key.CustomerID,
                        PrescriptionDate = g.Key.PrescriptionDate,
                        DoctorName = g.Key.DoctorName,
                        PrescriptionID = g.Key.PrescriptionID,

                        MedicationDetails = g.Select(x => new MedicationToDispenseDetails
                        {
                            MedName = x.MedName,
                            PrescribedMedicationID = x.PrescribedMedicationID,
                            MedicationId = x.MedicationId,
                            Instructions = x.Instructions,
                            Ingredients = x.Ingredients,
                            Price = x.Price,
                            PrescribedMedID = x.PrescribedMedID,
                            CurrentQuantity = x.CurrentQuantity,
                            Quantity = x.Quantity,
                            RepeatsLeft = x.RepeatsLeft,
                            NumberOfRepeats = x.NumberOfRepeats,
                            DosageForm = x.DosageForm,
                            OrderMedicationID = x.OrderMedicationID,
                            Vat = x.Vat,
                        }).ToList()
                    });

                return grouped;
            }
            catch
            {
                return null;
            }
        }

        public async Task<IEnumerable<User>> GetDispenseUserDropDown()
        {
            try
            {
                return await _db.GetData<User, dynamic>("sp_PharmacistCustomerDropDown", new { });
            }
            catch
            {
                return null;
            }
        }
                
        public async Task<IEnumerable<DespinsedPriscriptionsViewModel>> GetDespinsedPriscriptions()
        {
            try
            {
                return await _db.GetData<DespinsedPriscriptionsViewModel, dynamic>("sp_PharmacistGetProcessedCripts", new { });
            }
            catch
            {
                return null;
            }
        }

        public async Task<IEnumerable<DespinsedPriscriptionsViewModel>> GetCollectedPriscriptions()
        {
            return await _db.GetData<DespinsedPriscriptionsViewModel, dynamic>("sp_PharmacistGetCollectedScripts", new { });
        }

        public async Task<IEnumerable<DespinsedPriscriptionsViewModel>> GetWalkInOrders()
        {
            return await _db.GetData<DespinsedPriscriptionsViewModel, dynamic>("ps_PharmacistGetWalkInOrders", new { });
        }

        public async Task<IEnumerable<CustomerOrdersViewModel>> GetPeningOrders()
        {
            try
            {
                var orderdata = await _db.GetData<dynamic, dynamic>("sp_PharmacistGetPendingOrders", new { });

                var grouped = orderdata
                    .GroupBy(s => s.CustomerOrderID)
                    .Select(g => new CustomerOrdersViewModel
                    {
                        CustomerOrderID = g.Key,
                        Date = g.First().Date,
                        CustomerName = g.First().CustomerName,
                        IDNumber = g.First().IDNumber,
                        CustomerAllergies = g.First().CustomerAllergies,
                        UserID = g.First().UserID,

                        MedicationDetails = g.Select(x => new MedicationDetails
                        {
                            MedicationIngredients = x.MedicationIngredients,
                            MedName = x.MedName,
                            Price = x.Price,
                            PrescribedMedID = x.PrescribedMedID,
                            CurrentQuantity = x.CurrentQuantity,
                            Quantity = x.Quantity,
                            RepeatsLeft = x.RepeatsLeft,
                            NumberOfRepeats = x.NumberOfRepeats,
                            DosageForm = x.DosageForm,
                            OrderMedicationID = x.OrderMedicationID,
                            vat = x.vat
                        }).ToList()
                    })
                    .ToList();


                return grouped;
            }
            catch
            {
                return null;
            }            
        }

        public async Task<IEnumerable<CustomerOrdersViewModel>> GetProcessedRejectedOrders()
        {
            
            try
            {
                var orders = await _db.GetData<dynamic, dynamic>("sp_PharmacistGetProcessedOrRejectedOrders", new { });

                var grouped = orders
                    .GroupBy(s => new { s.CustomerOrderID, s.Date, s.CustomerName, s.IDNumber, s.Status })
                    .Select(g => new CustomerOrdersViewModel
                    {
                        CustomerOrderID = g.Key.CustomerOrderID,
                        Date = g.Key.Date,
                        CustomerName = g.Key.CustomerName,
                        IDNumber = g.Key.IDNumber,
                        Status = g.Key.Status,

                        MedicationDetails = g.Select(x => new MedicationDetails
                        {
                            MedName = x.MedName,
                            Price = x.Price,
                            PrescribedMedID = x.PrescribedMedID,
                            CurrentQuantity = x.CurrentQuantity,
                            Quantity = x.Quantity,
                            RepeatsLeft = x.RepeatsLeft,
                            NumberOfRepeats = x.NumberOfRepeats,
                            DosageForm = x.DosageForm,
                            OrderMedicationID = x.OrderMedicationID,
                        }).ToList()
                    });

                return grouped;
            }
            catch
            {
                return null;
            }
        }

        public async Task<IEnumerable<PharmacistReport>> GetPharmacistReport(int id)
        {
            try
            {

                var report = await _db.GetData<dynamic, dynamic>("sp_PharmacistReport", new {pharmacistID = id});

                var gouped = report
                    .GroupBy(s => new { s.Date, s.ScheduleLevel, s.MedName, s.Patient, s.IDNumber, s.PharmacistName })
                    .Select( g => new PharmacistReport
                    {
                        Date = g.Key.Date,
                        ScheduleLevel = g.Key.ScheduleLevel,
                        MedName = g.Key.MedName,
                        Patient = g.Key.Patient,
                        IDNumber = g.Key.IDNumber,
                        PharmacistName = g.Key.PharmacistName,

                        medications = g.Select( x => new Medications
                        {
                            MedName = x.MedName,
                            Instructions = x.Instructions,
                            Quantity = x.Quantity,
                            Price = x.Price,

                        }).ToList()
                    });

                return gouped;
            }
            catch
            {
                return null;
            }
        }

    }
}
