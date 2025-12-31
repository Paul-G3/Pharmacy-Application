namespace PharmacyManagement.Server.ViewModels
{
    public class ActiveIngredientCustomer
    {
        public int ActiveIngredientID { get; set; }
        public int CustomerAllergyID { get; set; }
        public string? Ingredient { get; set; }
        public string? Status { get; set; }
    }
}
