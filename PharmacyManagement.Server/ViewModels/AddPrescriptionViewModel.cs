using Microsoft.AspNetCore.Mvc;
using PharmacyManagement.Server.Models;

namespace PharmacyManagement.Server.ViewModels
{
    public class AddPrescriptionViewModel
    {
        public string? Name { get; set; }
        public UploadScriptViewModel? Prescription { get; set; }
        public List<PrescribedMedication>? Medications { get; set; }
        public string? prescriptionBlob { get; set; }

    }
}
