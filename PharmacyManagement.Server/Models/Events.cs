namespace PharmacyManagement.Server.Models
{
    public class Events
    {
        public int EventsID { get; set; }
        public string EventName { get; set; }
        public string EventDescription { get; set; }
        public DateTime EventDate { get; set; }
        public string? EventStatus { get; set; }
    }
}
