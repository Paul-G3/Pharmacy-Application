import '../landingcss/landingPage.css'
import { Link } from "react-router-dom";
import React, { useEffect, useState } from 'react';
import { getData } from "..//../SharedComponents/apiService"
function Nav()
{
    const [pharmacyName, setpharmacyName] = useState("Health Hive")

    useEffect(() => {
        const fetchName = async () => {
            const result = await getData("/manager/settings/PharmacyName");
            console.log(result);
            if (result && result.pharmacyName)
                setpharmacyName(result.pharmacyName);
        };
        fetchName();
    }, [])
    return (
        <>
            <header className="navbar">
                <h1>{pharmacyName}</h1>
                <nav>
                    <a href="#about">About</a>
                    <a href="#hours">Trading Hours</a>
                    <a href="#login" id="openCustomerModal">Login</a>
                    <a href="#services">Services</a>
                    {/*<Link to="/Customer">Customer</Link>*/}
                    {/*<Link to="/Pharmacist">Pharmacist</Link>*/}
                    {/*<Link to="/PharmacyManager">Pharmacy Manager</Link>*/}
                </nav>
            </header>
        </>
    )
}

export default Nav;