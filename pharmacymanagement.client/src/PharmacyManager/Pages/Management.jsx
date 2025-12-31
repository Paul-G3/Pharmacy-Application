import management from "../CSS_for_components/ManagementStyle.module.css";
import Employee from "../Components/EmployeeManagement";
import DynamicTable from "../../SharedComponents/DynamicTable";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { usePageTitle } from "../../SharedComponents/SetPageTitle";
import Modal from '../Components/ModalComponent';
import { getData, postData } from '../../SharedComponents/apiService';
import EditModal from "../../SharedComponents/EditModal";
import Loader from "../../SharedComponents/Loader";
import ToastSuccess from "../../SharedComponents/ToastSuccessModal";

function isValidEmail(email) {
    // A standard regex for email validation
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Helper: compute full years from a yyyy-mm-dd date string (returns NaN for invalid dates)
function ageFromDate(dateString) {
    if (!dateString) return NaN;
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return NaN;
    const today = new Date();
    let age = today.getFullYear() - d.getFullYear();
    const m = today.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
    return age;
}

function validateForm(form, formData) {
    const errors = {};
    // Define required fields for each form
    const requiredFields = {
        ingredient: ['Ingredient'],
        dosage: ['dosageForm'],
        doctor: ['name', 'surname', 'practiceNumber', 'contact', 'email'],
        supplier: ['supplierName', 'contactPerson', 'contactNumber', 'email'],
        pharmacist: ['name', 'surname', 'email', 'hcrn', 'phoneNumber', 'idNumber', 'DOB', 'AddressLine', 'gender']
    };

    const fields = requiredFields[form];
    if (!fields) return { isValid: true, errors };

    // Check each required field
    for (const field of fields) {
        if (!formData[field] || formData[field].trim() === '') {
            errors[field] = 'This field is required';
        }
        // Special case for 'gender' select
        if (field === 'gender' && formData[field] === 'Select') {
            errors[field] = 'Please select a gender';
        }
    }

    // Additional DOB checks for pharmacist:
    if (form === 'pharmacist') {
        const dob = formData.DOB;
        if (dob && dob.trim() !== '') {
            const parsed = new Date(dob);
            if (Number.isNaN(parsed.getTime())) {
                errors.DOB = 'Invalid date';
            } else {
                const today = new Date();
                // future date check
                if (parsed > today) {
                    errors.DOB = 'Date cannot be in the future';
                } else {
                    const age = ageFromDate(dob);
                    if (Number.isNaN(age)) {
                        errors.DOB = 'Invalid date';
                    } else if (age < 18) {
                        errors.DOB = 'Must be at least 18 years old';
                    }
                }
            }
        } else {
            // ensure required flag handles empty case; optional defensive message
            if (!errors.DOB) errors.DOB = 'This field is required';
        }
    }

    return { isValid: Object.keys(errors).length === 0, errors };
}
function makeTitle(form) {
    switch (form) {
        case "ingredient": return "Add Ingredient";
        case "dosage": return "Add Dosage Form";
        case "doctor": return "Add Doctor";
        case "supplier": return "Add Supplier";
        case "pharmacist": return "Add Pharmacist";
        default: return "";
    }
}
export const endpoints = {
    ingredient: {
        list: "/manager/management/ActiveIngredients",
        add: "/manager/management/AddActiveIngredients",
        update: "/manager/management/UpdateActiveIngredients",
        delete: "/manager/management/ActiveIngredientsStatus"
    },
    doctor: {
        list: "/manager/management/Doctors",
        add: "/manager/management/AddDoctors",
        update: "/manager/management/UpdateDoctors",
        delete: "/manager/management/DoctorsStatus"
    },
    supplier: {
        list: "/manager/management/Suppliers",
        add: "/manager/management/AddSuppliers",
        update: "/manager/management/UpdateSupliers",
        delete: "/manager/management/SupliersStatus"
    },
    DosageForm: {
        list: "/manager/management/DosageForms",
        add: "/manager/management/AddDosageForm",
        update: "/manager/management/UpdateDosageForm",
        delete: "/manager/management/DosageFormStatus"
    },
    employee: {
        list: "/manager/management/Pharmacist",
        add: "/manager/management/AddPharmacist",
        update: "/manager/management/UpdatePharmacist",
        delete: "/manager/management/PharmacistStatus"
    }
};

function getSortField(section) {
    switch (section) {
        case "ingredient": return "ingredient";
        case "supplier": return "supplierName";
        case "doctor": return "doctorName";
        case "DosageForm": return "dosageForm";
        case "employee": return "name";
        default: return null;
    }
}
export function renderModalBody(form, formData, handleInputChange, emailExistsError, validationErrors) {
    // Helper to create a standard input
    // Now includes maxLength prop and error styling
    const input = (label, name, type = "text", maxLength = 30) => (
        <div key={name} className={management["form-group"]}>
            <label className={management["detail-label"]}>{label}</label>
            <input
                required
                type={type}
                name={name}
                value={formData[name] || ''}
                maxLength={maxLength} // Use dynamic maxLength
                onChange={handleInputChange}
                // --- ADDED: Apply error class if error exists ---
                className={validationErrors?.[name] ? management["input-error"] : ''}
            />
            {validationErrors?.[name] && (
                <span style={{ color: "red", fontSize: "0.85em", marginTop: "0.25rem", display: "block" }}>
                    {validationErrors[name]}
                </span>
            )}
        </div>
    );

    // Helper for the Status dropdown
    const statusSelect = () => (
        <div key="status" className={management["form-group"]}>
            <label className={management["detail-label"]}>Status*</label>
            <select
                name="status"
                value={formData.status || 'Active'}
                onChange={handleInputChange}
                disabled
                className={validationErrors?.status ? management["input-error"] : ''}
            >
                <option>Active</option>
            </select>
        </div>
    );

    /* body ---------------------------------------------------------------- */
    switch (form) {
        case "ingredient":
            return (
                <div className={management["form-grid"]}>
                    {input("Ingredient*", "Ingredient", "text", 20)}
                    {statusSelect()}
                </div>
            );

        case "dosage":
            return (
                <div className={management["form-grid"]}>
                    {input("Dosage Form Name*", "dosageForm", "text", 20)}
                    {statusSelect()}
                </div>
            );

        case "doctor":
            return (
                <div className={management["form-grid"]}>
                    {input("Name*", "name")}
                    {input("Surname*", "surname")}
                    {input("Practice #*", "practiceNumber")}
                    {input("Contact*", "contact", "text", 12)}
                    {input("Email*", "email", "email", 50)}
                    {statusSelect()}
                </div>
            );

        case "supplier":
            return (
                <div className={management["form-grid"]}>
                    {input("Supplier Name*", "supplierName", "text", 50)}
                    {input("Contact Person*", "contactPerson")}
                    {input("Contact number*", "contactNumber", "text", 12)}
                    {input("Email*", "email", "email", 100)}
                    {statusSelect()}
                </div>
            );

        case "pharmacist":
            // Pharmacist form has custom inputs, so we must apply styles manually
            return (
                <div className={management["form-grid"]}>
                    {input("Name*", "name")}
                    {input("Surname*", "surname")}
                    <div className={management["form-group"]}>
                        <label className={management["detail-label"]}>Email*</label>
                        <input
                            required
                            type="email"
                            name="email"
                            value={formData["email"] || ''}
                            onChange={handleInputChange}
                            maxLength={50}
                            className={validationErrors?.email || emailExistsError ? management["input-error"] : ''}
                        />
                        {validationErrors?.email && (
                            <span style={{ color: "red", fontSize: "0.85em", marginTop: "0.25rem", display: "block" }}>
                                {validationErrors.email}
                            </span>
                        )}
                        {emailExistsError && (
                            <span style={{ color: "red", fontSize: "0.85em", marginTop: "0.25rem", display: "block" }}>
                                {emailExistsError}
                            </span>
                        )}
                    </div>
                    {input("Practice #*", "hcrn")}
                    {input("Phone #*", "phoneNumber", "text", 12)}
                    {input("ID Number*", "idNumber", "text", 13)}
                    {input("DOB*", "DOB", "date")}
                    {input("Address line*", "AddressLine", "text", 100)}
                    <div className={management["form-group"]}>
                        <label className={management["detail-label"]}>Gender*</label>
                        <select
                            name="gender"
                            value={formData["gender"] || "Select"}
                            onChange={handleInputChange}
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
}
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
function useFilteredData(data, search, status, searchCols, sortField) {
    return useMemo(() => {
        // 1. Filter by search term
        const filteredData = data.filter((row) => {
            if (!search) return true;
            return searchCols.some((col) => {
                const val = row[col];
                if (val == null) return false;
                const isNumeric = typeof val === "number";
                if (isNumeric) {
                    return val.toString().includes(search.trim());
                }
                return val.toString().toLowerCase().includes(search.toLowerCase());
            });
        });

        // 2. Filter by status
        const statusFiltered = status
            ? filteredData.filter(row => row.status?.toLowerCase() === status.toLowerCase())
            : filteredData;

        // 3. Sort the data
        const sortKey = getSortField(sortField);
        const sortedData = sortKey
            ? [...statusFiltered].sort((a, b) =>
                (a[sortKey] || "").toString().localeCompare((b[sortKey] || "").toString())
            )
            : statusFiltered;

        return sortedData;
    }, [data, search, status, searchCols, sortField]);
}

// --- API HOOK (Unchanged) ---
export function useSectionApi(section) {
    const [data, setData] = useState([]);
    const ep = endpoints[section] || endpoints.ingredient;

    const refresh = useCallback(async () => {
        try {
            const result = await getData(ep.list);
            setData(Array.isArray(result) ? result : [result]);
        } catch (err) {
            console.error(`Fetch error (${section}):`, err);
        }
    }, [ep.list, section]); // Added section to error log

    useEffect(() => {
        refresh();
    }, [refresh]); // This correctly fetches data when the hook is first used

    const add = (payload = {}) => postData(ep.add, payload);
    const update = (payload = {}) => postData(ep.update, payload);
    const remove = (payload = {}) => postData(ep.delete, payload);

    return { data, refresh, add, update, remove };
}
function Management() {
    const { setPageTitle } = usePageTitle();
    const section = useHashSection();

    // --- Modal & Loading State ---
    const [activeForm, setActiveForm] = useState(null);
    const [editInfo, setEditInfo] = useState({ form: null, record: null });
    const [loading, setLoading] = useState(false); // We'll manage this manually
    const [addError, setAddError] = useState("");
    const [validationErrors, setValidationErrors] = useState({});
    const [formData, setFormData] = useState({});
    const [emailExistsError, setEmailExistsError] = useState('');
    const [toast, setToast] = useState({ visible: false, message: "", type: "success", duration: 3000 });
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // --- Search Columns (Unchanged) ---
    const searchColumns = {
        ingredient: ["ingredient"],
        supplier: ["supplierName", "contactPerson"],
        doctor: ["doctorName", "doctorSurname", "practiceNumber"],
        DosageForm: ["dosageForm"],
        employee: ["name", "surname", "hcrn", "idNumber"]
    };

    // --- NEW: Section-Specific Search & Filter States ---
    const [ingredientSearch, setIngredientSearch] = useState("");
    const [ingredientStatus, setIngredientStatus] = useState("");
    const [doctorSearch, setDoctorSearch] = useState("");
    const [doctorStatus, setDoctorStatus] = useState("");
    const [supplierSearch, setSupplierSearch] = useState("");
    const [supplierStatus, setSupplierStatus] = useState("");
    const [dosageSearch, setDosageSearch] = useState("");
    const [dosageStatus, setDosageStatus] = useState("");
    const [employeeSearch, setEmployeeSearch] = useState("");
    const [employeeStatus, setEmployeeStatus] = useState("");

    // --- API Hooks (One per section) ---
    const ingredientApi = useSectionApi('ingredient');
    const doctorApi = useSectionApi('doctor');
    const supplierApi = useSectionApi('supplier');
    const dosageApi = useSectionApi('DosageForm');
    const employeeApi = useSectionApi('employee');

    // --- API/Refresh Helpers ---
    const getApiFor = (formOrSection) => {
        switch (formOrSection) {
            case 'ingredient': return ingredientApi;
            case 'doctor': return doctorApi;
            case 'supplier': return supplierApi;
            case 'DosageForm': return dosageApi;
            case 'dosage': return dosageApi; // Alias
            case 'employee': return employeeApi;
            case 'pharmacist': return employeeApi; // Alias
            default: return ingredientApi;
        }
    };

    // --- NEW: Filtered Data (using the new hook) ---
    const ingredientSorted = useFilteredData(ingredientApi.data, ingredientSearch, ingredientStatus, searchColumns.ingredient, "ingredient");
    const doctorSorted = useFilteredData(doctorApi.data, doctorSearch, doctorStatus, searchColumns.doctor, "doctor");
    const supplierSorted = useFilteredData(supplierApi.data, supplierSearch, supplierStatus, searchColumns.supplier, "supplier");
    const dosageSorted = useFilteredData(dosageApi.data, dosageSearch, dosageStatus, searchColumns.DosageForm, "DosageForm");
    const employeeSorted = useFilteredData(employeeApi.data, employeeSearch, employeeStatus, searchColumns.employee, "employee");

    // Add inside the `Management` function, after you compute `employeeSorted` (near other local constants)
    const sectionsOrder = ['ingredient', 'doctor', 'supplier', 'DosageForm', 'employee'];

    const sectionDisplayName = (id) => {
        switch (id) {
            case 'ingredient': return 'Active Ingredients';
            case 'doctor': return 'Doctors';
            case 'supplier': return 'Suppliers';
            case 'DosageForm': return 'Dosage Form';
            case 'employee': return 'Pharmacists';
            default: return '';
        }
    };

    const currentIndex = Math.max(0, sectionsOrder.indexOf(section));
    const prevSection = currentIndex > 0 ? sectionsOrder[currentIndex - 1] : null;
    const nextSection = currentIndex < sectionsOrder.length - 1 ? sectionsOrder[currentIndex + 1] : null;

    const scrollToSection = (id) => {
        if (!id) return;
        // set hash so existing useHashSection() handles scrolling + state update
        window.location.hash = `#${id}`;
    };

    const handleInputChange = (e) => {
        const { name } = e.target;
        let value = e.target.value;

        // Block digits in name-only fields
        const nameOnlyFields = ['name', 'surname', 'supplierName', 'contactPerson', 'Ingredient', 'dosageForm'];
        if (nameOnlyFields.includes(name)) {
            // If value contains digits show error and strip digits from state value
            if (/\d/.test(value)) {
                setValidationErrors(prev => ({ ...prev, [name]: 'Numbers are not allowed here' }));
                value = value.replace(/\d/g, ''); // keep input clean (optional)
            } else {
                // clear error when valid
                setValidationErrors(prev => { const p = { ...prev }; delete p[name]; return p; });
            }
        }

        // Phone/Contact Number Validation (+27 or 0)
        if (['phoneNumber', 'contactNumber', 'contact'].includes(name)) {
            let cleanValue = value;
            if (cleanValue.startsWith('+')) {
                cleanValue = '+' + cleanValue.substring(1).replace(/\D/g, '');
            } else {
                cleanValue = cleanValue.replace(/\D/g, '');
            }

            if (cleanValue.startsWith('+27')) {
                cleanValue = cleanValue.slice(0, 12); // +27 + 9 digits = 12 chars
            } else if (cleanValue.startsWith('0')) {
                cleanValue = cleanValue.slice(0, 10); // 0 + 9 digits = 10 chars
            } else if (cleanValue.startsWith('+')) {
                cleanValue = cleanValue.slice(0, 12);
            } else {
                cleanValue = cleanValue.slice(0, 10);
            }

            value = cleanValue;

            let isValid = false;
            const errorMessage = 'Must be 10 digits (e.g., 072...) or 12 digits (e.g., +2772...)';

            if (value.startsWith('0')) {
                isValid = value.length === 10;
            } else if (value.startsWith('+27')) {
                isValid = value.length === 12;
            }

            if (value.length > 0 && !isValid) {
                setValidationErrors(prev => ({ ...prev, [name]: errorMessage }));
            } else {
                setValidationErrors(prev => { const p = { ...prev }; delete p[name]; return p; });
            }
        }

        // ID Number Validation
        if (name === 'idNumber') {
            const digits = value.replace(/\D/g, '').slice(0, 13);
            value = digits;

            if (digits.length > 0 && digits.length < 13) {
                setValidationErrors(prev => ({ ...prev, idNumber: 'Must be 13 digits' }));
            } else if (digits.length === 13) {
                if (!isValidSAId(digits)) {
                    setValidationErrors(prev => ({ ...prev, idNumber: 'Invalid SA ID number' }));
                } else {
                    setValidationErrors(prev => { const p = { ...prev }; delete p.idNumber; return p; });
                }
            } else {
                setValidationErrors(prev => { const p = { ...prev }; delete p.idNumber; return p; });
            }
        }

        // --- NEW: Email Format Validation ---
        if (name === 'email') {
            if (value.length > 0 && !isValidEmail(value)) {
                // Set format error
                setValidationErrors(prev => ({ ...prev, email: 'Invalid email format' }));
            } else {
                // Clear format error
                setValidationErrors(prev => { const p = { ...prev }; delete p.email; return p; });
            }
        }

        // Set the form data state
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Email duplication check
        // This runs after setting state, so it has the latest value
        if (activeForm === "pharmacist" && name === "email") {
            // Only check for duplicates if the format is valid
            if (value.length > 0 && isValidEmail(value)) {
                const emailExists = (employeeApi.data || []).some(
                    p => p.email?.toLowerCase() === value.trim().toLowerCase()
                );
                setEmailExistsError(emailExists ? "Email already exists." : "");
            } else {
                setEmailExistsError(""); // Clear duplication error if format is bad or empty
            }
        }

        // Clear validation for practice number / hcrn when non-empty
        if (['practiceNumber', 'hcrn'].includes(name)) {
            if (value && value.toString().trim() !== '') {
                setValidationErrors(prev => { const p = { ...prev }; delete p[name]; return p; });
            }
        }

        // Clear DOB error when user picks/enters a date
        if (name === 'DOB') {
            if (value && value.toString().trim() !== '') {
                // Validate DOB: no future date and at least 18 years
                const parsed = new Date(value);
                if (Number.isNaN(parsed.getTime())) {
                    setValidationErrors(prev => ({ ...prev, DOB: 'Invalid date' }));
                } else {
                    const today = new Date();
                    if (parsed > today) {
                        setValidationErrors(prev => ({ ...prev, DOB: 'Date cannot be in the future' }));
                    } else {
                        const age = ageFromDate(value);
                        if (Number.isNaN(age)) {
                            setValidationErrors(prev => ({ ...prev, DOB: 'Invalid date' }));
                        } else if (age < 18) {
                            setValidationErrors(prev => ({ ...prev, DOB: 'Must be at least 18 years old' }));
                        } else {
                            setValidationErrors(prev => { const p = { ...prev }; delete p.DOB; return p; });
                        }
                    }
                }
            } else {
                setValidationErrors(prev => { const p = { ...prev }; delete p.DOB; return p; });
            }
        }

        // Clear AddressLine error when non-empty
        if (name === 'AddressLine') {
            if (value && value.toString().trim() !== '') {
                setValidationErrors(prev => { const p = { ...prev }; delete p.AddressLine; return p; });
            }
        }

        // Clear gender error when user selects a valid option
        if (name === 'gender') {
            if (value && value !== 'Select') {
                setValidationErrors(prev => { const p = { ...prev }; delete p.gender; return p; });
            }
        }
    };

    // Replace the single-line API hook:


    const computeSectionData = (apiData, sec) => {
        const colsLocal = searchColumns[sec] || [];
        const filtered = (apiData || []).filter((row) => {
            if (!search) return true;
            return colsLocal.some((col) => {
                const val = row[col];
                if (val == null) return false;
                const isNumeric = typeof val === "number";
                if (isNumeric) return val.toString().includes(search.trim());
                return val.toString().toLowerCase().includes(search.toLowerCase());
            });
        });

        const statusFilteredLocal = statusFilter
            ? filtered.filter(row => row.status?.toLowerCase() === statusFilter.toLowerCase())
            : filtered;

        const sf = getSortField(sec);
        return sf
            ? [...statusFilteredLocal].sort((a, b) =>
                (a[sf] || "").toString().localeCompare((b[sf] || "").toString())
            )
            : statusFilteredLocal;
    };


    // helper to interpret API response (handles fetch or axios-like shapes)
    const parseApiResponse = (res) => {
        if (!res) return { success: false, message: "No response from server" };
        const payload = res?.data ?? res;
        const success = typeof payload === "object" && ("success" in payload) ? !!payload.success : undefined;
        const message = payload?.message ?? (typeof payload === "string" ? payload : "");
        return { success: success === undefined ? null : success, message };
    };

    const handleAdd = async (values) => {
        setLoading(true);
        setAddError("");

        const targetForm = activeForm;
        const api = getApiFor(targetForm);

        if (recordExists(targetForm, values, api.data)) {
            setAddError("Record already exists.");
            setLoading(false);
            return;
        }

        try {
            const result = await api.add(values);
            if (result.success) {
                setToast({ visible: true, message: result.message, type: "success", duration: 3000 });
                await api.refresh();
                setFormData({});
                closeModal();
            } else {
                setToast({
                    visible: true,
                    message: result.message || "An error occurred",
                    type: "error",
                    duration: 3000
                });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (values) => {
        setLoading(true);
        try {
            const targetForm = editInfo.form;
            const api = getApiFor(targetForm);
            const result = await api.update(values);
            if (result.success) {
                setToast({ visible: true, message: result.message, type: "success", duration: 3000 });
            } else {
                setToast({ visible: true, message: result.message || "An error occurred", type: "error", duration: 3000 });
            }
            await api.refresh();
            closeEditModal();
        } catch (err) {
            setToast({ visible: true, message: err?.message ?? "Save failed", type: "error", duration: 3500 });
        } finally {
            setLoading(false);
        }
    };
    // helper: map section -> id field used inside the data objects
    const getIdFieldForSection = (sec) => {
        switch (sec) {
            case "ingredient": return "activeIngredientID";
            case "doctor": return "doctorID";
            case "supplier": return "supplierID";
            case "DosageForm": return "dosageID";
            case "employee": return "pharmacistID";
            default: return "id";
        }
    };

    const getName = (record, sec) => { // Added sec parameter
        switch (sec) { // Use sec, not global section
            case "ingredient": return (record?.ingredient ?? "").toString().toLowerCase();
            case "doctor": return (record?.doctorName ?? "").toString().toLowerCase();
            case "supplier": return (record?.supplierName ?? "").toString().toLowerCase();
            case "DosageForm": return (record?.dosageForm ?? "").toString().toLowerCase();
            case "employee": return (record?.name ?? "").toString().toLowerCase();
            default: return "Item";
        }
    }

    // Replace existing handleDelete(id) with:
    const handleDelete = async (id, sec) => { // sec is now required
        setLoading(true);
        const api = getApiFor(sec);
        const idField = getIdFieldForSection(sec);
        const record = (api.data || []).find(r => r[idField] === id);
        const prevStatus = (record?.status ?? "").toString().toLowerCase();
        const name = getName(record, sec); // Pass sec

        try {
            const res = await api.remove(id);
            const { success, message: serverMessage } = parseApiResponse(res);
            if (success) {
                const action = prevStatus === "active" ? "Disabled" : "Enabled";
                const msg = `${name} ${action} successfully`;
                setToast({ visible: true, message: msg, type: "success", duration: 3500 });
            } else {
                const fallback = "Operation failed";
                const msg = serverMessage || fallback;
                setToast({ visible: true, message: msg, type: "error", duration: 3500 });
            }
            await api.refresh();
        } catch (err) {
            setToast({ visible: true, message: err?.message ?? "Delete failed", type: "error", duration: 3500 });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const layoutCustomStyle = management['layout-custom-style'];

        const layoutEl = document.querySelector('.layout');
        if (layoutEl && layoutCustomStyle) {
            layoutEl.classList.add(layoutCustomStyle);
        }

        return () => {
            if (layoutEl && layoutCustomStyle) {
                layoutEl.classList.remove(layoutCustomStyle);
            }
        };
    }, []);
    useEffect(() => {
        const updateHeights = () => {
            const headerEl = document.querySelector('header') || document.querySelector('.app-header');
            const footerEl = document.querySelector('footer') || document.querySelector('.app-footer');
            const headerHeight = headerEl ? headerEl.getBoundingClientRect().height : 0;
            const footerHeight = footerEl ? footerEl.getBoundingClientRect().height : 80;
            // available height to allocate to a scrolling section (tweak the -40 as needed)
            const available = Math.max(300, Math.floor(window.innerHeight - headerHeight - footerHeight - 40));
            const root = document.querySelector(`.${management['management-page']}`);
            if (root) {
                root.style.setProperty('--header-height', `${headerHeight}px`);
                root.style.setProperty('--footer-height', `${footerHeight}px`);
                root.style.setProperty('--section-max-height', `${available}px`);
                // ensure page leaves visible room for footer (plus small gap)
                root.style.paddingBottom = `${footerHeight + 12}px`;
            }
        };

        updateHeights();
        window.addEventListener('resize', updateHeights);
        window.addEventListener('load', updateHeights);

        return () => {
            window.removeEventListener('resize', updateHeights);
            window.removeEventListener('load', updateHeights);
        };
    }, []);


    const openModal = (form) => {
        setValidationErrors({});
        setAddError("");
        setEmailExistsError("");
        setFormData({});
        setActiveForm(form);
    };
    const closeModal = () => {
        setActiveForm(null);
        setFormData({});
        setAddError("");
        setValidationErrors({});
        setEmailExistsError("");
    };
    const isModalVisible = !!activeForm;

    const openEditModal = (form, row) => setEditInfo({ form, record: row });
    const closeEditModal = () => setEditInfo({ form: null, record: null });
    function useHashSection() {
        const getInitialSection = () => {
            const hash = window.location.hash.replace("#", "");
            return hash || "ingredient";
        };

        const [section, setSection] = useState(getInitialSection);

        useEffect(() => {
            let initialAutoScrolling = true; // ignore observer during initial automatic scroll
            let scrollTimer = 0;

            const doScrollTo = (el) => {
                // scroll after layout settles
                window.requestAnimationFrame(() => {
                    clearTimeout(scrollTimer);
                    scrollTimer = window.setTimeout(() => {
                        try { el.scrollIntoView({ behavior: "auto", block: "start" }); }
                        catch { el.scrollIntoView(true); }
                        // allow a short grace period for the browser to finish smooth scrolling/layout
                        window.setTimeout(() => { initialAutoScrolling = false; }, 50);
                    }, 500);
                });
            };

            const handleHashChange = () => {
                const hash = window.location.hash.replace("#", "") || "ingredient";
                setSection(hash);

                const el = document.getElementById(hash);
                if (el) {
                    // perform the initial scroll to the section
                    initialAutoScrolling = true;
                    doScrollTo(el);
                } else {
                    // no element found — stop ignoring observer
                    initialAutoScrolling = false;
                }
            };

            window.addEventListener("hashchange", handleHashChange);

            // run once on mount to align UI with current hash
            handleHashChange();

            // IntersectionObserver: update hash when user scrolls to a section (only after initial auto-scroll)
            const observerOptions = {
                root: null,
                threshold: 0.6,
                rootMargin: "0px 0px -0px 0px"
            };

            const observer = new IntersectionObserver((entries) => {
                if (initialAutoScrolling) return; // skip while auto-scrolling
                const visible = entries
                    .filter(e => e.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

                if (visible) {
                    const id = visible.target.id || "";
                    if (id && window.location.hash.replace("#", "") !== id) {
                        // update URL without pushing history entries
                        history.replaceState(null, "", `#${id}`);
                        setSection(id);
                    }
                }
            }, observerOptions);

            const sectionEls = Array.from(document.querySelectorAll(".management-section[id]"));
            sectionEls.forEach(el => observer.observe(el));

            return () => {
                clearTimeout(scrollTimer);
                observer.disconnect();
                window.removeEventListener("hashchange", handleHashChange);
            };
        }, []);

        return section;
    }

    useEffect(() => {
        setPageTitle('Management');
        document.title = 'Management | Pharmacy';
    }, [setPageTitle]);

    useEffect(() => {
        const updateRowsPerPage = () => {
            const height = window.innerHeight;
            if (height < 800) setRowsPerPage(7);
            else if (height < 1024) setRowsPerPage(10);
            else setRowsPerPage(13);
        };

        updateRowsPerPage();
        window.addEventListener("resize", updateRowsPerPage);
        return () => window.removeEventListener("resize", updateRowsPerPage);
    }, []);


    const recordExists = (section, values, data) => {
        switch (section) {
            case "ingredient":
                return data.some(
                    item => item.ingredient?.toLowerCase() === values.Ingredient?.trim().toLowerCase()
                );
            case "supplier":
                const normalize = str => (str || "").replace(/\s+/g, ' ').trim().toLowerCase();
                const inputName = normalize(values.supplierName);
                return data.some(
                    item => normalize(item.supplierName) === inputName
                );
            case "DosageForm":
                return data.some(
                    item => item.dosageForm?.toLowerCase() === values.dosageForm?.trim().toLowerCase()
                );
            case "doctor":
                return data.some(
                    item => item.practiceNumber?.toLowerCase() === values.practiceNumber?.trim().toLowerCase()
                );
            case "pharmacist":
            case "employee":
                return data.some(
                    item => item.hcrn?.toLowerCase() === values.hcrn?.trim().toLowerCase()
                );
            default:
                return false;
        }
    };
    const handleSubmit = () => {
        // 1. Check for required fields
        const { isValid, errors } = validateForm(activeForm, formData);

        if (!isValid) {
            // 2. Set errors so inputs turn red
            setValidationErrors(prev => ({ ...prev, ...errors }));
            return; // Stop submission
        }

        // 3. If valid, proceed to add
        handleAdd(formData);
    };

    const isSubmitDisabled = Boolean(
        Object.keys(validationErrors || {}).length > 0 ||
        !!emailExistsError ||
        !!addError
    );
    return (
        <>
            {/* Show global loader if any API is loading (optional, simple check) */}
            <Loader isLoading={loading} />
            {toast.visible && (
                <ToastSuccess type={toast.type} message={toast.message} duration={toast.duration} />
            )}
            <div className={management["management-page"]}>

                {/* Active Ingredients Section - Wired to its own state */}
                <div className={management["management-section"]} id="ingredient">
                    <h2>Active Ingredients</h2>
                    <div className={management["add-search"]}>
                        <input
                            className={management["search-input"]}
                            placeholder="Search by Ingredient Name"
                            value={ingredientSearch}
                            onChange={(e) => setIngredientSearch(e.target.value)}
                        />
                        <select value={ingredientStatus} onChange={(e) => setIngredientStatus(e.target.value)} >
                            <option value="">All</option>
                            <option value="active">Active</option>
                            <option value="inactive">In-Active</option>
                        </select>
                        <button className={management["add-button"]} onClick={() => openModal("ingredient")}>Add Ingredient</button>
                    </div>
                    <DynamicTable
                        data={ingredientSorted}
                        rowsPerPage={rowsPerPage}
                        keyField="activeIngredientID"
                        update={(id) => {
                            const row = (ingredientApi.data || []).find(r => r.activeIngredientID === id);
                            openEditModal("ingredient", row);
                        }}
                        disable={(id) => handleDelete(id, 'ingredient')}
                    />
                </div>

                {/* Doctors Section - Wired to its own state */}
                <div className={management["management-section"]} id="doctor">
                    <h2>Doctors</h2>
                    <div className={management["add-search"]}>
                        <input
                            className={management["search-input"]}
                            placeholder="Search by Name,Surname or Practice number"
                            value={doctorSearch}
                            onChange={(e) => setDoctorSearch(e.target.value)}
                        />
                        <select value={doctorStatus} onChange={(e) => setDoctorStatus(e.target.value)} >
                            <option value="">All</option>
                            <option value="active">Active</option>
                            <option value="inactive">In-Active</option>
                        </select>
                        <button className={management["add-button"]} onClick={() => openModal("doctor")}>Add Doctor</button>
                    </div>
                    <DynamicTable
                        data={doctorSorted}
                        rowsPerPage={rowsPerPage}
                        keyField="doctorID"
                        update={(id) => {
                            const row = (doctorApi.data || []).find(r => r.doctorID === id);
                            openEditModal("doctor", row);
                        }}
                        disable={(id) => handleDelete(id, 'doctor')}
                    />
                </div>

                {/* Suppliers Section - Wired to its own state */}
                <div className={management["management-section"]} id="supplier">
                    <h2>Suppliers</h2>
                    <div className={management["add-search"]}>
                        <input
                            className={management["search-input"]}
                            placeholder="Search by Name or Email"
                            value={supplierSearch}
                            onChange={(e) => setSupplierSearch(e.target.value)}
                        />
                        <select value={supplierStatus} onChange={(e) => setSupplierStatus(e.target.value)} >
                            <option value="">All</option>
                            <option value="active">Active</option>
                            Â                          <option value="inactive">In-Active</option>
                        </select>
                        <button className={management["add-button"]} onClick={() => openModal("supplier")}>Add Supplier</button>
                    </div>
                    <DynamicTable
                        data={supplierSorted}
                        rowsPerPage={rowsPerPage}
                        keyField="supplierID"
                        update={(id) => {
                            const row = (supplierApi.data || []).find(r => r.supplierID === id);
                            openEditModal("supplier", row);
                        }}
                        disable={(id) => handleDelete(id, 'supplier')}
                    />
                </div>

                {/* Dosage Section - Wired to its own state */}
                <div className={management["management-section"]} id="DosageForm">
                    <h2>Dosage Form</h2>
                    <div className={management["add-search"]}>
                        <input
                            className={management["search-input"]}
                            placeholder="Search Dosage From"
                            value={dosageSearch}
                            onChange={(e) => setDosageSearch(e.target.value)}
                        />
                        <select value={dosageStatus} onChange={(e) => setDosageStatus(e.target.value)} >
                            S     <option value="">All</option>
                            <option value="active">Active</option>
                            <option value="inactive">In-Active</option>
                        </select>
                        <button className={management["add-button"]} onClick={() => openModal("dosage")}>Add Dosage Form</button>
                    </div>
                    <DynamicTable
                        data={dosageSorted}
                        rowsPerPage={rowsPerPage}
                        Methods keyField="dosageID"
                        update={(id) => {
                            const row = (dosageApi.data || []).find(r => r.dosageID === id);
                            openEditModal("dosage", row);
                        }}
                        disable={(id) => handleDelete(id, 'DosageForm')}
                    />
                </div>

                {/* Employees Section - Wired to its own state */}
                <div className={management["management-section"]} id="employee" >
                    <h2>Pharmacist</h2>
                    <div className={management["add-search"]}>
                        <input
                            className={management["search-input"]}
                            placeholder="Search by Name,Surname or id no.,hrcn"
                            value={employeeSearch}
                            onChange={(e) => setEmployeeSearch(e.target.value)}
                        />
                        <select value={employeeStatus} onChange={(e) => setEmployeeStatus(e.target.value)} >
                            <option value="">All</option>
                            <option value="active">Active</option>
                            <option value="inactive">In-Active</option>
                        </select>
                        <button className={management["add-button"]} onClick={() => openModal("pharmacist")}>Add Pharmacist</button>
                    </div>
                    <Employee
                        userDataList={employeeSorted}
                        update={(id) => {
                            const row = (employeeApi.data || []).find(r => r.pharmacistID === id);
                            openEditModal("pharmacist", row);
                        }}
                        disable={(id) => handleDelete(id, 'employee')}
                        refresh={() => employeeApi.refresh()}
                    />
                </div>
            </div>

            {/* Modal and EditModal are unchanged */}
            <Modal
                title={makeTitle(activeForm)}
                isOpen={isModalVisible}
                style={activeForm === 'pharmacist' ? { width: '65%' } : undefined}
            >
                {renderModalBody(activeForm, formData, handleInputChange, emailExistsError, validationErrors)}
                {addError && (
                    <div style={{ color: "red", marginBottom: "1em" }}>{addError}</div>
                )}
                <div className={management["modal-footer"]}>
                    <button className={management["close-btn"]} onClick={closeModal}>
                        Cancel
                    </button>
                    <button
                        className={management["save-btn"]}
                        onClick={handleSubmit}
                        disabled={isSubmitDisabled}
                        title={isSubmitDisabled ? "Fix validation errors before submitting" : "Confirm"}
                    >
                        Confirm
                    </button>
                </div>
            </Modal>

            <EditModal
                form={editInfo.form}
                record={editInfo.record}
                existingRecords={getApiFor(editInfo.form || section).data || []}
                onSave={handleSave}
                onClose={closeEditModal}
                style={editInfo.form === 'employee' ? { width: '65%' } : undefined}
            />

            <div className={management["floating-nav"]} aria-hidden={false}>
                {prevSection && (
                    <button
                        type="button"
                        className={`${management["floating-btn"]} ${management["floating-up"]}`}
                        onClick={() => scrollToSection(prevSection)}
                        title={`Scroll to ${sectionDisplayName(prevSection)}`}
                    >
                        ↑
                        <span className={management["floating-label"]}>Prev: {sectionDisplayName(prevSection)}</span>
                    </button>
                )}

                {nextSection && (
                    <button
                        type="button"
                        className={`${management["floating-btn"]} ${management["floating-down"]}`}
                        onClick={() => scrollToSection(nextSection)}
                        title={`Scroll to ${sectionDisplayName(nextSection)}`}
                    >
                        ↓
                        <span className={management["floating-label"]}>Next: {sectionDisplayName(nextSection)}</span>
                    </button>
                )}
            </div>
        </>
    );
}
export default Management;