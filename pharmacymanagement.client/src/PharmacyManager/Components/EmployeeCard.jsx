import React, { useState } from 'react';
import employeecard from '../CSS_for_components/EmployeeCardcss.module.css';
import Modal from '../Components/ModalComponent';
import { FaEllipsisV, FaTrash } from 'react-icons/fa';
import { postData } from '../../SharedComponents/apiService';
import Loader from "../../SharedComponents/Loader";
import ToastSuccess from "../../SharedComponents/ToastSuccessModal";


const UserCard = ({ user, updatemethod, disableMethod, refresh }) => {
    const [detailOpen, setDetailOpen] = useState(false)
    const [pharmacistDetails, setPharmacistDetails] = useState(false)
    const [removingPic, setRemovingPic] = useState(false);
    const profileImg = `data:image/jpeg;base64,${user.profilePic}`;
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ visible: false, message: "", type: "", duration: 3000 });


    // normalize status and compute class
    const statusKey = (user.status || 'active').toString().trim().toLowerCase();
    const statusClass = employeecard[statusKey] || '';
    const isActive = statusKey === 'active';

    const removeProfilePic = async () => {
        setRemovingPic(true);
        setLoading(true)
        try {
            const result =await postData('/manager/management/RemoveProfilePic', user.pharmacistID);
            if (result.success) {
                console.log(record)
                setToast({
                    visible: true,
                    message: mess,
                    type: "success",
                    duration: 3000
                });
                await FetchEvents()
            } else {
                setToast({
                    visible: true,
                    message: result.message || "An error occurred",
                    type: "error",
                    duration: 3000
                });
            }
        } catch (err) {
            console.error('Failed to remove profile picture', err);
        } finally {
            setRemovingPic(false);
            refresh();
            setLoading(false);
        }
    };
    const PharmacistDetail = () => {
        setPharmacistDetails(true)
        toggleDetail()
    }

    const Update = (id) => {
        updatemethod(id)
        toggleDetail();
    }
    const disable = (id) => {
        disableMethod(id)
        toggleDetail()
    }
    const toggleDetail = () => {
        setDetailOpen(prev => !prev);
    }

    return (
        <div className={`${employeecard["user-card"]} ${statusClass}`}>
            <Loader isLoading={loading} />
            {toast.visible && (
                <ToastSuccess type={toast.type} message={toast.message} duration={toast.duration} />
            )}
            <div className={employeecard["top"]}>
                <div className={employeecard["avatar-placeholder"]}>
                    {user.profilePic ? (
                        <>
                            <img
                                src={profileImg}
                                alt="Profile"
                                className={employeecard["profile-pic"]}
                                style={{
                                    objectFit: "cover",
                                    cursor: "pointer",
                                    background: undefined,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center"
                                }}
                            />
                            <div
                                className={employeecard["profile-pic-overlay"]}
                                onClick={removeProfilePic}
                                title="Remove profile picture"
                            >
                                <FaTrash className={employeecard["bin-icon"]} />
                            </div>
                        </>
                    ) : (
                        <div
                            className={employeecard["profile-pic"]}
                            style={{
                                background: "#e0e0e0",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer"
                            }}
                        >
                            <span
                                style={{
                                    fontSize: "2rem",
                                    fontWeight: "bold",
                                    color: "#555"
                                }}
                            >
                                {(user.name?.[0] || "") + (user.surname?.[0] || "")}
                            </span>
                        </div>
                    )}
                </div>

                <div className={employeecard["user-info"]}>
                    <div className={employeecard["user-header"]}>
                        <div>
                            <h2
                                className={`${employeecard["user-name"]}`}
                            >
                                {user.name} {user.surname}
                            </h2>
                            <p className={employeecard["user-id"]}>{user.idNumber}</p>
                        </div>
                        <div className={employeecard["menu-icon"]} onClick={toggleDetail}>{<FaEllipsisV />}</div>
                        {detailOpen && (
                            <div className={employeecard["detail-menu"]} >
                                <button className={employeecard["detail-btn"]} onClick={() => PharmacistDetail()} >Details</button>
                                <button className={employeecard["detail-btn"]} onClick={() => Update(user.pharmacistID)}>Update</button>
                                <button className={employeecard["detail-btn"]} onClick={() => disable(user.pharmacistID)}  > {isActive ? "Disable" : "Enable"} </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className={employeecard["user-details"]}>
                <div>
                    <div className={employeecard["label"]}>Phone</div>
                    <div>{user.phoneNumber}</div>
                </div>
                <div>
                    <div className={employeecard["label"]}>Practice no.</div>
                    <div>{user.hcrn}</div>
                </div>
                <div>
                    <div className={employeecard["label"]}>Gender</div>
                    <div>{user.gender}</div>
                </div>
                <div>
                    <div className={ `${isActive
                                    ? employeecard["user-name-active"]
                                    : employeecard["user-name-inactive"]
                                    }` }
                    >{user.status}</div>
                </div>
            </div>
            <Modal title="Pharmacist Details" isOpen={pharmacistDetails} style={{ width: 'max-content', padding: '0 2em' }} >
                <>
                    <div
                        className={employeecard["modal-body"]}>
                        <div className={employeecard["detail-row"]}>
                            <span className={employeecard["detail-label"]}>Name:</span>
                            <span className={employeecard["detail-value"]}>{user.name}</span>
                        </div>

                        <div className={employeecard["detail-row"]}>
                            <span className={employeecard["detail-label"]}>Surname:</span>
                            <span className={employeecard["detail-value"]}>{user.surname}</span>
                        </div>

                        <div className={employeecard["detail-row"]}>
                            <span className={employeecard["detail-label"]}>HCRN:</span>
                            <span className={employeecard["detail-value"]}>{user.hcrn}</span>
                        </div>

                        <div className={employeecard["detail-row"]}>
                            <span className={employeecard["detail-label"]}>ID Number:</span>
                            <span className={employeecard["detail-value"]}>{user.idNumber}</span>
                        </div>

                        <div className={employeecard["detail-row"]}>
                            <span className={employeecard["detail-label"]}>Phone Number:</span>
                            <span className={employeecard["detail-value"]}>{user.phoneNumber}</span>
                        </div>

                        <div className={employeecard["detail-row"]}>
                            <span className={employeecard["detail-label"]}>Email:</span>
                            <span className={employeecard["detail-value"]}>{user.email}</span>
                        </div>

                        <div className={employeecard["detail-row"]}>
                            <span className={employeecard["detail-label"]}>Gender:</span>
                            <span className={employeecard["detail-value"]}>{user.gender}</span>
                        </div>

                        <div className={employeecard["detail-row"]}>
                            <span className={employeecard["detail-label"]}>Date Of Birth:</span>
                            <span className={employeecard["detail-value"]}>{user.dob?.split('T')[0]}</span>
                        </div>

                        <div className={employeecard["detail-row"]}>
                            <span className={employeecard["detail-label"]}> AddressLine:</span>
                            <span className={employeecard["detail-value"]}>{user.addressLine}</span>
                        </div>
                    </div>
                </>

                <div className={employeecard["modal-footer"]}>
                    <button
                        className={employeecard["close-btn"]}
                        onClick={() => {
                            setPharmacistDetails(false)
                        }}
                    >
                        Close
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default UserCard;