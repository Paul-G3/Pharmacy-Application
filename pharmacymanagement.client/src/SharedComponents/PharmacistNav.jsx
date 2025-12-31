import {
    FaHome,
    FaCog,
    FaPills,
    FaFileMedical,
    FaClipboardList,
    FaHistory,
    FaShoppingCart,
    FaChartBar
} from "react-icons/fa";

import { NavLink } from "react-router-dom";

function PharmacistNav() {
    const basePath = "/Pharmacist";

    return (
        <>
            <NavLink
                to={basePath}
                end
                className={({ isActive }) =>
                    `link-no-style ${isActive ? "active-link" : ""}`}
            >
                <div className="nav-item">
                    <FaHome className="nav-icon" />
                    <span className="nav-label">Dashboard</span>
                </div>
            </NavLink>

            <NavLink
                to={`${basePath}/Prescription`}
                className={({ isActive }) => `link-no-style ${isActive ? "active-link" : ""}`}
            >
                <div className="nav-item">
                    <FaFileMedical className="nav-icon" />
                    <span className="nav-label">Load Script</span>
                </div>
            </NavLink>

            <NavLink
                to={`${basePath}/PrescriptionList`}
                className={({ isActive }) => `link-no-style ${isActive ? "active-link" : ""}`}
            >
                <div className="nav-item">
                    <FaClipboardList className="nav-icon" />
                    <span className="nav-label">Pending Scripts</span>
                </div>
            </NavLink>

            <NavLink
                to={`${basePath}/DispenseMedication`}
                className={({ isActive }) => `link-no-style ${isActive ? "active-link" : ""}`}
            >
                <div className="nav-item">
                    <FaPills className="nav-icon" />
                    <span className="nav-label">Walk-In</span>
                </div>
            </NavLink>

            <NavLink
                to={`${basePath}/PharmacistOrdersPage`}
                className={({ isActive }) => `link-no-style ${isActive ? "active-link" : ""}`}
            >
                <div className="nav-item">
                    <FaShoppingCart className="nav-icon" />
                    <span className="nav-label">Orders</span>
                </div>
            </NavLink>

            <NavLink
                to={`${basePath}/ProcessedScripts`}
                className={({ isActive }) => `link-no-style ${isActive ? "active-link" : ""}`}
            >
                <div className="nav-item">
                    <FaHistory className="nav-icon" />
                    <span className="nav-label">Order Collection</span>
                </div>
            </NavLink>

            <NavLink
                to={`${basePath}/PharmacistReports`}
                className={({ isActive }) => `link-no-style ${isActive ? "active-link" : ""}`}
            >
                <div className="nav-item">
                    <FaChartBar className="nav-icon" />
                    <span className="nav-label">Reports</span>
                </div>
            </NavLink>

            <NavLink
                to={`${basePath}/Settings`}
                className={({ isActive }) => `link-no-style ${isActive ? "active-link" : ""}`}
            >
                <div className="nav-item">
                    <FaCog className="nav-icon" />
                    <span className="nav-label">Profile</span>
                </div>
            </NavLink>
        </>
    );
}

export default PharmacistNav;
