import React, { useState, useEffect } from 'react';
import SettingsStyles from '../SharedComponentsStyles/SettingsStyle.module.css';
import Modal from '../PharmacyManager/Components/ModalComponent';
import { postData, getData } from '../SharedComponents/apiService';
import Loader from "../SharedComponents/Loader";
import { usePageTitle } from "../SharedComponents/SetPageTitle";
import ToastSuccess from "../SharedComponents/ToastSuccessModal";


const SettingsPage = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { setPageTitle } = usePageTitle();
    const [toast, setToast] = useState({ visible: false, message: "", type: "", duration: 3000 });


    useEffect(() => {
        const GetUserDetails = async () => {
            try {
                setLoading(true)
                var result = await getData('/manager/settings/UserDetails');
                setFormData(result[0]);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false)
            }
        };
        GetUserDetails();
    }, []);

    useEffect(() => {
        setPageTitle('Settings');
        document.title = 'Settings | Pharmacy';
    }, [setPageTitle]);

    // auto-hide toast after duration
    useEffect(() => {
        if (!toast.visible) return;
        const t = setTimeout(() => {
            setToast(prev => ({ ...prev, visible: false }));
        }, toast.duration || 3000);
        return () => clearTimeout(t);
    }, [toast.visible, toast.duration]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Luhn algorithm for South African ID (and other numeric checks)
    const luhnCheck = (num) => {
        let sum = 0;
        let shouldDouble = false;
        for (let i = num.length - 1; i >= 0; i--) {
            let digit = parseInt(num.charAt(i), 10);
            if (shouldDouble) {
                digit *= 2;
                if (digit > 9) digit -= 9;
            }
            sum += digit;
            shouldDouble = !shouldDouble;
        }
        return sum % 10 === 0;
    };

    const validateForm = () => {
        const newErrors = {};

        if (activeTab === 'profile') {
            // Name validation: required, no numbers, allow letters, spaces, hyphens, apostrophes
            if (!formData.Name || !formData.Name.trim()) {
                newErrors.Name = 'First name is required';
            } else if (!/^[A-Za-z\s'-]+$/.test(formData.Name.trim())) {
                newErrors.Name = 'First name can only contain letters, spaces, hyphens or apostrophes';
            }

            // Surname validation
            if (!formData.Surname || !formData.Surname.trim()) {
                newErrors.Surname = 'Last name is required';
            } else if (!/^[A-Za-z\s'-]+$/.test(formData.Surname.trim())) {
                newErrors.Surname = 'Last name can only contain letters, spaces, hyphens or apostrophes';
            }

            // Email validation
            if (!formData.Email) {
                newErrors.Email = 'Email is required';
            } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.Email)) {
                newErrors.Email = 'Invalid email address';
            }

            // Phone validation (optional but if provided should be digits, typical 10 digits)
            if (formData.PhoneNumber) {
                const digits = formData.PhoneNumber.replace(/\D/g, '');
                if (digits.length < 9 || digits.length > 15) {
                    newErrors.PhoneNumber = 'Phone number looks invalid';
                }
            }

            // ID Number validation: if provided, must be numeric and sensible (13 digits, Luhn valid for SA ID)
            if (formData.IDNumber) {
                const id = formData.IDNumber.replace(/\s+/g, '');
                if (!/^\d+$/.test(id)) {
                    newErrors.IDNumber = 'ID number must contain only digits';
                } else if (id.length !== 13) {
                    newErrors.IDNumber = 'ID number must be 13 digits';
                } else {
                    // check date part matches DOB if DOB provided
                    if (formData.DOB) {
                        const dob = formData.DOB.substring(0, 10); // yyyy-mm-dd
                        const yy = dob.substring(2, 4);
                        const mm = dob.substring(5, 7);
                        const dd = dob.substring(8, 10);
                        const idDate = id.substring(0, 6); // YYMMDD
                        const dobYYMMDD = yy + mm + dd;
                        if (idDate !== dobYYMMDD) {
                            newErrors.IDNumber = 'ID number date portion does not match Date of Birth';
                        }
                    }
                    // luhn check
                    if (!newErrors.IDNumber && !luhnCheck(id)) {
                        newErrors.IDNumber = 'ID number appears invalid';
                    }
                }
            }
        }

        if (isPasswordModalOpen) {
            if (!formData.currentPassword) newErrors.currentPassword = 'Current password is required';
            if (!formData.newPassword) {
                newErrors.newPassword = 'New password is required';
            } else if (formData.newPassword.length < 8) {
                newErrors.newPassword = 'Password must be at least 8 characters';
            }
            if (formData.newPassword !== formData.confirmPassword) {
                newErrors.confirmPassword = 'Passwords do not match';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const onSubmitProfile = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const result = await postData('/manager/settings/UpdateSettings', formData);
            if (result && result.success) {
                setToast({
                    visible: true,
                    message: result.message || "Profile updated successfully",
                    type: "success",
                    duration: 3000
                });
                // optional: refresh details if needed
                // await FetchOrderDetails?.();
            } else {
                setToast({
                    visible: true,
                    message: result?.message || "An error occurred",
                    type: "error",
                    duration: 3000
                });
            }
        } catch (err) {
            console.error(err);
            setToast({
                visible: true,
                message: "An error occurred while saving. Please try again.",
                type: "error",
                duration: 3000
            });
        } finally {
            setIsLoading(false);
        }
    };

    const onChangePassword = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const response = await postData('/manager/settings/UpdatePassword', {
                Password: formData.newPassword,
                currentPassword: formData.currentPassword
            });

            if (response && response.success === false) {
                setErrors(prev => ({
                    ...prev,
                    currentPassword: response.message || "Password change failed."
                }));
                setIsLoading(false);
                return;
            }

            setIsPasswordModalOpen(false);
            setFormData(prev => ({
                ...prev,
                newPassword: '',
                confirmPassword: '',
                currentPassword: ''
            }));

            setToast({
                visible: true,
                message: response?.message || 'Password changed successfully!',
                type: "success",
                duration: 3000
            });
        } catch (error) {
            setErrors(prev => ({
                ...prev,
                currentPassword: "An error occurred. Please try again."
            }));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={SettingsStyles.settingsContainer}>
            <Loader isLoading={loading} />
            {toast.visible && (
                <ToastSuccess type={toast.type} message={toast.message} duration={toast.duration} />
            )}
            <div className={SettingsStyles.settingsContent}>
                <div className={SettingsStyles.settingsSidebar}>
                    <button
                        className={`${SettingsStyles.sidebarButton} ${activeTab === 'profile' ? SettingsStyles.active : ''}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        Profile Information
                    </button>
                    <button
                        className={`${SettingsStyles.sidebarButton} ${activeTab === 'security' ? SettingsStyles.active : ''}`}
                        onClick={() => setActiveTab('security')}
                    >
                        Security
                    </button>
                </div>

                <div className={SettingsStyles.settingsMain}>
                    {activeTab === 'profile' && (
                        <form onSubmit={onSubmitProfile} className={SettingsStyles.settingsForm}>
                            <h2>Personal Information</h2>
                            <div className={SettingsStyles.formRow}>
                                <div className={SettingsStyles.formGroup}>
                                    <label>First Name</label>
                                    <input
                                        type="text"
                                        name="Name"
                                        value={formData.Name || ''}
                                        onChange={handleInputChange}
                                        className={errors.Name ? SettingsStyles.inputError : ''}
                                    />
                                    {errors.Name && <span className={SettingsStyles.errorMessage}>{errors.Name}</span>}
                                </div>
                                <div className={SettingsStyles.formGroup}>
                                    <label>Last Name</label>
                                    <input
                                        type="text"
                                        name="Surname"
                                        value={formData.Surname || ''}
                                        onChange={handleInputChange}
                                        className={errors.Surname ? SettingsStyles.inputError : ''}
                                    />
                                    {errors.Surname && <span className={SettingsStyles.errorMessage}>{errors.Surname}</span>}
                                </div>
                            </div>

                            <div className={SettingsStyles.formGroup}>
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    name="Email"
                                    value={formData.Email || ''}
                                    onChange={handleInputChange}
                                    className={errors.Email ? SettingsStyles.inputError : ''}
                                />
                                {errors.Email && <span className={SettingsStyles.errorMessage}>{errors.Email}</span>}
                            </div>

                            <div className={SettingsStyles.formGroup}>
                                <label>Phone Number</label>
                                <input
                                    type="tel"
                                    name="PhoneNumber"
                                    value={formData.PhoneNumber || ''}
                                    onChange={handleInputChange}
                                    className={errors.PhoneNumber ? SettingsStyles.inputError : ''}
                                />
                                {errors.PhoneNumber && <span className={SettingsStyles.errorMessage}>{errors.PhoneNumber}</span>}
                            </div>

                            <div className={SettingsStyles.formGroup}>
                                <label>Address</label>
                                <input
                                    type="text"
                                    name="AddressLine"
                                    value={formData.AddressLine || ''}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className={SettingsStyles.formGroup}>
                                <label>Date of Birth</label>
                                <input
                                    type="date"
                                    name="DOB"
                                    value={formData.DOB ? formData.DOB.substring(0, 10) : ''}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className={SettingsStyles.formGroup}>
                                <label>ID Number</label>
                                <input
                                    type="text"
                                    name="IDNumber"
                                    value={formData.IDNumber || ''}
                                    onChange={handleInputChange}
                                    className={errors.IDNumber ? SettingsStyles.inputError : ''}
                                />
                                {errors.IDNumber && <span className={SettingsStyles.errorMessage}>{errors.IDNumber}</span>}
                            </div>

                            <button
                                type="submit"
                                className={SettingsStyles.button}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </form>
                    )}

                    {activeTab === 'security' && (
                        <div className={SettingsStyles.settingsForm}>
                            <h2>Security Settings</h2>

                            <div className={SettingsStyles.securityItem}>
                                <h3>Password</h3>
                                <button
                                    className={`${SettingsStyles.button} ${SettingsStyles.outlineButton}`}
                                    onClick={() => setIsPasswordModalOpen(true)}
                                >
                                    Change Password
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Modal
                title="Change Password"
                isOpen={isPasswordModalOpen}
                onClose={() => setIsPasswordModalOpen(false)}
            >
                <form onSubmit={onChangePassword} className={SettingsStyles.modalForm}>
                    <div className={SettingsStyles.formGroup}>
                        <label>Current Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showCurrentPassword ? "text" : "password"}
                                name="currentPassword"
                                value={formData.currentPassword || ''}
                                onChange={handleInputChange}
                                className={errors.currentPassword ? SettingsStyles.inputError : ''}
                                style={{ width: '100%', paddingRight: '2.5rem' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrentPassword(prev => !prev)}
                                style={{
                                    position: 'absolute',
                                    right: '0.5rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: 0,
                                    height: '1.5rem',
                                    width: '2rem'
                                }}
                                tabIndex={-1}
                            >
                                {showCurrentPassword ? '🙈' : '👁️'}
                            </button>
                        </div>
                        {errors.currentPassword && <span className={SettingsStyles.errorMessage}>{errors.currentPassword}</span>}
                    </div>

                    <div className={SettingsStyles.formGroup}>
                        <label>New Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showNewPassword ? "text" : "password"}
                                name="newPassword"
                                value={formData.newPassword || ''}
                                onChange={handleInputChange}
                                className={errors.newPassword ? SettingsStyles.inputError : ''}
                                style={{ width: '100%', paddingRight: '2.5rem' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(prev => !prev)}
                                style={{
                                    position: 'absolute',
                                    right: '0.5rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: 0,
                                    height: '1.5rem',
                                    width: '2rem'
                                }}
                                tabIndex={-1}
                            >
                                {showNewPassword ? '🙈' : '👁️'}
                            </button>
                        </div>
                        {errors.newPassword && <span className={SettingsStyles.errorMessage}>{errors.newPassword}</span>}
                    </div>

                    <div className={SettingsStyles.formGroup}>
                        <label>Confirm New Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                value={formData.confirmPassword || ''}
                                onChange={handleInputChange}
                                className={errors.confirmPassword ? SettingsStyles.inputError : ''}
                                style={{ width: '100%', paddingRight: '2.5rem' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(prev => !prev)}
                                style={{
                                    position: 'absolute',
                                    right: '0.5rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: 0,
                                    height: '1.5rem',
                                    width: '2rem'
                                }}
                                tabIndex={-1}
                            >
                                {showConfirmPassword ? '🙈' : '👁️'}
                            </button>
                        </div>
                        {errors.confirmPassword && <span className={SettingsStyles.errorMessage}>{errors.confirmPassword}</span>}
                    </div>

                    <div className={SettingsStyles.modalButtons}>
                        <button
                            type="button"
                            className={`${SettingsStyles.button} ${SettingsStyles.outlineButton}`}
                            onClick={() => setIsPasswordModalOpen(false)}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={SettingsStyles.button}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Changing...' : 'Change Password'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default SettingsPage;