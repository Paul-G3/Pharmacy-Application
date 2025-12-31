namespace PharmacyManagement.Server.Models
{
    public class Doctor
    {
        public int ?DoctorID { get; set; }
        public string? DoctorName { get; set; }
        public string ?DoctorSurname { get; set; }
        public string ?PracticeNumber { get; set; }
        public string ?ContactNumber { get; set; }
        public string ?Email { get; set; }
        public string ?Status { get; set; }
    }
}
