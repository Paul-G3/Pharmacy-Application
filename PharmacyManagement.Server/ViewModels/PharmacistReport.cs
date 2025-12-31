namespace PharmacyManagement.Server.ViewModels
{
    public class PharmacistReport
    {
        public DateTime? Date { get; set; }
        public int ?ScheduleLevel { get; set; }
        public string? MedName { get; set; }
        public string ?Patient { get; set; }
        public string ?IDNumber { get; set; }
        public string? PharmacistName { get; set; }
        public List<Medications> ?medications { get; set; }
    }

    public class Medications
    {
        public string ?MedName { get; set; }
        public string ?Instructions { get; set; }
        public int ?Quantity { get; set; }
        public decimal? Price { get; set; }

    }
}
