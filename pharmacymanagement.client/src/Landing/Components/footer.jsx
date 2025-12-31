import '../landingcss/landingPage.css'
import logo from '../images/health hive logo.png';
import { getData } from '../../SharedComponents/apiService'
import { useState, useEffect } from 'react';

function footer() {
    const [ResposnsiblePharmacist, setResposnsiblePharmacist] = useState([])
    useEffect(() => {
        const GetPharmacist =async () => {
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
    console.log(ResposnsiblePharmacist)
    return (
        <>
            <footer class="site-footer" id="hours">
                <div class="footer-content">
                    <div class="footer-column">
                        <div class="footer-logo">
                            <img src={logo} alt="Health Hive Logo" class="footer-logo-img"/>
                        </div>
                        <p class="footer-address">
                          {ResposnsiblePharmacist.length > 0 ? ResposnsiblePharmacist[0].PhysicalAddress : ""}
                        </p>
                    </div>

                    <div class="footer-column">
                        <h3 class="footer-title">Trading Hours</h3>
                        <ul class="footer-list">
                            <li><span class="hours-day">Monday - Friday:</span> 08:00 AM - 08:00 PM</li>
                            <li><span class="hours-day">Public Holidays:</span> 10:00 AM - 02:00 PM</li>
                            <li><span class="hours-day">Saturday:</span> 09:00 AM - 05:00 PM</li>
                            <li><span class="hours-day">Sunday:</span> Closed</li>
                        </ul>
                    </div>

                    <div class="footer-column">
                        <h3 class="footer-title">Responsible Pharmacist</h3>
                        <ul class="footer-list">
                            <li>
                                {ResposnsiblePharmacist.length > 0 &&
                                    <>
                                        <strong>Dr {ResposnsiblePharmacist[0].Surname}</strong><br />
                                        <p>{ResposnsiblePharmacist[0].PhoneNumber}</p>
                                    </>
                                }
                            </li>
                        
                        </ul>
                    </div>
                </div>

                <div class="footer-bottom">
                    <p>&copy; 2025 Health Hive. All rights reserved.</p>
                </div>
            </footer>

        </>
    )
}

export default footer;