import { NavLink } from "react-router-dom";
import {
    FaHome,
    FaCog,
    FaPrescriptionBottleAlt,
    FaChartBar
} from "react-icons/fa";

function CustomerNav() {
    const basePath = "/Customer";

    return (
        <>
            <NavLink
                to={`${basePath}`}
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
                to={`${basePath}/ManageAllergies`}
                className={({ isActive }) => `link-no-style ${isActive ? "active-link" : ""}`}
            >
                <div className="nav-item">
                    <i className="fa-solid fa-person-dots-from-line nav-icon" style={{ fontSize: "1.7rem", color: "white" }}></i>
                    <span className="nav-label">Allergies</span>
                </div>
            </NavLink>

            <NavLink
                to={`${basePath}/ManageRepeats`}
                className={({ isActive }) => `link-no-style ${isActive ? "active-link" : ""}`}
            >
                <div className="nav-item">
                    <FaPrescriptionBottleAlt className="nav-icon" />
                    <span className="nav-label">Place Order</span>
                </div>
            </NavLink>

            <NavLink
                to={`${basePath}/ViewPrescriptions`}
                className={({ isActive }) => `link-no-style ${isActive ? "active-link" : ""}`}
            >
                <div className="nav-item">
                    <i className="fa-solid fa-eye nav-icon" style={{ fontSize: "1.7rem", color: "white" }}></i>
                    <span className="nav-label">Pending Scripts</span>
                </div>
            </NavLink>

            <NavLink
                to={`${basePath}/AddPrescription`}
                className={({ isActive }) => `link-no-style ${isActive ? "active-link" : ""}`}
            >
                <div className="nav-item">
                    <i className="fa-solid fa-file-import nav-icon" style={{ fontSize: "1.7rem", color: "white" }}></i>
                    <span className="nav-label">Add Script</span>
                </div>
            </NavLink>

            <NavLink
                to={`${basePath}/CustomerOrdersPage`}
                className={({ isActive }) => `link-no-style ${isActive ? "active-link" : ""}`}
            >
                <div className="nav-item">
                    <i className="fa-solid fa-cart-shopping nav-icon" style={{ fontSize: "1.7rem", color: "white" }}></i>
                    <span className="nav-label">Orders</span>
                </div>
            </NavLink>

            <NavLink
                to={`${basePath}/ReportsPage`}
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

export default CustomerNav;
