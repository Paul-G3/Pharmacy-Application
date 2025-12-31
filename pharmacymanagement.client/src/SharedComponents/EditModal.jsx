// src/components/EditModal.jsx
import React, { useState, useEffect } from "react";
import Modal from '../PharmacyManager/Components/ModalComponent';
import management from "../PharmacyManager/CSS_for_components/ManagementStyle.module.css";

function luhnCheck(num) {
    let sum = 0;
    const digits = num.split('').map(Number);
    for (let i = 0; i < digits.length; i++) {
        let val = digits[digits.length - 1 - i];
        if (i % 2 === 1) {
            val *= 2;
            if (val > 9) val -= 9;
        }
        sum += val;
    }
    return sum % 10 === 0;
}
function isValidSAId(id) {
    return /^\d{13}$/.test(id) && luhnCheck(id);
}
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// helper: map form -> id field used by API data
const getIdFieldForForm = (form) => {
    switch (form) {
        case "ingredient": return "activeIngredientID";
        case "doctor": return "doctorID";
        case "supplier": return "supplierID";
        case "DosageForm": return "dosageID";
        case "pharmacist":
        case "employee": return "pharmacistID";
        default: return "id";
    }
};

export default function EditModal({ form, record, onSave, onClose, style, existingRecords = [] }) {
    const [values, setValues] = useState({});
    const [validationErrors, setValidationErrors] = useState({});

    useEffect(() => {
        setValues(record || {});
        setValidationErrors({});
    }, [record]);

    const clearError = (key) => setValidationErrors(prev => { const p = { ...prev }; delete p[key]; return p; });
    const setError = (key, msg) => setValidationErrors(prev => ({ ...prev, [key]: msg }));

    const handleChange = (e) => {
        const { name } = e.target;
        let value = e.target.value;

        // Normalize some casing differences between forms
        const nameOnlyFields = ['name', 'surname', 'supplierName', 'contactPerson', 'ingredient', 'doctorName', 'doctorSurname'];

        if (nameOnlyFields.includes(name)) {
            if (/\d/.test(value)) {
                setError(name, 'Numbers are not allowed here');
                value = value.replace(/\d/g, '');
            } else {
                clearError(name);
            }
        }

        if (['phoneNumber', 'contactNumber', 'contact'].includes(name)) {
            let cleanValue = value;
            if (cleanValue.startsWith('+')) {
                cleanValue = '+' + cleanValue.substring(1).replace(/\D/g, '');
            } else {
                cleanValue = cleanValue.replace(/\D/g, '');
            }

            if (cleanValue.startsWith('+27')) cleanValue = cleanValue.slice(0, 12);
            else if (cleanValue.startsWith('0')) cleanValue = cleanValue.slice(0, 10);
            else if (cleanValue.startsWith('+')) cleanValue = cleanValue.slice(0, 12);
            else cleanValue = cleanValue.slice(0, 10);

            value = cleanValue;

            let isValid = false;
            if (value.startsWith('0')) isValid = value.length === 10;
            else if (value.startsWith('+27')) isValid = value.length === 12;

            if (value.length > 0 && !isValid) setError(name, 'Phone must be 10 digits (0...) or 12 with +27');
            else clearError(name);
        }

        if (name === 'idNumber' || name === 'id' || name === 'idnumber') {
            const digits = value.replace(/\D/g, '').slice(0, 13);
            value = digits;
            if (digits.length > 0 && digits.length < 13) setError('idNumber', 'Must be 13 digits');
            else if (digits.length === 13) {
                if (!isValidSAId(digits)) setError('idNumber', 'Invalid SA ID number');
                else clearError('idNumber');
            } else clearError('idNumber');
        }

        if (name.toLowerCase().includes('email')) {
            if (value.length > 0 && !isValidEmail(value)) setError(name, 'Invalid email format');
            else clearError(name);
        }

        if (['practiceNumber', 'hcrn', 'ingredient', 'dosageForm', 'doctorName', 'doctorSurname', 'name', 'surname', 'addressLine', 'addressline', 'AddressLine'].includes(name)) {
            if (value && value.toString().trim() !== '') clearError(name);
        }
        if (name === 'dob' || name === 'DOB') {
            if (value && value.toString().trim() !== '') clearError('dob');
        }
        if (name === 'gender') {
            if (value && value !== 'Select') clearError('gender');
        }

        setValues(prev => ({ ...prev, [name]: value }));
    };

    const field = (label, name, type = "text") => {
        let value = values[name] ?? "";

        if (type === "date" && typeof value === "string") {
            value = value.split("T")[0];
        }

        const normalizedErrorKey = (() => {
            if (/^id$/i.test(name) || /^idnumber$/i.test(name)) return 'idNumber';
            if (/emailaddress/i.test(name)) return 'emailAddress';
            if (/dob/i.test(name)) return 'dob';
            return name;
        })();

        const errorMsg = validationErrors?.[normalizedErrorKey];

        return (
            <div key={name} className={management["form-group"]}>
                <label className={management["detail-label"]} htmlFor={name}>{label}</label>
                <input
                    id={name}
                    type={type}
                    name={name}
                    value={value}
                    onChange={handleChange}
                    maxLength={type === "date" ? undefined : 100}
                    className={errorMsg ? management["input-error"] : ''}
                />
                {errorMsg && (
                    <span style={{ color: "red", fontSize: "0.85em", marginTop: "0.25rem", display: "block" }}>
                        {errorMsg}
                    </span>
                )}
            </div>
        );
    };
    const statusField = () => (
        <div key="status" className={management["form-group"]}>
            <label className={management["detail-label"]}>Status*</label>
            <select
                name="status"
                value={values.status || "Active"}
                onChange={handleChange}
                disabled
            >
                <option>Active</option>
                <option>Inactive</option>
            </select>
        </div>
    );

    const renderEditBody = () => {
        switch (form) {
            case "ingredient":
                return (
                    <div className={management["form-grid"]}>
                        {field("Name*", "ingredient")}
                        {statusField()}
                    </div>
                );

            case "dosage":
                return (
                    <div className={management["form-grid"]}>
                        {field("Dosage Form*", "dosageForm")}
                        {statusField()}
                    </div>
                );

            case "doctor":
                return (
                    <div className={management["form-grid"]}>
                        {field("Name*", "doctorName")}
                        {field("Surname*", "doctorSurname")}
                        {field("Practice #*", "practiceNumber")}
                        {field("Contact*", "contactNumber")}
                        {field("Email*", "email")}
                        {statusField()}
                    </div>
                );

            case "supplier":
                return (
                    <div className={management["form-grid"]}>
                        {field("Supplier Name*", "supplierName")}
                        {field("Contact Number*", "contactNumber")}
                        {field("Contact Person*", "contactPerson")}
                        {field("Email*", "emailAddress")}
                        {statusField()}
                    </div>
                );

            case "pharmacist":
                return (
                    <div className={management["form-grid"]}>
                        {field("Name*", "name")}
                        {field("Surname*", "surname")}
                        {field("Practice #*", "hcrn")}
                        {field("Phone #*", "phoneNumber")}
                        {field("ID Number*", "idNumber")}
                        {field("Email*", "email")}
                        {field("DOB*", "dob", "date")}
                        {field("AddressLine*", "addressLine")}
                        <div className={management["form-group"]}>
                            <label className={management["detail-label"]}>Gender*</label>
                            <select
                                name="gender"
                                value={values.gender || "Select"}
                                onChange={handleChange}
                                className={validationErrors?.gender ? management["input-error"] : ''}
                            >
                                <option>Select</option>
                                <option>Male</option>
                                <option>Female</option>
                            </select>
                            {validationErrors?.gender && (
                                <span style={{ color: "red", fontSize: "0.85em", marginTop: "0.25rem", display: "block" }}>
                                    {validationErrors.gender}
                                </span>
                            )}
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    // New: duplicate detection inside the modal so error shows inline
    const checkDuplicates = (vals) => {
        const records = existingRecords || [];
        const idField = getIdFieldForForm(form);
        const currentId = vals[idField] ?? vals[idField.toLowerCase()] ?? vals.id ?? record?.[idField];

        const normalize = s => (s || '').toString().replace(/\u00A0/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();

        for (const item of records) {
            if (!item) continue;
            const itemId = item[idField];
            if (itemId !== undefined && itemId !== null && String(itemId) === String(currentId)) continue; // same record
            
            switch (form) {
                case 'ingredient':
                    if (normalize(item.ingredient) === normalize(vals.ingredient)) {
                        return { field: 'ingredient', message: 'Ingredient already exists' };
                    }
                    break;
                case 'supplier':
                    if (normalize(item.supplierName) === normalize(vals.supplierName)) {
                        return { field: 'supplierName', message: 'Supplier already exists' };
                    }
                    break;
                // handle both aliases used in the codebase
                case 'DosageForm':
                case 'dosage':
                    {
                        const newDosage = normalize(vals.dosageForm ?? vals.dosage ?? '');
                        if (normalize(item.dosageForm) === newDosage) {
                            return { field: 'dosageForm', message: 'Dosage form already exists' };
                        }
                    }
                    break;
                case 'doctor':
                    if (normalize(item.practiceNumber) === normalize(vals.practiceNumber)) {
                        return { field: 'practiceNumber', message: 'Practice number already exists' };
                    }
                    break;
                case 'pharmacist':
                case 'employee':
                    if (normalize(item.hcrn) && normalize(vals.hcrn) && normalize(item.hcrn) === normalize(vals.hcrn)) {
                        return { field: 'hcrn', message: 'HCRN already exists' };
                    }
                    if (normalize(item.email) && normalize(vals.email) && normalize(item.email) === normalize(vals.email)) {
                        return { field: 'email', message: 'Email already exists' };
                    }
                    break;
                default:
                    break;
            }
        }
        return null;
    };

    const validateBeforeSave = () => {
        const errors = {};

        const requiredByForm = {
            ingredient: ['ingredient'],
            dosage: ['dosageForm'],
            doctor: ['doctorName', 'doctorSurname', 'practiceNumber', 'contactNumber', 'email'],
            supplier: ['supplierName', 'contactPerson', 'contactNumber', 'emailAddress'],
            pharmacist: ['name', 'surname', 'email', 'hcrn', 'phoneNumber', 'idNumber', 'dob', 'addressLine', 'gender']
        };

        const required = requiredByForm[form] || [];
        for (const key of required) {
            const val = (values[key] ?? '').toString().trim();
            if (!val || (key === 'gender' && val === 'Select')) {
                errors[key] = 'This field is required';
            }
        }

        if ((values.email || values.emailAddress) && !isValidEmail(values.email || values.emailAddress)) {
            errors.email = 'Invalid email format';
            errors.emailAddress = 'Invalid email format';
        }
        if (values.idNumber && !(values.idNumber.replace(/\D/g, '').length === 13 && isValidSAId(values.idNumber.replace(/\D/g, '')))) {
            errors.idNumber = 'Invalid SA ID';
        }

        return errors;
    };

    const handleConfirm = () => {
        const errors = validateBeforeSave();
        // show any validation errors first
        if (Object.keys(errors).length > 0) {
            setValidationErrors(prev => ({ ...prev, ...errors }));
            return;
        }

        // check duplicates inline and set field error if found
        const dup = checkDuplicates(values);
        if (dup) {
            setValidationErrors(prev => ({ ...prev, [dup.field]: dup.message }));
            return;
        }

        // no validation errors
        onSave(values);
        onClose();
    };

    const isSaveDisabled = Boolean(Object.keys(validationErrors).length > 0);

    return (
        <Modal title={`Edit ${form}`} isOpen={!!form} wide onClose={onClose} style={style}>
            {renderEditBody()}
            <div className={management["modal-footer"]}>
                <button className={management["close-btn"]} onClick={onClose}>
                    Cancel
                </button>
                <button className={management["save-btn"]} onClick={handleConfirm} disabled={isSaveDisabled} title={isSaveDisabled ? "Fix validation errors before saving" : "Save"}>
                    Save
                </button>
            </div>
        </Modal>
    );
}