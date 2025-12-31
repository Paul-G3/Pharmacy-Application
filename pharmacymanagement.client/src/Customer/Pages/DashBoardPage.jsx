import '../CustomerCss/CustomerDashBoard.css'
import { FaPrescriptionBottleAlt } from 'react-icons/fa';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import Loader from '../../SharedComponents/Loader';
import { usePageTitle } from "../../SharedComponents/SetPageTitle";

function Dashboard() {
    const basePath = process.env.NODE_ENV === 'production' ? '/GRP-04-11' : '';
    const token = localStorage.getItem("jwtToken"); // adjust the key if needed

    //state variable
    const [DashBoardData, setDashBoardData] = useState([]);
    const [loading, setLoading] = useState(false);
    const { setPageTitle } = usePageTitle();
    const navigate = useNavigate();
    useEffect(() => { 
        setPageTitle('Dashboard');
        setLoading(true);
        fetch(`${basePath}/api/Customer/dashBoard-data`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
               
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Failed to fetch allergies");
                }
                return response.json();
            })
            .then(data => {
                console.log("Dah Board Data:", data);
                setDashBoardData([
                    {
                        title: "Total Allergies",
                        value: data.totalAllergies,
                        method: GoToAllergy
                    },
                    {
                        title: "Total Processed Scripts",
                        value: data.totalProcesedScripts,
                        method: GoToMedicationRepeats
                    },
                    {
                        title: "Total Pending Scripts",
                        value: data.totalUprocesedScripts,
                        method: GoToUnprocessedScripts
                    },
                    {
                        title: "Total Orders",
                        value: data.totalOrders,
                        method: GoToOrder
                    }
                ]);

                setLoading(false);

            })
            .catch(error => {
                console.error("Error fetching allergies:", error);
                setLoading(false);
            });

    }, []);

    function GoToAllergy() {
        navigate("/Customer/ManageAllergies");
    }
    function GoToOrder() { 
        navigate("/Customer/CustomerOrdersPage");
    }    

    function GoToUnprocessedScripts() {
        navigate("/Customer/ViewPrescriptions");
    }

    function GoToMedicationRepeats() {
        navigate("/Customer/ManageRepeats");
    }

    return (
        <div className="dashboard-page-customer">

            <div className="customer-quick-actions">
               <h2 className="customer-quick-action-header">Quick Actions</h2>

                <div className="quick-actions-customes-divs-container">

                    <div className="action-customer" onClick={GoToAllergy}>
                        
                        <i className="fa-solid fa-person-dots-from-line" style={{ fontSize: "28px", color: "#116A6F" }}></i>
                        <p>Allergies</p>
                    </div>

                    <div className="action-customer" onClick={GoToOrder}>
                        <i class="fa-solid fa-cart-shopping" style={{ fontSize: "28px", color: "blue" }}></i> 
                        <p>Orders</p>
                    </div>

                    <div className="action-customer" onClick={GoToUnprocessedScripts}>
                        <i className="fa-solid fa-scroll" style={{ fontSize: "28px", color: "orange" }}></i>
                        <p>Pending scripts</p>
                    </div>

                    <div className="action-customer" onClick={GoToMedicationRepeats}>
                        <FaPrescriptionBottleAlt className="nav-icon" style={{ fontSize: "28px", color: "green" }} />
                        <p>Place Order</p>
                    </div>
                </div>
            </div>

            <div className="actions-cards-customer-container">

                {DashBoardData.map((card, index) => (
                        <div key={index} className="action-card-customer">
                            <h3>{card.title}</h3>

                        <p className="total-count-dashboard-customer">
                            <span>{card.value}</span>
                            {card.value < 3 ? (
                                <i className="fa-solid fa-arrow-trend-down" style={{ color: "orangered" }}></i>
                            ) :
                            (
                                    <i className="fa-solid fa-arrow-trend-up" style={{ color: "mediumblue" }}></i>
                            )}
                        </p>

                            <div className="go-to-container-customer">
                            <button className="view-button-customer" onClick={card.method}>  
                                    View <i className="fa-solid fa-arrow-right-long"></i>
                                </button>
                            </div>
                        </div>
                ))}

                <div className="action-card-customer last-card-customer">
                    <h3>Generate Report</h3>
                    <p>Create Dynamic Reports</p>
                    <div className="go-to-container-customer">
                        <button className="view-button-customer" onClick={() => navigate("/Customer/ReportsPage")}>
                            View <i className="fa-solid fa-arrow-right-long"></i>
                        </button>
                    </div>

                </div>
                
            </div>

            <Loader isLoading={loading} />
        </div>
    );
}
export default Dashboard;