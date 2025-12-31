import {
    FaHome,
    FaBriefcaseMedical,
    FaPills,
    FaInfoCircle,
    FaClipboardList,
    FaUsersCog,
    FaPlusCircle,
    FaChartBar
} from "react-icons/fa";
import { NavLink, useLocation } from "react-router-dom";
import React, { useState, useEffect } from 'react';
import SideSubNav from "../PharmacyManager/Components/SideSubNav";

function ManagerNav() {
    const basePath = "/PharmacyManager";
    const location = useLocation(); // Get current route
    const [expandItem, setExpandItem] = useState(false);
    const items = [
        { id: 'ingredient', label: 'Ingredients' },
        { id: 'doctor', label: 'Doctors' },
        { id: 'supplier', label: 'Suppliers' },
        { id: 'DosageForm', label: 'Dosage' },
        { id: 'employee', label: 'Employees' },
    ];

    // Automatically expand only if you're on Management page
    useEffect(() => {
        if (location.pathname === `${basePath}/Management`) {
            setExpandItem(true);
        } else {
            setExpandItem(false);
        }
    }, [location.pathname]);

    const subitemclass = expandItem ? "subitems expand" : "subitems";

    return (
        <>
            <NavLink
                to={basePath}
                end
                className={({ isActive }) =>
                    `link-no-style ${isActive ? "active-link" : ""}`
                }
            >
                <div className="nav-item">
                    <FaHome className="nav-icon" />
                    <span className="nav-label">Dashboard</span>
                </div>
            </NavLink>

            {/* Management */}
            <NavLink
                to={`${basePath}/Management#ingredient`}
                className={({ isActive }) =>
                    `link-no-style ${isActive ? "active-link" : ""}`
                }
            >
                <div className="nav-item">
                    <FaUsersCog className="nav-icon" />
                    <span className="nav-label">Management</span>
                </div>
            </NavLink>

            {expandItem && (
                <div className={subitemclass}>
                    <SideSubNav subItems={items} />
                </div>
            )}

            {/* Medications */}
            <NavLink
                to={`${basePath}/Medication`}
                className={({ isActive }) =>
                    `link-no-style ${isActive ? "active-link" : ""}`
                }
            >
                <div className="nav-item">
                    <FaPills className="nav-icon" />
                    <span className="nav-label">Medications</span>
                </div>
            </NavLink>

            {/* StockTake */}
            <NavLink
                to={`${basePath}/StockTake`}
                className={({ isActive }) =>
                    `link-no-style ${isActive ? "active-link" : ""}`
                }
            >
                <div className="nav-item">
                    <FaChartBar className="nav-icon" />
                    <span className="nav-label">StockTake</span>
                </div>
            </NavLink>

            {/* Order History */}
            <NavLink
                to={`${basePath}/MedicationOrders`}
                className={({ isActive }) =>
                    `link-no-style ${isActive ? "active-link" : ""}`
                }
            >
                <div className="nav-item">
                    <FaClipboardList className="nav-icon" />
                    <span className="nav-label">Order History</span>
                </div>
            </NavLink>

            {/* New Order */}
            <NavLink
                to={`${basePath}/NewOrder`}
                className={({ isActive }) =>
                    `link-no-style ${isActive ? "active-link" : ""}`
                }
            >
                <div className="nav-item">
                    <FaPlusCircle className="nav-icon" />
                    <span className="nav-label">New Order</span>
                </div>
            </NavLink>

            {/* Info */}
            <NavLink
                to={`${basePath}/InfoPage`}
                className={({ isActive }) =>
                    `link-no-style ${isActive ? "active-link" : ""}`
                }
            >
                <div className="nav-item">
                    <FaInfoCircle className="nav-icon" />
                    <span className="nav-label">Info</span>
                </div>
            </NavLink>

            {/* Profile */}
            <NavLink
                to={`${basePath}/Settings`}
                className={({ isActive }) =>
                    `link-no-style ${isActive ? "active-link" : ""}`
                }
            >
                <div className="nav-item">
                    <FaBriefcaseMedical className="nav-icon" />
                    <span className="nav-label">Profile</span>
                </div>
            </NavLink>        </>
    );
}

export default ManagerNav;
