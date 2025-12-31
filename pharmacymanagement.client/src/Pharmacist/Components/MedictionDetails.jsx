import { useState, forwardRef, useImperativeHandle, useEffect } from "react";
import { getData,postData } from '../../SharedComponents/apiService';
import Loader from "../../SharedComponents/Loader";
import Select from "react-select";
import ToastSuccess from "../../SharedComponents/ToastSuccessModal"


const MedicationDetails = forwardRef(({ patientRef = [], setSectionDisabled }, ref) => {
    const [medications, setMedications] = useState([]);
    const [validationErrors, setValidationErrors] = useState([]);
    const [loadingMedications, setloadingMedications] = useState([]);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [toast, settoast] = useState({ visible: false, message: "", type: "", duration: 3000 });


    //useEffect(() => {
    //    // disable other section when there's at least one medication
    //    if (setSectionDisabled) {
    //        if (medications.length > 0) {
    //            setSectionDisabled(true);
    //        } else {
    //            setSectionDisabled(false);
    //        }
    //    }
    //}, [medications, setSectionDisabled]);

    useEffect(() => {
        if (setSectionDisabled) {
            setSectionDisabled(medications.length > 0);
        }
    }, [medications, setSectionDisabled]);



    useEffect(function fetchMedication(y) {
        async function fetchMedication() {
            try {
                setLoading(true)

                const result = await getData('/api/UploadScript/get-medication');
                setloadingMedications(Array.isArray(result) ? result : [result]);
                console.log("Fetched medication: ", result);
            } catch (error) {
                console.log("Cant fetch medication: ", error);
            } finally {
                setLoading(false)

            }
        }
        fetchMedication();
    }, []);

    async function rejectScript() {

        


        console.log("Prescr id: ", parseInt(patientRef?.current?.getValues().prescriptionID));
        const presId = parseInt(patientRef?.current?.getValues().prescriptionID)

        if (isNaN(presId)) {
            setShowRejectModal(false);

            settoast({
                visible: true,
                message: "Prescription successfully rejected ",
                type: "success",
                duration: 3000
            });

            return
        }

        try {

            const result = await postData(`/api/UploadScript/reject-script?id=${presId}`, {});

            if (result.success) {
                settoast({
                    visible: true,
                    message: result.message,
                    type: "success",
                    duration: 3000
                });
//                uploadRef.current.clearValues();
                patientRef.current.clearValues();
  //              medicationRef.current.clearValues();
            } else {
                settoast({
                    visible: true,
                    message: result.message || "An error occurred",
                    type: "error",
                    duration: 3000
                });
            }

        }
        catch (error) {
            console.log("Failed to reject prescription: ", error);
        }
        finally {
            setShowRejectModal(false);
        }
    }

    // Central allergy check function to be used in both cases (adding medication & saving prescription)
    const checkForAllergyConflicts = async () => {
        const allergies = patientRef?.current?.getValues().allergy || "";
        const allergiesList = allergies.split(",").map(a => a.trim().toLowerCase());
        let hasAllergy = false;

        medications.forEach((med) => {
            const selectedMed = loadingMedications.find(m => m.medicationID === parseInt(med.medication));
            if (!selectedMed) return;

            const medIngredients = selectedMed.ingredient.split(",").map(i => i.trim().toLowerCase());
            const conflict = allergiesList.some(allergy => medIngredients.includes(allergy));

            if (conflict) {
                           
                //alert(`Cannot prescribe ${selectedMed.medName} — patient is allergic.`);
                setShowRejectModal(true);
                hasAllergy = true;
            }
        });

        return !hasAllergy; // return true if no allergy, false if any found
    };

    // Main validation on save
    const validate = async () => {
        let isValid = true;
        const newErrors = [];

        medications.forEach((med, index) => {
            const errors = {
                medication: !med.medication,
                qty: !med.qty,
                instructions: !med.instructions,
                repeats: !med.repeats,
            };

            if (Object.values(errors).some(Boolean)) {
                isValid = false;
            }

            newErrors[index] = errors;
        });

        setValidationErrors(newErrors);

        const noAllergyConflict = await checkForAllergyConflicts();
        if (!noAllergyConflict) isValid = false;

        return isValid;
    };

    // Check allergy when adding a medication
    const addMedication = () => {

        if (setSectionDisabled) setSectionDisabled(true);


        const last = medications[medications.length - 1];
        const allergies = patientRef?.current?.getValues().allergy || "";
        const allergiesList = allergies.split(",").map(a => a.trim().toLowerCase());

        console.log("Here is the med details: ", medications);

        if (last) {
            const lastIndex = medications.length - 1;
            const errors = {
                medication: !last.medication,
                qty: !last.qty,
                instructions: !last.instructions,
                repeats: !last.repeats,
            };

            const selectedMed = loadingMedications.find(m => m.medicationID === parseInt(last.medication));

            if (selectedMed) {
                const medIngredients = selectedMed.ingredient.split(",").map(i => i.trim().toLowerCase());
                const hasAllergy = allergiesList.some(allergy => medIngredients.includes(allergy));

                if (hasAllergy) {
                    //alert(`Cannot prescribe ${selectedMed.medName} — patient is allergic.`);
                    setShowRejectModal(true);

                    return;
                }
            }

            if (Object.values(errors).some(Boolean)) {
                const updatedErrors = [...validationErrors];
                updatedErrors[lastIndex] = errors;
                setValidationErrors(updatedErrors);
                return;
            }
        }

        setMedications([
            ...medications,
            { medication: "", qty: "", instructions: "", repeats: "" },
        ]);
        setValidationErrors([...validationErrors, {}]);
    };

    const removeMedication = (index) => {
        const updated = medications.filter((_, i) => i !== index);
        const updatedErrors = validationErrors.filter((_, i) => i !== index);
        setMedications(updated);
        setValidationErrors(updatedErrors);
    };

    const updateMedication = (index, field, value) => {
        const updated = [...medications];
        updated[index][field] = value;

        if (field === "medication") {
            const selectedMed = loadingMedications.find(m => m.medicationID === parseInt(value));
            updated[index].ingredient = selectedMed?.activeIngredient || "";
            updated[index].medName = selectedMed?.medName || "";
            updated[index].dosageForm = selectedMed?.dosageForm || ""; 
            updated[index].vat = selectedMed?.vat || 0;
            updated[index].price = selectedMed?.price || 0;
        }

        setMedications(updated);

        const updatedErrors = [...validationErrors];
        if (!updatedErrors[index]) updatedErrors[index] = {};
        updatedErrors[index][field] = false;
        setValidationErrors(updatedErrors);
    };

    const inputStyle = (index, field) =>
        validationErrors[index]?.[field] ? { border: "1px solid red" } : {};

    useImperativeHandle(ref, () => ({
        validate,
        getMedications: () => medications,
        getValues: () => {
            // Calculating total price including VAT
            const totalWithVat = medications.reduce((acc, med) => {
                const price = parseFloat(med.price) || 0;
                const qty = parseFloat(med.qty) || 0;
                const vat = parseFloat(med.vat) *100 || 0;

                return acc + (price * qty) * (1 + vat / 100);
            }, 0);

            // Calculating total VAT amount separately
            const totalVatAmount = medications.reduce((acc, med) => {
                const price = parseFloat(med.price) || 0;
                const qty = parseFloat(med.qty) || 0;
                const vat = parseFloat(med.vat)*100 || 0;

                return acc + (price * qty * (vat / 100));
            }, 0);

            return {
                medications: medications.map((med) => ({
                    MedicationID: med.medication,
                    Quantity: med.qty,
                    instructions: med.instructions,
                    NumberOfRepeats: med.repeats,
                    ingredient: med.ingredient,
                    vat: med.vat,
                    price: med.price,
                })),
                TotalAmount: parseFloat(totalWithVat.toFixed(2)), 
                VatAmount: parseFloat(totalVatAmount.toFixed(2))

            };
        },

        clearValues: () => {
            setMedications([]); 
        }
    }));



    return (
        <div className="section medication-details">

            <Loader isLoading={loading} />

            {toast.visible && (
                <ToastSuccess type={toast.type} message={toast.message} duration={toast.duration} />
            )}

            <h3>Medication Prescribed</h3>
            <div id="medication-list">
                {medications.map((med, index) => (

                    <div key={index} className="medication-row">

                        <Select className="selectMed"
                            value={
                                med.medication
                                    ? {
                                        value: med.medication,
                                        label: `${med.medName} (${med.dosageForm})`,
                                    }
                                    : null
                            }
                            onChange={(selectedOption) =>
                                updateMedication(index, "medication", selectedOption?.value || "")
                            }
                            options={loadingMedications
                                .filter(
                                    (m) =>
                                        !medications.some(
                                            (medObj, idx) =>
                                                idx !== index && medObj.medication === m.medicationID
                                        ) // prevent duplicates
                                )
                                .map((m) => ({
                                    value: m.medicationID,
                                    label: `${m.medName} (${m.dosageForm})`,
                                }))}
                            placeholder="Select Medication"
                            styles={{
                                control: (base) => ({
                                    ...base,
                                    ...inputStyle(index, "medication"),
                                    minHeight: "35px",
                                    fontSize: "14px",
                                }),
                            }}
                            isSearchable
                        /> <span className="ValidationAstericMed ">*</span>

                        <input
                            type="number"
                            placeholder="Qty"
                            value={med.qty}
                            onChange={(e) => updateMedication(index, "qty", e.target.value)}
                            style={inputStyle(index, "qty")}
                        /> <span className="ValidationAstericMed ">*</span>

                        <input
                            type="text"
                            placeholder="Instructions"
                            value={med.instructions}
                            onChange={(e) => updateMedication(index, "instructions", e.target.value)}
                            style={inputStyle(index, "instructions")}
                        /> <span className="ValidationAstericMed ">*</span>

                        <input
                            type="number"
                            min={1}
                            max={6}
                            placeholder="Repeats (1 - 6)"
                            value={med.repeats}
                            onChange={(e) => {
                                const value = Math.max(1, Math.min(6, Number(e.target.value))); // clamp between 1 and 6
                                updateMedication(index, "repeats", value);
                            }}
                            style={inputStyle(index, "repeats")}
                        /> <span className="ValidationAstericMed ">*</span>

                        <button type="button" className="btn-cancel" onClick={() => removeMedication(index)}>−</button> 
                    </div>
                ))}
            </div>

            <button type="button" className="process-btn" onClick={addMedication} title="Click to add new medication">
                + Add Medication
            </button> 

            {showRejectModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Allergy Alert</h2>
                        <p>The patient is allergic to medication(s): </p>


                        {medications && medications.length > 0 ?
                            (
                                <ul>
                                    {medications.map((med, index) => (
                                        <li key={index}>{med.medName}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p> No medications found </p>
                            )

                        }

                        <p>Please reject the prescription and contact the doctor.</p>
                        <button onClick={() => setShowRejectModal(false)}>Close</button>
                        <button onClick={() => rejectScript()}>Reject</button>
                    </div>
                </div>
            ) }
        </div>
    );
});

export default MedicationDetails;
