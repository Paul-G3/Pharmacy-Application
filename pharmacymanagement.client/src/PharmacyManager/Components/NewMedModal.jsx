import React, { useState } from 'react';
import medmodal from '../CSS_for_components/ModalStyle.module.css';

const AddMedicationModal = ({ isOpen, onClose, onAddMedication, suppliers, dosageFormOptions, ingredientOptions }) => {
    const initialFormState = {
        MedicationName: '',
        DosageID: '',
        ScheduleLevel: '',
        Ingredient: [{ IngredientID: '', strength: '' }],
        MedSupplierID: '',
        Price: '',
        ReOrderLevel: '100',
    };

    // Numeric limits
    const MAX_PRICE = 10000;
    const MAX_REORDER = 1000;
    const MAX_STRENGTH = 1000;
    const MIN_REORDER = 1;
    const MIN_PRICE = 0.01;
    const MIN_STRENGTH = 0;

    const [formData, setFormData] = useState(initialFormState);
    const [errorMsg, setErrorMsg] = useState('');
    const [btnLoad, setbtnLoad] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});

    // Helper: clamp a number between min and max and return string for controlled inputs
    const clampValue = (val, min, max, isInteger = false) => {
        if (val === '' || val === null || val === undefined) return '';
        // If value contains just a leading '-', ignore it
        if (val === '-') return '';
        const num = isInteger ? parseInt(val.toString().replace(/\D/g, ''), 10) : parseFloat(val.toString().replace(/,/g, ''));
        if (Number.isNaN(num)) return '';
        const clamped = Math.min(Math.max(num, min), max);
        return isInteger ? String(Math.round(clamped)) : String(clamped);
    };

    // Helper: sanitize numeric input allowing decimals (for Price) or digits only (for integers)
    const sanitizeNumericInput = (raw, isInteger = false) => {
        if (raw === '' || raw === null || raw === undefined) return '';
        if (isInteger) {
            // remove non-digits
            return raw.toString().replace(/\D/g, '');
        } else {
            // allow digits and at most one dot
            const cleaned = raw.toString().replace(/[^\d.]/g, '');
            const parts = cleaned.split('.');
            if (parts.length <= 1) return parts[0];
            // keep first dot and remove other dots, limit decimals reasonably (e.g., 4)
            return parts[0] + '.' + parts[1].slice(0, 4);
        }
    };

    // Medication name change: disallow digits (strip them and show validation)
    const handleMedNameChange = (e) => {
        const raw = e.target.value || '';
        if (/\d/.test(raw)) {
            // Strip digits and show validation error
            const cleaned = raw.replace(/\d/g, '');
            setValidationErrors(prev => ({ ...prev, MedicationName: 'Numbers are not allowed in medication name' }));
            setFormData(prev => ({ ...prev, MedicationName: cleaned }));
        } else {
            // valid
            setValidationErrors(prev => {
                const p = { ...prev };
                delete p.MedicationName;
                return p;
            });
            setFormData(prev => ({ ...prev, MedicationName: raw }));
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Numeric clamping cases
        if (name === 'Price') {
            const sanitized = sanitizeNumericInput(value, false);
            const clamped = clampValue(sanitized === '' ? '' : sanitized, MIN_PRICE, MAX_PRICE, false);
            setFormData(prev => ({ ...prev, [name]: clamped }));
            return;
        }

        if (name === 'ReOrderLevel') {
            const sanitized = sanitizeNumericInput(value, true);
            const clamped = clampValue(sanitized === '' ? '' : sanitized, MIN_REORDER, MAX_REORDER, true);
            setFormData(prev => ({ ...prev, [name]: clamped }));
            return;
        }

        // Generic update
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleIngredientChange = (index, field, value) => {
        const newIngredients = [...formData.Ingredient];

        if (field === 'strength') {
            const sanitized = sanitizeNumericInput(value, true);
            const clamped = clampValue(sanitized === '' ? '' : sanitized, MIN_STRENGTH, MAX_STRENGTH, true);
            newIngredients[index][field] = clamped;
        } else {
            newIngredients[index][field] = value;
        }

        setFormData(prev => ({ ...prev, Ingredient: newIngredients }));
    };

    const addIngredient = () => {
        setFormData(prev => ({
            ...prev,
            Ingredient: [...prev.Ingredient, { IngredientID: '', strength: '' }]
        }));
    };

    const removeIngredient = (index) => {
        const newIngredients = formData.Ingredient.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, Ingredient: newIngredients }));
    };

    // On blur: finalize formatting
    const handlePriceBlur = () => {
        if (!formData.Price && formData.Price !== 0) return;
        const clamped = clampValue(formData.Price, MIN_PRICE, MAX_PRICE, false);
        if (clamped === '') {
            setFormData(prev => ({ ...prev, Price: '' }));
            return;
        }
        // format to 2 decimals
        const num = parseFloat(clamped);
        setFormData(prev => ({ ...prev, Price: num.toFixed(2) }));
    };

    const handleReorderBlur = () => {
        if (formData.ReOrderLevel === '' || formData.ReOrderLevel === null) return;
        const clamped = clampValue(formData.ReOrderLevel, MIN_REORDER, MAX_REORDER, true);
        setFormData(prev => ({ ...prev, ReOrderLevel: clamped }));
    };

    const handleStrengthBlur = (index) => {
        const ing = formData.Ingredient[index];
        if (!ing) return;
        const clamped = clampValue(ing.strength, MIN_STRENGTH, MAX_STRENGTH, true);
        const newIngredients = [...formData.Ingredient];
        newIngredients[index].strength = clamped;
        setFormData(prev => ({ ...prev, Ingredient: newIngredients }));
    };

    const handleSubmit = async (e) => {
        setbtnLoad(true);
        e.preventDefault();

        // Prevent submit when medication name validation error exists
        if (validationErrors.MedicationName) {
            setbtnLoad(false);
            return;
        }

        const newMedication = {
            ...formData,
            Price: parseFloat(formData.Price),
            ReOrderLevel: parseInt(formData.ReOrderLevel),
            Ingredient: formData.Ingredient.map(ing => ({
                IngredientID: parseInt(ing.IngredientID),
                strength: parseInt(ing.strength)
            }))
        };

        const result = await onAddMedication(newMedication);
        setbtnLoad(false);
        if (result && !result.success) {
            setErrorMsg(result.message);
            return;
        }
        setErrorMsg('');
        setFormData(initialFormState);
        setValidationErrors({});
        onClose();
    };

    if (!isOpen) return null;
    return (
        <div className={medmodal["modal-overlay"]}>
            <div className={medmodal["modal-content"]}>
                <div className={medmodal["modal-header"]}>
                    <h2>Add New Medication</h2>
                </div>
                {errorMsg && (
                    <div style={{ color: 'red', marginBottom: '10px', textAlign: 'center' }}>
                        {errorMsg}
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <div className={medmodal["form-group"]}>
                        <label className={medmodal["detail-label"]}>Medication Name *</label>
                        <input
                            name="MedicationName"
                            value={formData.MedicationName}
                            onChange={handleMedNameChange}
                            maxLength={20}
                            required
                        />
                        {validationErrors.MedicationName && (
                            <span style={{ color: 'red', fontSize: '0.85em', marginTop: '0.25rem', display: 'block' }}>
                                {validationErrors.MedicationName}
                            </span>
                        )}
                    </div>

                    <div className={medmodal["form-group"]}>
                        <label className={medmodal["detail-label"]}>Dosage Form *</label>
                        <select
                            name="DosageID"
                            value={formData.DosageID}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select Form</option>
                            {[...dosageFormOptions]
                                .sort((a, b) => a.DosageForm.localeCompare(b.DosageForm))
                                .map(option => (
                                    <option key={option.DosageID} value={option.DosageID}>
                                        {option.DosageForm}
                                    </option>
                                ))}
                        </select>
                    </div>

                    <div className={medmodal["form-group"]}>
                        <label className={medmodal["detail-label"]}>Schedule (0-6) *</label>
                        <select
                            name="ScheduleLevel"
                            value={formData.ScheduleLevel}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select Schedule</option>
                            {[0, 1, 2, 3, 4, 5, 6].map(num => (
                                <option key={num} value={num}>{num}</option>
                            ))}
                        </select>
                    </div>

                    <div className={medmodal["form-group"]}>
                        <label className={medmodal["detail-label"]}>Supplier *</label>
                        <select
                            name="MedSupplierID"
                            value={formData.MedSupplierID}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select Supplier</option>
                            {[...suppliers]
                                .sort((a, b) => a.SupplierName.localeCompare(b.SupplierName))
                                .map(s => (
                                    <option key={s.SupplierID} value={s.SupplierID}>
                                        {s.SupplierName}
                                    </option>
                                ))}
                        </select>
                    </div>

                    <div className={medmodal["form-group"]}>
                        <label className={medmodal["detail-label"]}>Active Ingredients *</label>
                        <div className={medmodal["row-container"]}>
                            {formData.Ingredient.map((ingredient, index) => (
                                <div key={index} className={medmodal["ingredient-row"]}>
                                    <div className={medmodal["ingredient-input"]}>
                                        <select
                                            value={String(ingredient.IngredientID)}
                                            onChange={(e) => handleIngredientChange(index, 'IngredientID', Number(e.target.value))}
                                            required
                                        >
                                            <option value="">Select Ingredient</option>
                                            {[...ingredientOptions]
                                                .sort((a, b) => a.ingredient.localeCompare(b.ingredient))
                                                .filter(opt => {
                                                    const selected = formData.Ingredient.map(i => String(i.IngredientID));
                                                    return (
                                                        String(opt.activeIngredientID) === String(ingredient.IngredientID) ||
                                                        !selected.includes(String(opt.activeIngredientID))
                                                    );
                                                })
                                                .map((option) => (
                                                    <option key={option.activeIngredientID} value={option.activeIngredientID}>
                                                        {option.ingredient}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>
                                    <div className={medmodal["strength-input"]}>
                                        <input
                                            type="number"
                                            placeholder="Strength (e.g., 500)"
                                            value={ingredient.strength}
                                            onChange={(e) => handleIngredientChange(index, 'strength', e.target.value)}
                                            onBlur={() => handleStrengthBlur(index)}
                                            max={MAX_STRENGTH}
                                            required
                                        />
                                    </div>
                                    {formData.Ingredient.length > 1 && (
                                        <button
                                            type="button"
                                            className={medmodal["remove-btn"]}
                                            onClick={() => removeIngredient(index)}
                                        >
                                            x
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <button
                            type="button"
                            className={medmodal["add-btn"]}
                            onClick={addIngredient}
                        >
                            + Add Another Ingredient
                        </button>
                    </div>

                    <div className={medmodal["form-row"]}>
                        <div className={medmodal["form-group"]}>
                            <label className={medmodal["form-label"]} >Sale Price *</label>
                            <input
                                type="number"
                                name="Price"
                                min={MIN_PRICE}
                                step="0.01"
                                max={MAX_PRICE}
                                value={formData.Price}
                                onChange={handleChange}
                                onBlur={handlePriceBlur}
                                required
                            />
                        </div>

                        <div className={medmodal["form-group"]}>
                            <label className={medmodal["form-label"]}>Re-order Level *</label>
                            <input
                                type="number"
                                name="ReOrderLevel"
                                min={MIN_REORDER}
                                max={MAX_REORDER}
                                value={formData.ReOrderLevel}
                                onChange={handleChange}
                                onBlur={handleReorderBlur}
                                required
                            />
                        </div>
                    </div>

                    <div className={medmodal["modal-footer"]}>
                        <button type="button" className={medmodal["close-btn"]} onClick={onClose}>
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={medmodal["save-btn"]}
                            disabled={btnLoad || !!validationErrors.MedicationName}
                        >
                            {btnLoad === true ? "loading" : "Add Medication"}
                        </button>

                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddMedicationModal;