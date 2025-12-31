import React, { useState, useEffect } from 'react';
import medmodal from '../CSS_for_components/ModalStyle.module.css';

const EditMedicationModal = ({
    medication,
    onSave,
    onClose,
    suppliers,
    ingredientOptions,
    dosageFormOptions,
    existingMedications = [] // <- new prop (optional)
}) => {
    const [formData, setFormData] = useState({
        Meds: {},
        dosageForm: {},
        supplier: {},
        scheduleLevel: '',
        price: 0,
        reOrderLevel: 0,
        currentQuantity: 0,
        activeIngredients: []
    });

    const [validationErrors, setValidationErrors] = useState({});

    // Numeric limits
    const MAX_PRICE = 10000;
    const MAX_REORDER = 1000;
    const MAX_STRENGTH = 1000;
    const MAX_QUANTITY = 100000;
    const MIN_PRICE = 0.01;
    const MIN_REORDER = 1;
    const MIN_STRENGTH = 0;
    const MIN_QUANTITY = 0;

    useEffect(() => {
        if (medication) {
            setFormData({
                Meds: medication.medication,
                dosageForm: medication.dosageForm,
                supplier: medication.supplier,
                scheduleLevel: medication.scheduleLevel,
                currentQuantity: medication.currentQuantity,
                price: medication.price,
                reOrderLevel: medication.reOrderLevel,
                activeIngredients: medication.activeIngredients
            });
            setValidationErrors({});
        }
    }, [medication]);

    // Helpers: sanitize and clamp like in NewMedModal
    const sanitizeNumericInput = (raw, isInteger = false) => {
        if (raw === '' || raw === null || raw === undefined) return '';
        if (isInteger) {
            return raw.toString().replace(/\D/g, '');
        } else {
            const cleaned = raw.toString().replace(/[^\d.]/g, '');
            const parts = cleaned.split('.');
            if (parts.length <= 1) return parts[0];
            return parts[0] + '.' + parts[1].slice(0, 4);
        }
    };

    const clampValue = (val, min, max, isInteger = false) => {
        if (val === '' || val === null || val === undefined) return '';
        if (val === '-') return '';
        const num = isInteger ? parseInt(val.toString().replace(/\D/g, ''), 10) : parseFloat(val.toString().replace(/,/g, ''));
        if (Number.isNaN(num)) return '';
        const clamped = Math.min(Math.max(num, min), max);
        return isInteger ? String(Math.round(clamped)) : String(clamped);
    };

    // Normalize medication name: collapse NBSP, collapse multiple spaces, trim ends, lowercase for comparison
    const normalizeName = (s) => {
        if (!s && s !== '') return '';
        return s
            .toString()
            .replace(/\u00A0/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    };

    // Medication name change: disallow digits (strip them), trim leading/trailing spaces and show validation
    const handleMedNameChange = (e) => {
        const raw = e.target.value || '';
        // strip digits
        const noDigits = raw.replace(/\d/g, '');
        // remove NBSP and collapse multiple spaces, then trim ends
        const cleaned = normalizeName(noDigits);

        if (/\d/.test(raw)) {
            setValidationErrors(prev => ({ ...prev, medName: 'Numbers are not allowed in medication name' }));
        } else {
            setValidationErrors(prev => {
                const p = { ...prev };
                delete p.medName;
                return p;
            });
        }

        // store trimmed/cleaned version so duplicates check is accurate
        setFormData(prev => ({ ...prev, Meds: { ...prev.Meds, medicationName: cleaned } }));
    };

    // Duplicate check: runs when name or existingMedications change
    useEffect(() => {
        const rawName = formData.Meds?.medicationName ?? '';
        const name = normalizeName(rawName);
        if (!name) {
            setValidationErrors(prev => {
                const p = { ...prev };
                delete p.duplicate;
                return p;
            });
            return;
        }

        const normalized = name.toLowerCase();

        const matches = (existingMedications || []).some(item => {
            // robustly extract name and id from several possible shapes
            const candidateName =
                (item?.Medication?.medicationName) ||
                (item?.medication?.medicationName) ||
                item?.MedName ||
                item?.medicationName ||
                item?.MedicationName ||
                '';

            const candidateId =
                (item?.Medication?.medicationID) ||
                (item?.medication?.medicationID) ||
                item?.MedicationID ||
                item?.medicationID ||
                item?.medication?.MedicationID ||
                null;

            if (!candidateName) return false;

            const candNormalized = normalizeName(candidateName).toLowerCase();
            if (candNormalized !== normalized) return false;

            // exclude current medication itself (allow same name if editing same record)
            const currentId =
                formData.Meds?.medicationID ??
                formData.Meds?.MedicationID ??
                medication?.medication?.medicationID ??
                medication?.medicationID ??
                null;

            if (candidateId !== null && currentId !== null && Number(candidateId) === Number(currentId)) {
                return false;
            }

            return true; // name matches and is not the same record
        });

        setValidationErrors(prev => {
            const p = { ...prev };
            if (matches) p.duplicate = 'Medication name already exists';
            else delete p.duplicate;
            return p;
        });
    }, [formData.Meds?.medicationName, existingMedications, medication]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'price') {
            const sanitized = sanitizeNumericInput(value, false);
            const clamped = clampValue(sanitized === '' ? '' : sanitized, MIN_PRICE, MAX_PRICE, false);
            setFormData(prev => ({ ...prev, [name]: clamped }));
            return;
        }

        if (name === 'reOrderLevel') {
            const sanitized = sanitizeNumericInput(value, true);
            const clamped = clampValue(sanitized === '' ? '' : sanitized, MIN_REORDER, MAX_REORDER, true);
            setFormData(prev => ({ ...prev, [name]: clamped }));
            return;
        }

        if (name === 'currentQuantity') {
            const sanitized = sanitizeNumericInput(value, true);
            const clamped = clampValue(sanitized === '' ? '' : sanitized, MIN_QUANTITY, MAX_QUANTITY, true);
            setFormData(prev => ({ ...prev, [name]: clamped }));
            return;
        }

        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSupplierChange = (e) => {
        const selected = suppliers.find(s => s.supplierID === parseInt(e.target.value));
        setFormData(prev => ({ ...prev, supplier: selected || {} }));
    };

    const handleDosageFormChange = (e) => {
        const selected = dosageFormOptions.find(d => d.dosageID === parseInt(e.target.value));
        setFormData(prev => ({ ...prev, dosageForm: selected || {} }));
    };

    const handleIngredientChange = (index, newID) => {
        const updated = [...formData.activeIngredients];
        const existing = updated[index] || {};
        updated[index] = { ...existing, activeIngredientID: parseInt(newID) || '' };
        setFormData(prev => ({ ...prev, activeIngredients: updated }));
    };

    const addIngredient = () => {
        setFormData(prev => ({
            ...prev,
            activeIngredients: [...prev.activeIngredients, { activeIngredientID: '', strength: '' }]
        }));
    };

    const removeIngredient = (index) => {
        const updated = formData.activeIngredients.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, activeIngredients: updated }));
    };

    // Strength change & blur helpers for ingredients
    const handleIngredientStrengthChange = (index, rawValue) => {
        const sanitized = sanitizeNumericInput(rawValue, true);
        const clamped = clampValue(sanitized === '' ? '' : sanitized, MIN_STRENGTH, MAX_STRENGTH, true);
        const updated = [...formData.activeIngredients];
        const existing = updated[index] || {};
        updated[index] = { ...existing, strength: clamped };
        setFormData(prev => ({ ...prev, activeIngredients: updated }));
    };

    const handleIngredientStrengthBlur = (index) => {
        const ing = formData.activeIngredients[index];
        if (!ing) return;
        const clamped = clampValue(ing.strength, MIN_STRENGTH, MAX_STRENGTH, true);
        const updated = [...formData.activeIngredients];
        updated[index] = { ...updated[index], strength: clamped };
        setFormData(prev => ({ ...prev, activeIngredients: updated }));
    };

    // Blur handlers for formatting
    const handlePriceBlur = () => {
        if (formData.price === '' || formData.price === null || formData.price === undefined) return;
        const clamped = clampValue(formData.price, MIN_PRICE, MAX_PRICE, false);
        if (clamped === '') {
            setFormData(prev => ({ ...prev, price: '' }));
            return;
        }
        setFormData(prev => ({ ...prev, price: parseFloat(clamped).toFixed(2) }));
    };

    const handleReorderBlur = () => {
        if (formData.reOrderLevel === '' || formData.reOrderLevel === null) return;
        const clamped = clampValue(formData.reOrderLevel, MIN_REORDER, MAX_REORDER, true);
        setFormData(prev => ({ ...prev, reOrderLevel: clamped }));
    };

    const handleQuantityBlur = () => {
        if (formData.currentQuantity === '' || formData.currentQuantity === null) return;
        const clamped = clampValue(formData.currentQuantity, MIN_QUANTITY, MAX_QUANTITY, true);
        setFormData(prev => ({ ...prev, currentQuantity: clamped }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Prevent submit when validation errors exist (numbers or duplicate)
        if (validationErrors.medName || validationErrors.duplicate) return;

        const MedicationAddDTO = {
            MedicationID: formData.Meds.medicationID,
            MedicationName: normalizeName(formData.Meds.medicationName),
            DosageID: formData.dosageForm?.dosageID,
            scheduleLevel: formData.scheduleLevel,
            price: parseFloat(formData.price) || 0,
            medSupplierID: formData.supplier?.supplierID,
            reOrderLevel: parseInt(formData.reOrderLevel) || 0,
            CurrentQuantity: parseInt(formData.currentQuantity) || 0,
            ingredient: (formData.activeIngredients || []).map(i => ({
                ingredientID: i.activeIngredientID,
                strength: parseInt(i.strength) || 0
            }))
        };
        onSave(MedicationAddDTO);
    };

    return (
        <div className={medmodal["modal-overlay"]}>
            <div className={medmodal["modal-content"]}>
                <div className={medmodal["modal-header"]}>
                    <h2>Edit Medication</h2>
                </div>

                <form onSubmit={handleSubmit} className={medmodal["modal-body"]}>
                    <div className={medmodal["form-group"]}>
                        <label className={medmodal["detail-label"]}>Medication Name</label>
                        <input
                            name="medName"
                            value={formData.Meds?.medicationName || ''}
                            onChange={handleMedNameChange}
                            maxLength={20}
                            required
                        />
                        {validationErrors.medName && (
                            <span style={{ color: 'red', fontSize: '0.85em', marginTop: '0.25rem', display: 'block' }}>
                                {validationErrors.medName}
                            </span>
                        )}
                        {validationErrors.duplicate && (
                            <span style={{ color: 'red', fontSize: '0.85em', marginTop: '0.25rem', display: 'block' }}>
                                {validationErrors.duplicate}
                            </span>
                        )}
                    </div>

                    <div className={medmodal["form-group"]}>
                        <label className={medmodal["detail-label"]}>Dosage Form</label>
                        <select
                            value={formData.dosageForm?.dosageID || ''}
                            onChange={handleDosageFormChange}
                            required
                        >
                            <option value="">Select Form</option>
                            {[...dosageFormOptions]
                                .sort((a, b) => (a.DosageForm || a.dosageForm || '').localeCompare(b.DosageForm || b.dosageForm || ''))
                                .map((option) => (
                                    <option key={option.activeIngredientID || option.dosageID || option.DosageID} value={option.dosageID || option.DosageID}>
                                        {option.DosageForm || option.dosageForm}
                                    </option>
                                ))}
                        </select>
                    </div>
                    <div className={medmodal["form-group"]}>
                        <label className={medmodal["detail-label"]}>Supplier</label>
                        <select
                            value={formData.supplier?.supplierID || ''}
                            onChange={handleSupplierChange}
                            required
                        >
                            <option value="">Select Supplier</option>
                            {[...suppliers]
                                .sort((a, b) => (a.SupplierName || a.supplierName || '').localeCompare(b.SupplierName || b.supplierName || ''))
                                .map((supplier) => (
                                    <option key={supplier.SupplierID} value={supplier.SupplierID}>
                                        {supplier.SupplierName}
                                    </option>
                                ))}
                        </select>
                    </div>

                    <div className={medmodal["form-group"]}>
                        <label className={medmodal["detail-label"]}>Schedule</label>
                        <select
                            name="scheduleLevel"
                            value={formData.scheduleLevel}
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
                        <label className={medmodal["detail-label"]}>Current Sale Price</label>
                        <input
                            type="number"
                            step="0.01"
                            min={MIN_PRICE}
                            max={MAX_PRICE}
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            onBlur={handlePriceBlur}
                            required
                        />
                    </div>
                    <div className={medmodal["form-group"]}>
                        <label className={medmodal["detail-label"]}>Re-Order Level</label>
                        <input
                            type="number"
                            step="1"
                            min={MIN_REORDER}
                            max={MAX_REORDER}
                            name="reOrderLevel"
                            value={formData.reOrderLevel}
                            onChange={handleChange}
                            onBlur={handleReorderBlur}
                            required
                        />
                    </div>

                    <div className={medmodal["form-group"]}>
                        <label className={medmodal["detail-label"]}>Quantity</label>
                        <input
                            type="number"
                            name="currentQuantity"
                            min={MIN_QUANTITY}
                            max={MAX_QUANTITY}
                            value={formData.currentQuantity}
                            onChange={handleChange}
                            onBlur={handleQuantityBlur}
                        />
                    </div>
                    <label className={medmodal["detail-label"]}>Active Ingredients</label>
                    <div className={medmodal["form-section"]}>

                        {formData.activeIngredients.map((id, index) => {
                            return (
                                <div key={index} className={medmodal["ingredient-row"]}>
                                    <select
                                        value={id.activeIngredientID || ''}
                                        onChange={(e) => handleIngredientChange(index, e.target.value)}
                                        required
                                    >
                                        <option value="">Select Ingredient</option>
                                        {[...ingredientOptions]
                                            .sort((a, b) => a.ingredient.localeCompare(b.ingredient))
                                            .map((option) => (
                                                <option key={option.activeIngredientID} value={option.activeIngredientID}>
                                                    {option.ingredient}
                                                </option>
                                            ))}
                                    </select>
                                    <input
                                        type="number"
                                        placeholder="Strength (e.g. 500)"
                                        value={id.strength}
                                        onChange={(e) => handleIngredientStrengthChange(index, e.target.value)}
                                        onBlur={() => handleIngredientStrengthBlur(index)}
                                        className={medmodal["ingredient-strength-input"]}
                                        min={MIN_STRENGTH}
                                        max={MAX_STRENGTH}
                                        required
                                    />

                                    {formData.activeIngredients.length > 1 && (
                                        <button
                                            type="button"
                                            className={medmodal["remove-btn"]}
                                            onClick={() => removeIngredient(index)}
                                        >
                                            x
                                        </button>
                                    )}
                                </div>
                            )
                        })}

                    </div>
                    <button
                        type="button"
                        className={medmodal["add-btn"]}
                        onClick={addIngredient}
                    >
                        + Add Ingredient
                    </button>
                    <div className={medmodal["modal-footer"]}>
                        <button type="button" className={medmodal["close-btn"]} onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className={medmodal["save-btn"]} disabled={!!validationErrors.medName || !!validationErrors.duplicate}>
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditMedicationModal;