import React from 'react';
import '../CSS_for_components/MedicationCardCss.css';

const MedicationCard = ({ medication }) => {
    return (
        <div className="medication-card">
            <div className="medication-top">
                <div className="medication-header">
                    <div className="label-group">
                        <div className="label">Medication Name</div>
                        <div className="value">{medication.name}</div>
                    </div>
                    <div className="label-group">
                        <div className="label">Dosage Form</div>
                        <div className="value">{medication.dosageForm}</div>
                    </div>
                    <div className="menu-icon">⋮</div>
                </div>

                <div className="medication-details">
                    <div className="label-group">
                        <div className="label">Supplier</div>
                        <div className="value">{medication.supplier}</div>
                    </div>
                    <div className="label-group">
                        <div className="label">Schedule</div>
                        <div className="value">{medication.schedule}</div>
                    </div>
                    <div className="label-group">
                        <div className="label">Quantity</div>
                        <div className="value">{medication.quantity}</div>
                    </div>
                    <div className="label-group">
                        <div className="label">Ingredient</div>
                        <div className="value">{medication.ingredient}</div>
                    </div>
                </div>
            </div>

            <div className="medication-bottom" />
        </div>
    );
};

export default MedicationCard;
