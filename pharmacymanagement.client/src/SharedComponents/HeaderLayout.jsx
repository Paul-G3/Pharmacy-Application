import React, { useEffect, useState } from 'react';
import "../SharedComponentsStyles/HeaderStyle.css";
import { usePageTitle } from "../SharedComponents/SetPageTitle";
import { getData } from "../SharedComponents/apiService"

function Header() {
    const { pageTitle } = usePageTitle();

    const [pharmacyName,setpharmacyName] =useState("Health Hive")

    useEffect(() => {
        const fetchName = async () => {
            const result = await getData("/manager/settings/PharmacyName");
            if (result && result.pharmacyName)
                setpharmacyName(result.pharmacyName);
        };
        fetchName();
    }, [])
    return (
        <>
            <nav className="nav-style">
                <div className="header-left">{pageTitle}</div> {/* Display the title */}
                <div className="header-container">
                    <div className="header-title">{pharmacyName}</div>
                    <div className="header-avatar"></div>
                </div>
            </nav>
        </>
    );
};

export default Header;