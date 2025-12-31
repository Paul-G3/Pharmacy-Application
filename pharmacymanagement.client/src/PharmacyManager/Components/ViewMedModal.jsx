// components/ViewMedicationModal.jsx
import React from 'react';
import medmodal from '../CSS_for_components/ModalStyle.module.css';

const ViewMedicationModal = ({ medication, onClose }) => {
    return (
        <div className={medmodal["modal-overlay"]}>
            <div className={medmodal["modal-content"]}>
                <div className={medmodal["modal-header"]}>
                    <h2>Medication Details</h2>
                </div>

                <div
                    className={medmodal["modal-body"]}
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "1em",
                        padding: "0 2em"
                    }}
                >
                    <div className={medmodal["detail-row"]}>
                        <span className={medmodal["detail-label"]}>Medication Name:</span>
                        <span className={medmodal["detail-value"]}>{medication.medication.medicationName}</span>
                    </div>

                    <div className={medmodal["detail-row"]}>
                        <span className={medmodal["detail-label"]}>Dosage Form:</span>
                        <span className={medmodal["detail-value"]}>{medication.dosageForm.dosageForm}</span>
                    </div>

                    <div className={medmodal["detail-row"]}>
                        <span className={medmodal["detail-label"]}>Supplier:</span>
                        <span className={medmodal["detail-value"]}>{medication.supplier.supplierName}</span>
                    </div>

                    <div className={medmodal["detail-row"]}>
                        <span className={medmodal["detail-label"]}>Schedule:</span>
                        <span className={medmodal["detail-value"]}>{medication.scheduleLevel}</span>
                    </div>

                    <div className={medmodal["detail-row"]}>
                        <span className={medmodal["detail-label"]}>Order Level:</span>
                        <span className={medmodal["detail-value"]}>{medication.reOrderLevel}</span>
                    </div>

                    <div className={medmodal["detail-row"]}>
                        <span className={medmodal["detail-label"]}>Current Quantity:</span>
                        <span className={medmodal["detail-value"]}>{medication.currentQuantity}</span>
                    </div>

                    <div className={medmodal["detail-row"]}>
                        <span className={medmodal["detail-label"]}>Current Sale Price:</span>
                        <span className={medmodal["detail-value"]}>R{medication.price.toFixed(2)}</span>
                    </div>

                    <div className={medmodal["detail-section"]}>
                        <h4>Active Ingredients</h4>
                        <ul className={medmodal["ingredients-list"]}>
                            {medication.activeIngredients.map((ingredient, index) => (
                                <li
                                    key={index}
                                    style={
                                        ingredient.status !== "Active"
                                            ? { color: "orangered", display: "flex", alignItems: "center", gap: "0.5em" }
                                            : {}
                                    }
                                >
                                    {ingredient.ingredient} - {ingredient.strength} mg
                                    {ingredient.status !== "Active" && (
                                        <span
                                            style={{
                                                background: "orangered",
                                                color: "white",
                                                borderRadius: "4px",
                                                padding: "0.1em 0.5em",
                                                marginLeft: "0.5em",
                                                fontSize: "0.85em",
                                                fontWeight: "bold"
                                            }}
                                        >
                                            ING BLOCKING
                                        </span>
                                    )}
                                </li>
                            ))}

                        </ul>
                        
                    </div>
                </div>

                <div className={medmodal["modal-footer"]}>
                    <button className={medmodal["close-btn"]} onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
};

export default ViewMedicationModal;
