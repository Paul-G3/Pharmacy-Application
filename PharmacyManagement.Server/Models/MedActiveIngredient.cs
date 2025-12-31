namespace PharmacyManagement.Server.Models
{
    public class MedActiveIngredient
    {
        public int MedActiveIngrdID { get; set; }
        public int ActiveIngredientID { get; set; }
        public int MedicationID { get; set; }
        public string IngredientStrength { get; set; }
    }
}
