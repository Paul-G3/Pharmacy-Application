import { useState } from "react";
import {  postData } from "../../SharedComponents/apiService";
import ToastSuccess from "../../SharedComponents/ToastSuccessModal"

function DispensePrescription({ selectedMedications, refresh, setSelectedMed, selectdedCustomerID }) {

    const [showModal, setShowModal] = useState(false);
    const [toast, settoast] = useState({ visible: false, message: "", type: "", duration: 3000 });

    const handleDispenseClick = async () => {
                
        setShowModal(true); // Show modal      

    };


    const confirmDispense = async () => {
        // total based on price * quantity
        const total = selectedMedications.reduce((sum, med) => sum + med.price * med.quantity, 0);

        const Vat = selectedMedications[0]?.vat || 0;
        const calculatedVat = total * Vat / 100;
        const totalWithVat = total + calculatedVat;

        console.log("Vat amount: ", Vat);
        console.log("Calculated Vat amount: ", calculatedVat);
        console.log("Total with Vat amount: ", totalWithVat);



        try {
            const result = await postData("/api/Dispense/dispense-medications", {
                Ids: selectedMedications.map(med => med.prescribedMedicationID),
                CustomerID: selectdedCustomerID,
                TotalAmount: totalWithVat,
                VatAmount: calculatedVat,
                ItemPrice: selectedMedications.map(med => med.price * med.quantity) // send each med total
            });

            if (result.success) {
                settoast({
                    visible: true,
                    message: result.message,
                    type: "success",
                    duration: 3000
                });
            } else {
                settoast({
                    visible: true,
                    message: result.message || "An error occurred",
                    type: "error",
                    duration: 3000
                });
            }
        } catch (error) {
            console.log("Error dispensing: ", error);
        }

        setShowModal(false);
        refresh();
        setSelectedMed([]);

    };


    const cancelDispense = () => {
        setShowModal(false);
    };

    return (
        <div>
            
            <h3 className="dispenseHeadNme">Selected Medications</h3>
            <div className="medtoBeDispensed">
                <ul>
                    {selectedMedications.map((med) => (
                        <li key={med.prescribedMedicationID}>
                            {med.medName} ({med.quantity}) - R {(med.price * med.quantity).toFixed(2)}
                        </li>
                    ))}
                </ul>
            </div>

            <div className="totalsDispense">
                {selectedMedications.length > 0 && (() => {
                    const total = selectedMedications.reduce((sum, med) => sum + med.price * med.quantity, 0);
                    const vatPercent = selectedMedications[0]?.vat || 0;
                    const vatAmount = vatPercent/100 * total ;
                    const totalWithVat = total + vatAmount;

                    //console.log("Total amount", total)
                    //console.log("Get vat percentage", vatPercent)

                    //console.log("Get total vat amount", vatAmount)

                    return (
                        <>
                            <p>Total: R {totalWithVat.toFixed(2)}</p>
                            <p>VAT {vatPercent}%</p>
                        </>
                    )
                })()}
            </div>

            <button className="buttonToDispense process-btn" onClick={handleDispenseClick} disabled={selectedMedications.length === 0}>
                Dispense
            </button>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Confirm Dispense</h2>
                        <strong>Dispense Details: </strong>

                        <div className="totalsDispense">
                            <p>
                                Total: R{
                                    Math.round(
                                        (selectedMedications.reduce((sum, med) => sum + med.price * med.quantity, 0) +
                                            selectedMedications.reduce((sum, med) => sum + med.price * med.quantity, 0) *
                                            ((selectedMedications[0]?.vat|| 0) / 100)) * 100
                                    ) / 100
                                }
                            </p>
                            <p>VAT: {selectedMedications[0]?.vat || 0} %</p>
                        </div>

                        <div className="modal-buttons">
                            <button onClick={confirmDispense} className="btn-done">Yes, Dispense</button>
                            <button onClick={cancelDispense} className="btn-cancel">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {toast.visible && (
                <ToastSuccess type={toast.type} message={toast.message} duration={toast.duration} />
            )}
        </div>
    );
}

export default DispensePrescription;
