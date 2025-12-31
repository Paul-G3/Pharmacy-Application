// MedicationTable.jsx
function MedicationTable({ medications, prescribedBy, date, onMedicationSelect, selectedMedications, customerAllergy }) {

    const handleCheckboxToggle = (medication) => {
        let updatedList;
        if (selectedMedications.includes(medication)) {
            updatedList = selectedMedications.filter(m => m !== medication);
        } else {
            updatedList = [...selectedMedications, medication];
        }
        onMedicationSelect(updatedList);
    };

    const allergyIngredients = Array.isArray(customerAllergy?.ingredients)
        ? customerAllergy.ingredients
        : customerAllergy?.ingredients
            ? [customerAllergy.ingredients]
            : [];

    console.log("Allergy ingredients array:", allergyIngredients);

    const allIngredients = medications?.flatMap(med => med.ingredients);
    console.log("fetch medication ingredients: ", allIngredients);

    return (
       
        <table className="dispensed-table">
            <thead>
                <tr>
                    <th>Medication</th>                   
                    <th>Repeats</th>
                    <th>Repeats Left</th>
                    <th>Available Quantity</th>
                    <th>Dispense Quantity</th>
                    <th>Price</th>
                    <th>Select</th>
                </tr>
            </thead>
            <tbody>
                {medications?.map((med, index) => {
                    const lowStock = med.currentQuantity < med.quantity;

                    // medication and its ingredients
                   // console.log(`Medication: ${med.medName}`, med.ingredients);

                    // Ensuring med.ingredients is an array
                    const medIngredientsArray = Array.isArray(med.ingredients)
                        ? med.ingredients
                        : med.ingredients
                            ? String(med.ingredients).split(",").map(i => i.trim())
                            : [];

                    const allergyIngredientsArray = Array.isArray(allergyIngredients)
                        ? allergyIngredients.flatMap(a => String(a).split(",").map(i => i.trim()))
                        : allergyIngredients
                            ? String(allergyIngredients).split(",").map(i => i.trim())
                            : [];


                    const hasAllergy = medIngredientsArray.some(ingredient =>
                        allergyIngredientsArray.some(allergy =>
                            allergy.toLowerCase() === ingredient.toLowerCase()
                        )
                    );

                 //   console.log("Has allergy?", hasAllergy);


                    const tooltipMessage = lowStock
                        ? "Low on stock, can't dispense medication"
                        : hasAllergy
                            ? "Customer is allergic to this medication"
                            : "";

                    return (
                        <tr
                            key={index}
                            className={`clickable-row ${lowStock ? "low-stock" : ""} ${hasAllergy ? "allergy-warning" : ""
                                }`}
                            onClick={(e) => {
                                if (!lowStock && !hasAllergy && e.target.type !== "checkbox") {
                                    handleCheckboxToggle(med);
                                }
                            }}
                            title={tooltipMessage}
                        >
                            <td>{med.medName} ({med.dosageForm})</td>
                            {/*<td>{med.doctorName}</td>*/}
                            {/*<td>{med.prescriptionDate?.split("T")[0]}</td>*/}
                            <td>{med.quantity}</td>
                            <td>{med.repeatsLeft}</td>
                            <td>{med.currentQuantity}</td>
                            <td>{med.quantity}</td>
                            <td>R {(med.price * med.quantity).toFixed(2)}</td>
                            <td>
                                <input
                                    type="checkbox"
                                    checked={selectedMedications.includes(med)}
                                    onChange={() => handleCheckboxToggle(med)}
                                    onClick={e => e.stopPropagation()}
                                    disabled={lowStock || hasAllergy}
                                />
                            </td>
                        </tr>
                    );
                })}
            </tbody>


        </table>
    );

}


export default MedicationTable;
