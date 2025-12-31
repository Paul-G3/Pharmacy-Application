import React, { useState, useEffect } from "react";
import PharmacistNav from "../SharedComponents/PharmacistNav";
import CustomerNav from "../SharedComponents/CustomerNav";
import ManagerNav from "../SharedComponents/ManagerNav";
import '../SharedComponentsStyles/NavBarStyle.css';
import { FaSignOutAlt } from "react-icons/fa";
import { NavLink, useNavigate } from "react-router-dom";
import Modal from "../PharmacyManager/Components/ModalComponent";
import { getData, uploadFile } from "../SharedComponents/apiService";
import Loader from "../SharedComponents/Loader";


function SideNav({ role }) {
    const [profileImg, setProfileImg] = useState(null);
    const [profileInitials, setProfileInitials] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // logout confirmation modal state
    const [isLogoutOpen, setIsLogoutOpen] = useState(false);
    const navigate = useNavigate();

    const fetchProfileImage = async () => {
        try {
            const result = await getData("/manager/settings/ProfileImage");
            if (result?.base64Image) {
                setProfileImg(`data:image/jpeg;base64,${result.base64Image}`);
                setProfileInitials(null);
            }
            else if (result?.initials) {
                setProfileImg(null);
                setProfileInitials(result.initials);
            }
        } catch (err) {
            setProfileImg(null);
            setProfileInitials(null);
        }
    };
    useEffect(() => {

        fetchProfileImage();
    }, []);

    // Handle image upload
    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setLoading(true);
        const formData = new FormData();
        formData.append("image", file);
        try {
            // Example endpoint, adjust as needed
            const result = await uploadFile("/manager/settings/UploadProfile", formData);
            // Update profile image after upload
            if (result?.base64Image) {
                setProfileImg(`data:image/jpeg;base64,${result.base64Image}`);
            } else if (result?.imageUrl) {
                setProfileImg(result.imageUrl);
            }
            setIsModalOpen(false);
        } catch (err) {
          console.error(err)
        } finally {
            setLoading(false);
            fetchProfileImage();
        }
    };

    // logout modal handlers
    const openLogoutModal = () => setIsLogoutOpen(true);
    const closeLogoutModal = () => setIsLogoutOpen(false);

    const handleLogoutConfirm = async () => {
        setLoading(true);
        try {
            // clear client auth (adjust keys to your app)
            try { localStorage.removeItem('jwtToken'); } catch { }
            try { localStorage.removeItem('user'); } catch { }
            try { sessionStorage.clear(); } catch { }
          
        } finally {
            setLoading(false);
            setIsLogoutOpen(false);
            navigate('/');
          
        }
    };

    return (
        <div className="side-nav-container">
            <Loader isLoading={loading} />

            <div className="profile-pic-container">
                {profileImg ? (
                    <img
                        src={profileImg}
                        alt="Profile"
                        className="profile-pic"
                        style={{ objectFit: "cover", cursor: "pointer" }}
                        onClick={() => setIsModalOpen(true)}
                    />

                ) : (
                    <div
                        className="profile-initials"
                        onClick={() => setIsModalOpen(true)}
                    >
                        {profileInitials || ""}
                    </div>
                )}
            </div>

            <Modal
                title="Change Profile Picture"
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                footer={
                    <>
                        <button className={"close-btn"} onClick={() => setIsModalOpen(false)}>Cancel</button>
                    </>
                }
            >
                <div style={{ textAlign: "center" }}>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        disabled={loading}
                    />
                    {loading && <p>Uploading...</p>}
                </div>
            </Modal>

            <div className="nav-items">
                {role === "pharmacist" && <PharmacistNav />}
                {role === "customer" && <CustomerNav />}
                {role === "manager" && <ManagerNav />}

                <a
                    type="button"
                    className="link-no-style"
                    onClick={openLogoutModal}
                    aria-haspopup="dialog"
                    title="Log Out"
                >
                    <div className="nav-item">
                        <FaSignOutAlt className="nav-icon" />
                        <span className="nav-label">Log Out</span>
                    </div>
                </a>
            </div>

            <Modal
                title="Confirm Logout"
                isOpen={isLogoutOpen}
                onClose={closeLogoutModal}
                footer={
                    <>
                        <button className="close-btn" onClick={closeLogoutModal} disabled={loading}>Cancel</button>
                        <button
                            className="save-btn"
                            onClick={handleLogoutConfirm}
                            disabled={loading}
                            title="Confirm logout"
                        >
                            {loading ? "Logging out..." : "Log out"}
                        </button>
                    </>
                }
            >
                <div style={{ padding: "1rem 0" }}>
                    <p>Are you sure you want to log out? You will need to sign in again to continue.</p>
                </div>
            </Modal>
        </div>
    );
}

export default SideNav;