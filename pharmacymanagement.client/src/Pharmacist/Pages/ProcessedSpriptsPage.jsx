import React, { useState, useEffect } from 'react';
import '../PharmacistCSS_for_Components/ProcessedScripts.css';
import { usePageTitle } from "../../SharedComponents/SetPageTitle";
import { getData, postData } from "../../SharedComponents/apiService";
import Loader from "../../SharedComponents/Loader";
import ToastSuccess from "../../SharedComponents/ToastSuccessModal"


function ProcessedScriptsPage() {

    const [prescriptions, setPrescriptions] = useState([]);
    const [collected, setCollected] = useState([]);
    const [walkin, setWalkin] = useState([]);
    const [loading, setLoading] = useState(false);
    const [confirmCollect, setconfirmCollect] = useState(false);
    const [selectedPrescription, setSelectedPrescription] = useState(null);
    const [toast, settoast] = useState({ visible: false, message: "", type: "", duration: 3000 });


    async function fetchDispensedPrescriptions() {
        try {
            setLoading(true)

            const result = await getData('/api/DispenseLog/get-dispensedPrescriptions');
            const dispensedPrescrArray = Array.isArray(result) ? result : [result];

            setPrescriptions(dispensedPrescrArray);
        }
        catch (error) {
            console.log("Couldnt fetch dispensed prescriptions", error);
        } finally {
            setLoading(false)

        }
    }

    async function fetchCollectedScripts() {
        try {
            setLoading(true)

            const results = await getData('/api/DispenseLog/get-collectedPrescriptions');
            setCollected(Array.isArray(results) ? results : [results]);
        }
        catch (error) {
            console.log("Couldnt fetch collected scripts ", error)
        } finally {
            setLoading(false)
        }
    }

    async function fetchWalKinScripts() {
        try {
            setLoading(true)

            const results = await getData('/api/DispenseLog/get-walkInOrders');
            setWalkin(Array.isArray(results) ? results : [results]);
        }
        catch (error) {
            console.log("Couldnt fetch walkin scripts ", error)
        } finally {
            setLoading(false)

        }
    }

    useEffect(() => {        
        fetchCollectedScripts();
        fetchWalKinScripts();
        fetchDispensedPrescriptions();
    },[])

    const { setPageTitle } = usePageTitle();

    useEffect(() => {
        setPageTitle('Order Collection');
        // You can also set document.title for browser tab
        document.title = 'Health Hive';
    }, [setPageTitle]);

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPages, setCurrentPages] = useState({
        processed: 1,
        collected: 1,
        walkin:1
    });
    const [expandedSections, setExpandedSections] = useState({
        processed: false,
        collected: false,
        walkin: false
    });


    const collectPrescription = async () => {

        let PrescribedMedicationID = prescriptions[0].prescribedMedicationID?.split(",").map(id=> parseInt(id.trim()));//Here I convert the strings of IDs to ints of an array

        try {
            const result = await postData('/api/DispenseLog/collectPrescription', PrescribedMedicationID);
            console.log(result.success)
            if (result.success) {
                settoast({
                    visible: true,
                    message: result.message,
                    type: "success",
                    duration: 3000
                });
            } else {
                settoast({
                    visible: true,
                    message: result.message || "An error occurred",
                    type: "error",
                    duration: 3000
                });
            }
        }
        catch (error) {
            console.log("Coudnt collect prescription: ", error);
        } finally {
            setconfirmCollect(false);
        }

        fetchDispensedPrescriptions();
        fetchCollectedScripts();

    }



    const handleCollect = async() => {

        collectPrescription();
        fetchCollectedScripts();
        fetchDispensedPrescriptions();
    };


    const toggleSection = (section) => {
        setExpandedSections({
            ...expandedSections,
            [section]: !expandedSections[section]
        });
    };


    const source = [...(prescriptions || []), ...(collected || []), ...(walkin || []) ];

    const filteredPrescriptions = source?.filter(pres =>
        pres.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pres.prescriptionID?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );

    const processedPrescriptions = filteredPrescriptions.filter(p => p.status?.toLowerCase() === 'ready');
    const collectedPrescriptions = filteredPrescriptions.filter(p => p.status?.toLowerCase() === 'collected');
    const walkinPrescriptions = filteredPrescriptions.filter(p => p.status?.toLowerCase() === 'walk-in');


    const itemsPerPage = 4;

    const getPaginatedData = (data, section) => {
        const startIndex = (currentPages[section] - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return data.slice(startIndex, endIndex);
    };

    const handlePageChange = (section, pageNumber) => {
        setCurrentPages({
            ...currentPages,
            [section]: pageNumber
        });
    };

    const Pagination = ({ data, section }) => {
        const totalPages = Math.ceil(data.length / itemsPerPage);

        if (totalPages <= 1) return null;

        return (
            <div className="pagination">
                <button
                    onClick={() => handlePageChange(section, currentPages[section] - 1)}
                    disabled={currentPages[section] === 1}
                >
                    Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                        key={page}
                        onClick={() => handlePageChange(section, page)}
                        className={currentPages[section] === page ? 'active' : ''}
                    >
                        {page}
                    </button>
                ))}

                <button
                    onClick={() => handlePageChange(section, currentPages[section] + 1)}
                    disabled={currentPages[section] === totalPages}
                >
                    Next
                </button>
            </div>
        );
    };

    return (
        <div className="dispense-log">
            <Loader isLoading={loading} />
            {toast.visible && (
                <ToastSuccess type={toast.type} message={toast.message} duration={toast.duration} />
            )}

            <div className="search-container">
                <input
                    type="text"
                    placeholder="Search by customer name or order number"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>

            <div className="accordion-sections">
                {/* Processed Orders Section */}
                <div className="accordion-section">
                    <div
                        className="accordion-header"
                        onClick={() => toggleSection('processed')}
                    >
                        <h2>Ready For Collection ({processedPrescriptions.length})</h2>
                        <span className={`arrow ${expandedSections.processed ? 'up' : 'down'}`}>▼</span>
                    </div>
                    <div
                        className={`accordion-content ${expandedSections.processed ? 'expanded' : ''}`}
                        style={{
                            maxHeight: expandedSections.processed ? `${Math.min(processedPrescriptions.length, 6) * 150 + 400}px` : '0',
                            opacity: expandedSections.processed ? '1' : '0'
                        }}
                    >
                        {processedPrescriptions.length === 0 ? (
                            <p>No Orders to display</p>
                        ) : (
                            <>
                                <ul className="prescription-list">
                                        {getPaginatedData(processedPrescriptions, 'processed').map(prescription => (
                                        <li key={prescription.prescriptionID} className="prescription-cards">
                                            <div className="prescription-header">
                                                <h3>{prescription.customerName}</h3>
                                                <span className="prescription-number">Order: {prescription.prescriptionID}</span>
                                            </div>
                                            <div className="prescription-details">
                                                <p><strong>Doctor:</strong> {prescription.doctorFullName}</p>
                                                <p><strong>Processed:</strong> {prescription.dispensedDate.split("T")[0]}</p>
                                            </div>
                                            <div className="medication-list">
                                              <h4>Medications</h4>
                                                
                                                <section >
                                                    <p>{prescription.medicationList}</p>
                                                </section>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setSelectedPrescription({
                                                        prescriptionID: prescription.prescriptionID,
                                                        orderID: prescription.orderID, // if orderID exists in your object
                                                    });
                                                    setconfirmCollect(true);
                                                }}
                                                className="action-button collect-button"
                                            >
                                                Mark as collected
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                                    <Pagination data={processedPrescriptions} section="n" />


                                    {confirmCollect && (
                                        <div className="modal-overlay">
                                            <div className="modal-content">
                                                <h2>Confirm Order Collection</h2>

                                                <div className="content-afterhead">

                                                    <p>Mark Order: <strong>{selectedPrescription.prescriptionID}</strong> as collected</p>

                                                    <div className="Acustomer-btns">
                                                        <button
                                                        className="btn-done"
                                                            onClick={() => handleCollect(selectedPrescription.prescriptionID)}>
                                                            YES
                                                        </button>

                                                        <button
                                                        className="btn-cancel"
                                                            onClick={() => { setconfirmCollect(false) }}>
                                                            Cancel
                                                        </button>
                                                    </div>

                                                </div>
                                            </div>
                                        </div>
                                    )}
                            </>
                        )}
                    </div>
                </div>

                {/* Collected Orders Section */}
                <div className="accordion-section">
                    <div
                        className="accordion-header"
                        onClick={() => toggleSection('collected')}
                    >
                        <h2>Collected Orders ({collectedPrescriptions.length})</h2>
                        <span className={`arrow ${expandedSections.collected ? 'up' : 'down'}`}>▼</span>
                    </div>
                    <div
                        className={`accordion-content ${expandedSections.collected ? 'expanded' : ''}`}
                        style={{
                            maxHeight: expandedSections.collected ? `fit-content` : '0',
                            opacity: expandedSections.collected ? '1' : '0'
                        }}
                    >
                        {collectedPrescriptions.length === 0 ? (
                            <p>No Orders to display</p>
                        ) : (
                            <>
                                <ul className="prescription-list">
                                    {getPaginatedData(collectedPrescriptions, 'collected').map(prescription => (
                                        <li key={prescription.prescriptionID} className="prescription-cards">
                                            <div className="prescription-header">
                                                <h3>{prescription.customerName}</h3>
                                                <span className="prescription-number">Order: {prescription.prescriptionID}</span>
                                            </div>
                                            <div className="prescription-details">
                                                <p><strong>Doctor:</strong> {prescription.doctorFullName}</p>
                                                <p><strong>Processed:</strong> {prescription.dispensedDate.split("T")[0]}</p>
                                            {/*    <p><strong>Collected:</strong> {prescription.collectedDate}</p>*/}
                                            </div>
                                            <section >
                                                <p>{prescription.medicationList}</p>
                                            </section>
                                            <div className="status-badge">Collected</div>
                                        </li>
                                    ))}
                                </ul>
                                <Pagination data={collectedPrescriptions} section="collected" />
                            </>
                        )}
                    </div>
                </div>

                {/* Walkin Orders Section */}
                <div className="accordion-section">
                    <div
                        className="accordion-header"
                        onClick={() => toggleSection('walkin')}
                    >
                        <h2>Walkin Orders ({walkinPrescriptions.length})</h2>
                        <span className={`arrow ${expandedSections.walkin ? 'up' : 'down'}`}>▼</span>
                    </div>
                    <div
                        className={`accordion-content ${expandedSections.walkin ? 'expanded' : ''}`}
                        style={{
                            maxHeight: expandedSections.walkin ? `fit-content` : '0',
                            opacity: expandedSections.walkin ? '1' : '0'
                        }}
                    >
                        {walkinPrescriptions.length === 0 ? (
                            <p>No prescriptions to display</p>
                        ) : (
                            <>
                                    <ul className="prescription-list">
                                        {getPaginatedData(walkinPrescriptions, 'walkin').map(prescription => (
                                            <li key={prescription.prescriptionID} className="prescription-cards">
                                                <div className="prescription-header">
                                                    <h3>{prescription.customerName}</h3>
                                                    <span className="prescription-number">Order:{prescription.prescriptionID}</span>
                                                </div>
                                                <div className="prescription-details">
                                                    <p><strong>Doctor:</strong> {prescription.doctorFullName}</p>
                                                    <p><strong>Dispensed:</strong> {prescription.dispensedDate?.split("T")[0]}</p> 
                                                </div>
                                                <section>
                                                    <p>{prescription.medicationList}</p>
                                                </section>
                                                <div className="status-badge">Walk-in</div>
                                            </li>
                                        ))}
                                    </ul>

                                    <Pagination data={walkinPrescriptions} section="walkin" />
                            </>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}

export default ProcessedScriptsPage;