import { useState, useEffect } from "react";
import { usePageTitle } from "../../SharedComponents/SetPageTitle";
import { getData, postData } from "../../SharedComponents/apiService";
import Select from 'react-select';
import "../PharmacistCSS_for_Components/DispenseMedicationPage.css";
import DispensePrescription from "../Components/DispensePrescription";
import MedicationTable from "../Components/MedicationCard";
import Loader from "../../SharedComponents/Loader";

function DispenseMedicationPage() {
    const { setPageTitle } = usePageTitle();

    useEffect(() => {
        setPageTitle('Walk - In');
        document.title = 'Health Hive';
    }, [setPageTitle]);

    const [currentPage, setCurrentPage] = useState(1);
    const cardsPerPage = 8;
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [selectedPrescription, setSelectedPrescription] = useState(null);
    const [selectedMedications, setSelectedMedications] = useState([]);
    const [selectedCustomerIndex, setSelectedCustomerIndex] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [expandedSections, setExpandedSections] = useState({});
    const [loading, setLoading] = useState(false);

    // Fetch prescriptions when a customer is selected
    // Fetch prescriptions for a selected customer
    async function fetchMedications(customerID) {
        if (!customerID) return;
        try {
            setLoading(true);

            const result = await postData('/api/Dispense/get-ProcessedPrescriptions', {
                CustomerID: customerID,
            });

            setSelectedPrescription(Array.isArray(result) ? result : [result]);
            console.log("Fetched Prescriptions: ", result);
        } catch (error) {
            console.log("Could not fetch Prescriptions: ", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (!selectedCustomer?.userID) return;
        fetchMedications(selectedCustomer.userID);
    }, [selectedCustomer]);


    // Fetch all customers for dropdown
    async function fetchCustomers() {
        try {
            setLoading(true);
            const result = await getData('/api/Dispense/get-CustomerDropDown');
            const customersArray = Array.isArray(result) ? result : [result];
            setCustomers(customersArray);
            console.log("Fetched customers: ", result);

            // ❌ Removed auto-selection of first customer
        } catch (error) {
            console.log("Could not fetch customers: ", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchCustomers();
    }, []);

    // Filter prescriptions based on search
    const filteredPrescriptions = selectedPrescription?.map(prescription => {
        const filteredMeds = prescription.medicationDetails?.filter(med =>
            med.medName?.toLowerCase().includes(searchTerm)
        ) || [];

        return {
            ...prescription,
            medicationDetails: filteredMeds
        };
    }).filter(prescription => prescription.medicationDetails.length > 0) || [];

    // Toggle a section
    const toggleSection = (sectionId) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    const expandAll = () => {
        const allExpanded = {};
        selectedPrescription?.forEach((prescription, index) => {
            const sectionId = prescription.prescriptionID || prescription.doctorName || index;
            allExpanded[sectionId] = true;
        });
        setExpandedSections(allExpanded);
    };

    const collapseAll = () => setExpandedSections({});

    const handleCustomerChange = (selectedOption) => {
        const customerIndex = selectedOption.value;
        const customer = customers[customerIndex];
        setSelectedCustomerIndex(customerIndex);
        setSelectedCustomer(customer);
        setCurrentPage(1);
        setExpandedSections({});
    };

    const meds = selectedPrescription?.flatMap(prescription => prescription.medicationDetails || []) || [];
    const totalPages = Math.ceil(meds.length / cardsPerPage);
    const renderPaginationButtons = () => {
        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    className={`pagination-button ${currentPage === i ? 'active' : ''}`}
                >
                    {i}
                </button>
            );
        }
        return pages;
    };

    return (
        <div>
            <Loader isLoading={loading} />

            <div className="customerDetails">
                <Select
                    className="customerDetailSelect"
                    id="customer"
                    options={customers.map((customer, index) => ({
                        value: index,
                        label: `${customer.name} ${customer.surname} (ID: ${customer.idNumber})`,
                        userID: customer.userID
                    }))}
                    value={
                        selectedCustomer
                            ? {
                                value: selectedCustomerIndex,
                                label: `${selectedCustomer.name} ${selectedCustomer.surname} (ID: ${selectedCustomer.idNumber})`,
                                userID: selectedCustomer.userID
                            }
                            : null
                    }
                    onChange={handleCustomerChange}
                    placeholder="Please select a customer..."
                    isSearchable={true}
                />

                <input
                    type="hidden"
                    value={selectedCustomer?.userID || ""}
                />

                <input
                    type="text"
                    id="medicationSearch"
                    placeholder="Search By Medication Name"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
                    disabled={!selectedCustomer} // 👈 disable search until customer selected
                />

                <div id="alert" className="warning"></div>
            </div>

            <div className="dispenseContainer">
                <div className="classCardContainer">
                    {/* Expand / Collapse buttons */}
                    {selectedPrescription && selectedPrescription.length > 1 && (
                        <div style={{ marginBottom: '16px', display: 'flex', gap: '8px' }}>
                            <button onClick={expandAll} className="btn btn-outline-primary btn-sm">Expand All</button>
                            <button onClick={collapseAll} className="btn btn-outline-secondary btn-sm">Collapse All</button>
                        </div>
                    )}

                    {/* Summary section */}
                    {selectedPrescription && selectedPrescription.length > 0 && (
                        <div style={{
                            backgroundColor: '#e3f2fd',
                            padding: '12px 16px',
                            borderRadius: '6px',
                            marginBottom: '16px',
                            border: '3px solid #2196f3',
                            fontSize: '14px'
                        }}>
                            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                                <span><strong>{selectedPrescription.length}</strong> prescription(s)</span>
                                <span>
                                    <strong>
                                        {selectedPrescription.reduce((total, rx) => total + (rx.medicationDetails?.length || 0), 0)}
                                    </strong> total medications
                                </span>
                                <span>
                                    Last prescription: {new Date(
                                        Math.max(...selectedPrescription.map(rx => new Date(rx.prescriptionDate)))
                                    ).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Prescription sections */}
                    {filteredPrescriptions && filteredPrescriptions.map((prescription, index) => {
                        const sectionId = prescription.prescriptionID || prescription.doctorName || `prescription-${index}`;
                        const isExpanded = expandedSections[sectionId];
                        const medicationCount = prescription.medicationDetails?.length || 0;

                        return (
                            <div key={sectionId} className="prescription-section" style={{ marginBottom: '16px' }}>
                                <div
                                    className="section-header"
                                    onClick={() => toggleSection(sectionId)}
                                    style={{
                                        cursor: 'pointer',
                                        padding: '16px',
                                        backgroundColor: isExpanded ? '#e3f2fd' : '#7ec8e3',
                                        border: `2px solid ${isExpanded ? '#2196f3' : '#dee2e6'}`,
                                        borderRadius: '8px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        transition: 'all 0.3s ease',
                                        boxShadow: isExpanded ? '0 2px 8px rgba(33, 150, 243, 0.1)' : 'none'
                                    }}
                                >
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                            <h4 style={{
                                                margin: 0,
                                                fontSize: '16px',
                                                fontWeight: '600',
                                                color: isExpanded ? '#1976d2' : '#2c3e50'
                                            }}>
                                                Prescription by Dr. {prescription.doctorName}
                                            </h4>
                                            {medicationCount > 0 && (
                                                <span style={{
                                                    backgroundColor: isExpanded ? '#1976d2' : '#6c757d',
                                                    color: 'white',
                                                    padding: '2px 8px',
                                                    borderRadius: '12px',
                                                    fontSize: '12px',
                                                    fontWeight: '600'
                                                }}>
                                                    {medicationCount} med{medicationCount !== 1 ? 's' : ''}
                                                </span>
                                            )}
                                        </div>

                                        <div style={{
                                            display: 'flex',
                                            gap: '16px',
                                            fontSize: '14px',
                                            color: isExpanded ? '#1976d2' : 'black',
                                            flexWrap: 'wrap'
                                        }}>
                                            <span>Date: {new Date(prescription.prescriptionDate).toLocaleDateString()}</span>
                                            <span>Doctor: Dr. {prescription.doctorName}</span>
                                            {prescription.prescriptionID && (
                                                <span>Prescription: {prescription.prescriptionID}</span>
                                            )}
                                        </div>
                                    </div>

                                    <span style={{
                                        fontSize: '20px',
                                        fontWeight: 'bold',
                                        color: isExpanded ? '#1976d2' : '#6c757d',
                                        transition: 'transform 0.3s ease',
                                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                        minWidth: '24px',
                                        textAlign: 'center'
                                    }}>
                                        ▼
                                    </span>
                                </div>

                                {/* Collapsible content */}
                                <div
                                    style={{
                                        maxHeight: isExpanded ? '1000px' : '0',
                                        overflow: 'hidden',
                                        transition: 'max-height 0.4s ease-in-out, opacity 0.3s ease',
                                        opacity: isExpanded ? 1 : 0,
                                        marginTop: isExpanded ? '12px' : '0'
                                    }}
                                >
                                    {isExpanded && prescription.medicationDetails && (
                                        <div style={{
                                            border: '1px solid #e0e0e0',
                                            borderRadius: '6px',
                                            overflow: 'hidden'
                                        }}>
                                            <MedicationTable
                                                medications={prescription.medicationDetails}
                                                prescribedBy={prescription.doctorName}
                                                date={prescription.prescriptionDate}
                                                onMedicationSelect={(updatedList) => setSelectedMedications(updatedList)}
                                                selectedMedications={selectedMedications}
                                                customerAllergy={selectedCustomer}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {/* No search results */}
                    {searchTerm && filteredPrescriptions.length === 0 && (
                        <div style={{
                            textAlign: 'center',
                            padding: '20px',
                            color: '#6c757d'
                        }}>
                            No medications found matching "{searchTerm}"
                        </div>
                    )}

                    {/* No customer selected message */}
                    {!selectedCustomer && (
                        <div style={{
                            textAlign: 'center',
                            padding: '40px 20px',
                            color: '#6c757d',
                            backgroundColor: '#f8f9fa',
                            borderRadius: '8px',
                            border: '2px dashed #dee2e6',
                            marginTop: '30px'
                        }}>
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>👤</div>
                            <h3 style={{ margin: '0 0 8px 0', color: '#495057' }}>No Customer Selected</h3>
                            <p style={{ margin: 0 }}>Please select a customer from the dropdown to view prescriptions.</p>
                        </div>
                    )}


                    {/* No prescriptions message */}
                    {selectedCustomer && (!selectedPrescription || selectedPrescription.length === 0) && (
                        <div style={{
                            textAlign: 'center',
                            padding: '40px 20px',
                            color: '#6c757d',
                            backgroundColor: '#f8f9fa',
                            borderRadius: '8px',
                            border: '2px dashed #dee2e6'
                        }}>
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>💊</div>
                            <h3 style={{ margin: '0 0 8px 0', color: '#495057' }}>No Prescriptions Found</h3>
                            <p style={{ margin: 0 }}>There are no prescriptions to display for this customer.</p>
                        </div>
                    )}

                    <div className="pagination-controls">{renderPaginationButtons()}</div>
                </div>

                <div className="dispense-Medication">
                    <DispensePrescription
                        selectedMedications={selectedMedications}
                        refresh={() => fetchMedications(selectedCustomer?.userID)} 
                        setSelectedMed={setSelectedMedications}
                        selectdedCustomerID={selectedCustomer?.userID}
                    />

                </div>
            </div>
        </div>
    );
}

export default DispenseMedicationPage;
