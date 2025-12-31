import {React, useEffect, useState} from 'react';
import '../PharmacistCSS_for_Components/PharmacistDashboard.css'; 
import { useNavigate } from 'react-router-dom';
import { usePageTitle } from '../../SharedComponents/SetPageTitle';
import { getData} from "../../SharedComponents/apiService";
import Loader from "../../SharedComponents/Loader";


function PharmacistDashboardPage() {

    const [pendingUploadCounts, setpendingUploadCounts] = useState([]);
    const [walkin, setWalkin] = useState([]);
    const [pending, setPending] = useState([]);
    const [processed, setProcessed] = useState([]);
    const [collected, setCollected] = useState([]);
    const [loading, setLoading] = useState(false);
  

    const { setPageTitle } = usePageTitle();

    useEffect(() => {
        setPageTitle('Dashboard');

        document.title = 'Health Hive';
    }, [setPageTitle]);

    useEffect(function fetchDashboard() {
        async function fetchDashboard() {
            try {
                setLoading(true)

                const result = await getData('/api/Dashboard/get-DashboardCounts');

                setpendingUploadCounts(result);
                console.log("Fetched counts: ", result);
            }
            catch (error) {
                console.log("Couldnt fetch counts: ", error);
            } finally {
                setLoading(false)
            }
        }

        fetchDashboard();


    }, []);


    useEffect(function walkin() {
        async function walkin() {
            try {
                setLoading(true)

                const result = await getData('/api/Dashboard/get-walkinCounts');

                setWalkin(result);
            }
            catch (error) {
                console.log("Couldnt fetch walkin: ", error);
            } finally {
                setLoading(false)
            }
        }

        walkin();


    }, []);

    useEffect(function pendingOrd() {
        async function pendingOrd() {
            try {
                setLoading(true)
                const result = await getData('/api/Dashboard/get-pendingOrderCounts');

                setPending(result);
            }
            catch (error) {
                console.log("Couldnt fetch penging: ", error);
            }
            finally {
                setLoading(false)
            }
        }

        pendingOrd();


    }, []);
    useEffect(function processedOrd() {
        async function processedOrd() {
            try {
                setLoading(true)
                const result = await getData('/api/Dashboard/get-processedOrderCounts');

                setProcessed(result);
            }
            catch (error) {
                console.log("Couldnt fetch walkin: ", error);
            } finally {
                setLoading(false)
            }
        }

        processedOrd();


    }, []);
    useEffect(function collectedOrd() {
        async function collectedOrd() {
            try {
                setLoading(true)

                const result = await getData('/api/Dashboard/get-collectedOrderCounts');

                setCollected(result);
            }
            catch (error) {
                console.log("Couldnt fetch collected: ", error);
            } finally {
                setLoading(false)

            }
        }

        collectedOrd();


    }, []);




    const navigate = useNavigate();

    function switchToUpload() {
        navigate("/Pharmacist/Prescription");
    }

    function switchToDispense() {
        navigate("/Pharmacist/DispenseMedication");
    }

    function switchToOrder() {
        navigate("/Pharmacist/PharmacistOrdersPage");
    }

    function switchToDispenseLog() {
        navigate("/Pharmacist/ProcessedScripts");
    }

    function switchToPendingDispense() {
        navigate("/Pharmacist/PrescriptionList");
    }

    function switchToReports() {
        navigate("/Pharmacist/PharmacistReports")
    }

    return (
        <div className="pharm_dashboard">
            {/* Main Content */}
            <main className="pharm_main-content">

                {/* Quick Actions */}
                <div className="quick-actions">
                    <h2>Quick Actions</h2>
                    <div className="action-grid">
                        <button onClick={() => switchToUpload()} className="action-btn">
                            <i className="fas fa-upload uploadColor"></i>
                            <span>Upload</span>
                        </button>
                        <button onClick={switchToDispense } className="action-btn">
                            <i className="fas fa-pills walkinColor"></i>
                            <span>Walk-In</span>
                        </button>
                        <button onClick={switchToOrder } className="action-btn">
                            <i className="fas fa-shopping-cart processColor"></i>
                            <span>Process Order</span>
                        </button>
                        <button onClick={switchToDispenseLog } className="action-btn">
                            <i className="fas fa-check-circle collectedColor"></i>
                            <span>Mark Collected</span>
                        </button>    

                    </div>
                </div>

                {/* Cards Grid */}
                <div className="cards-grid">
                    {/* Pending Upload Card */}
                    <div className="card">
                        <div className="card-header">
                            <h3>Unprocessed Scripts</h3>
                            <div className="card-icon upload-icon">
                                <i className="fas fa-upload"></i>
                            </div>
                        </div>
                        <div className="card-value">{pendingUploadCounts[0]?.PendingUpload }</div>
                        <p className="card-title">Prescriptions waiting to be processed</p>
                        <button onClick={switchToPendingDispense } className="card-btn">
                            <i className="fas fa-upload"></i> Process Now
                        </button>
                    </div>

                    {/* Pending Dispense Card */}
                    <div className="card">
                        <div className="card-header">
                            <h3>Pending Walk-In</h3>
                            <div className="card-icon pending-icon">
                                <i className="fas fa-clock"></i>
                            </div>
                        </div>
                        <div className="card-value">{walkin[0]?.PendingWalkInCustomers}</div>
                        <p className="card-title">Prescriptions ready for dispensing</p>
                        <button onClick={switchToDispense} className="card-btn">
                            <i className="fas fa-pills"></i> Dispense
                        </button>
                    </div>

                    {/* Today's Orders Card */}
                    <div className="card">
                        <div className="card-header">
                            <h3>Pending Orders</h3>
                            <div className="card-icon orders-icon">
                                <i className="fas fa-shopping-cart"></i>
                            </div>
                        </div>
                        <div className="card-value">{pending[0]?.PendingOrders}</div>
                        <p className="card-title">Customer orders to process</p>
                        <button onClick={switchToOrder} className="card-btn">
                            <i className="fas fa-shopping-cart"></i> Process Orders
                        </button>
                    </div>

                    {/* Dispensed Today Card */}
                    <div className="card">
                        <div className="card-header">
                            <h3>Order Collection</h3>
                            <div className="card-icon dispense-icon">
                                <i className="fas fa-pills"></i>
                            </div>
                        </div>
                        <div className="card-value">{processed[0]?.ProcessedOrders}</div>
                        <p className="card-title">Orders ready for collection</p>
                        <button onClick={switchToDispenseLog } className="card-btn">
                            <i className="fas fa-history"></i> View All
                        </button>
                    </div>

                    {/* Collected Today Card */}
                    {/*<div className="card">*/}
                    {/*    <div className="card-header">*/}
                    {/*        <h3>Collected Today</h3>*/}
                    {/*        <div className="card-icon collected-icon">*/}
                    {/*            <i className="fas fa-check-circle"></i>*/}
                    {/*        </div>*/}
                    {/*    </div>*/}
                    {/*    <div className="card-value">{collected[0]?.CollectedOrders}</div>*/}
                    {/*    <p className="card-title">Total Orders collected by patients</p>*/}
                    {/*</div>*/}

                    
                    {/* Upload Prescription Card */}
                    <div className="card ">
                        <div className="card-header">
                            <h3>New Prescription</h3>
                            <div className="card-icon">
                                <i className="fas fa-file-medical"></i>
                            </div>
                        </div>
                        <p className="card-title">Upload a new prescription for processing</p>
                        <button onClick={switchToReports}className="card-btn ">
                            <i className="fas fa-upload"></i> Upload Prescription
                        </button>
                    </div>

                    <div className="card primary-card">
                        <div className="card-header">
                            <h3>Generate Report</h3>
                            <div className="card-icon">
                                <i className="fas fa-file-medical"></i>
                            </div>
                        </div>
                        <p className="card-title">Generate new pharmacist report</p>
                        <button onClick={switchToReports}className="card-btn primary-btn">
                            <i className="fas fa-upload"></i> Generate Report
                        </button>
                    </div>
                </div>
                
            
            </main>

            <Loader isLoading={loading} />

        </div>
    );
};

export default PharmacistDashboardPage;