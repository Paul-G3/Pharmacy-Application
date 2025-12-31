import footer from '../SharedComponentsStyles/sharedFooter.module.css'
import React, { useEffect, useState } from 'react';
import { getData } from ".//apiService"
function FooterLayout() {
    const [pharmacyName, setpharmacyName] = useState("Health Hive")
    const [ResposnsiblePharmacist, setResposnsiblePharmacist] = useState([])

    useEffect(() => {
        const fetchName = async () => {
            const result = await getData("/manager/settings/PharmacyName");
            if (result && result.pharmacyName)
                setpharmacyName(result.pharmacyName);
        };
        fetchName();

        const GetPharmacist = async () => {
            try {
                const result = await getData("/api/Authenticate/ResposnsiblePharmacist")

                if (Array.isArray(result)) {
                    setResposnsiblePharmacist(result)
                } else {
                    console.warn("result is not an array")
                }
            } catch (err) {
                console.error("fetch Error ", err)
            }
        }
        GetPharmacist()
    }, [])

    return (
        <footer className={footer["structured-footer"]}>
            <div className={footer["footer-item"]}> &copy;2025 {pharmacyName}</div>
            <div className={footer["footer-separator"]}>|</div>
            <div className={footer["footer-item"]}>Support: 086 455 8264</div>
            <div className={footer["footer-separator"]}>|</div>
            {ResposnsiblePharmacist.length > 0 &&
                <>
                <div className={footer["footer-item"]}>Responsible Pharmacist: Dr {ResposnsiblePharmacist[0].Surname} - {ResposnsiblePharmacist[0].PhoneNumber}</div>

                </>
            }
        </footer>
    );
}

export default FooterLayout