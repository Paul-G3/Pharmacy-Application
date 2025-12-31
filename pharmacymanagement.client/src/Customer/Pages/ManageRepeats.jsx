import "../CustomerCss/ManageRepeats.css"
import React, { useState, useEffect, useRef } from "react"
import Loader from "../../SharedComponents/Loader";
import OrderpreviewModal from "../Components/OrderpreviewModal";
import CustomerButton from '../Components/CustomerButton';
import CustomerSearchInput from "../Components/CustomerSearchInput";
import SuccessModal from "../../SharedComponents/SuccessModal";
import { useNavigate } from 'react-router-dom';
import GeneralModal from "../../SharedComponents/GeneralModal";
import { usePageTitle } from "../../SharedComponents/SetPageTitle";

function ManageRepeats() {
    const basePath = process.env.NODE_ENV === 'production' ? '/GRP-04-11' : '';
    const token = localStorage.getItem("jwtToken");

    const checkboxRefs = useRef({});

    //state variables
    const [searchText, setSearchText] = useState("");
    const [dateFilter, setDateFilter] = useState("");

    const [totalVat, setVat] = useState(0);
    const [totalCost, setTotalCost] = useState(0);
    const [prescriptionData, setPrescriptionData] = useState([]);
    const [filteredPrescriptionData, setFilteredPrescriptionData] = useState([]);
    const [Medications, setMedications] = useState([]);
    const [MedicationDb, setMedicationDb] = useState([]);
    const [loading, setLoading] = useState(false);
    const [IsModalOpen, setIsModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1); //state variable for pagination
    const [rowsPerPage, setRowsPerPage] = useState(calculateRowsPerPage());
    const [IsOpen, setIsOpen] = useState(false);
    const [IsOpenHistory, setIsOpenHistory] = useState(false);
    const [HistoryRepeat, setHistoryRepeat] = useState(null);
    const [RepeatsCount, setRepeatsCount] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const closeModal = () => setShowModal(false);
    const [MedHistory, setMedHistory] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
    const navigate = useNavigate();
    const { setPageTitle } = usePageTitle();
    // Filter data based on search text and date
    useEffect(() => {
        setPageTitle('Place Order');
        let filteredData = prescriptionData;

        // Filter by search text (prescription name or doctor)
        if (searchText) {
            filteredData = filteredData.filter(item =>
                item.prescriptionName.toLowerCase().includes(searchText.toLowerCase()) ||
                item.doctor.toLowerCase().includes(searchText.toLowerCase())
            );
        }

        // Filter by date
        if (dateFilter) {
            filteredData = filteredData.filter(item => {
                const itemDate = new Date(item.date).toISOString().split('T')[0];
                return itemDate === dateFilter;
            });
        }

        setFilteredPrescriptionData(filteredData);
        setCurrentPage(1); // Reset to first page when filters change
    }, [prescriptionData, searchText, dateFilter]);

    // Sort data when sortConfig changes
    useEffect(() => {
        if (sortConfig.key) {
            const sortedData = [...filteredPrescriptionData].sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
            setFilteredPrescriptionData(sortedData);
        }
    }, [sortConfig]);

    // Request sort function
    const requestSort = (key, direction) => {
        setSortConfig({ key, direction });
    };

    // Calculate total cost based on medications and quantities
    const calculateTotalCost = (medications) => {
        return medications.reduce((total, med) => {
            return total + (med.price * med.quantity);
        }, 0);
    };

    // Update total cost whenever Medications change
    useEffect(() => {
        const newTotalCost = calculateTotalCost(Medications);
        setTotalCost(newTotalCost);
        setVat(newTotalCost * 0.15);
    }, [Medications]);

    //pagination normal variables
    const totalPages = Math.ceil(filteredPrescriptionData.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const currentData = filteredPrescriptionData.slice(startIndex, startIndex + rowsPerPage);

    function calculateRowsPerPage() {
        const screenHeight = window.innerHeight;
        let rowsPerPage;

        if (screenHeight > 1200) rowsPerPage = 11;
        else if (screenHeight >= 992 && screenHeight <= 1200) rowsPerPage = 9;
        else if (screenHeight >= 768 && screenHeight < 992) rowsPerPage = 7;
        else if (screenHeight >= 600 && screenHeight < 768) rowsPerPage = 5;
        else rowsPerPage = 3;

        return rowsPerPage;
    }

    function GoToOrder() {
        navigate("/Customer/CustomerOrdersPage");
    }

    const GetMedicationHistoryRepeat = (id, medication, repeats) => {
        setMedHistory(medication);
        setShowModal(true);
        setRepeatsCount({
            totalLeft: repeats[0],
            total: repeats[3]
        })

        fetch(`${basePath}/api/Customer/get-medication-repeat-history?id=${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Failed to fetch allergies");
                }
                return response.json();
            })
            .then(data => {
                if (!Array.isArray(data)) {
                    console.error("Expected an array from server, got:", data);
                    return;
                }

                // Helper for ordinal suffix (1st, 2nd, 3rd, etc.)
                const getOrdinal = (n) => {
                    const suffixes = ["th", "st", "nd", "rd"];
                    const value = n % 100;
                    return suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0];
                };

                // Map the data and include date + time
                const formattedData = data.map((item, index) => {
                    const repeatNumber = index + 1;
                    const suffix = getOrdinal(repeatNumber);

                    const dateObj = new Date(item.Date);

                    // Format: YYYY-MM-DD HH:MM:SS
                    const formattedDate = `${dateObj.getFullYear()}-${(dateObj.getMonth() + 1)
                        .toString()
                        .padStart(2, "0")}-${dateObj.getDate().toString().padStart(2, "0")} ${dateObj.getHours()
                            .toString()
                            .padStart(2, "0")}:${dateObj.getMinutes().toString().padStart(2, "0")}:${dateObj
                                .getSeconds()
                                .toString()
                                .padStart(2, "0")}`;

                    // Add separate date and time fields
                    const onlyDate = `${dateObj.getFullYear()}-${(dateObj.getMonth() + 1)
                        .toString()
                        .padStart(2, "0")}-${dateObj.getDate().toString().padStart(2, "0")}`;

                    const onlyTime = `${dateObj.getHours().toString().padStart(2, "0")}:${dateObj
                        .getMinutes()
                        .toString()
                        .padStart(2, "0")}:${dateObj.getSeconds().toString().padStart(2, "0")}`;

                    return {
                        count: `${repeatNumber}${suffix} Repeat`,
                        date: onlyDate,
                        time: onlyTime.substring(0, 5),
                        fullDateTime: formattedDate
                    };
                });

                setHistoryRepeat(formattedData);
            })
            .catch(error => {
                console.error("Error fetching allergies:", error);
                setLoading(false);
            });
    }

    function CLicked(e) {
        const icon = e.currentTarget.querySelector(".icon i");
        if (icon) {
            icon.classList.toggle("translate-icon");
        }

        const medication = e.currentTarget.nextElementSibling;
        medication.classList.toggle("open");
    }

    // Delete handler inside the modal
    const RemoveMedication = (med) => {
        setMedications(prev => {
            return prev.map(m => {
                if (m.PrescribedMedicationID === med.PrescribedMedicationID) {
                    const newTotalSelected = m.totalSelected - 1;
                    const newQuantity = m.quantity - med.dosage;

                    if (newTotalSelected <= 0) {
                        // Remove completely
                        return null;
                    }
                    return { ...m, totalSelected: newTotalSelected, quantity: newQuantity };
                }
                return m;
            }).filter(Boolean); // remove nulls
        });

        setMedicationDb(prev => prev.filter(m => m.PrescribedMedicationID !== med.PrescribedMedicationID || med.totalSelected > 1));

        const checkbox = checkboxRefs.current[med.PrescribedMedicationID];
        if (checkbox) {
            checkbox.checked = false;
        }
    };

    function SelectedMedication(price, e, med) {
        if (e.currentTarget.checked) {
            // When checked — add medication with quantity
            const medicationWithQuantity = {
                ...med,
                quantity: med.dosage // Use dosage as the quantity
            };

            setMedicationDb(prev => [...prev, medicationWithQuantity]);

            setMedications(prev => {
                const existingMed = prev.find(m => m.PrescribedMedicationID === med.PrescribedMedicationID);

                if (existingMed) {
                    return prev.map(m =>
                        m.PrescribedMedicationID === med.PrescribedMedicationID
                            ? {
                                ...m,
                                quantity: m.quantity + med.dosage,
                                totalSelected: (m.totalSelected || 0) + 1
                            }
                            : m
                    );
                } else {
                    return [...prev, {
                        ...med,
                        quantity: med.dosage,
                        totalSelected: 1
                    }];
                }
            });
        } else {
            // When unchecked — remove medication or decrement quantity
            setMedications(prev =>
                prev
                    .map(m =>
                        m.PrescribedMedicationID === med.PrescribedMedicationID
                            ? {
                                ...m,
                                quantity: m.quantity - med.dosage,
                                totalSelected: m.totalSelected - 1
                            }
                            : m
                    )
                    // remove only if both are zero or less
                    .filter(m => m.quantity > 0 && m.totalSelected > 0)
            );

            setMedicationDb(prev =>
                prev
                    .map(m =>
                        m.PrescribedMedicationID === med.PrescribedMedicationID
                            ? {
                                ...m,
                                quantity: m.quantity - med.dosage,
                                totalSelected: m.totalSelected - 1
                            }
                            : m
                    )
                    .filter(m => m.quantity > 0 && m.totalSelected > 0)
            );
        }
    }

    const Placeorder = () => {
        // Log the medication data before sending to API
        console.log("=== Medication Data Being Sent to API ===");
        console.log("MedicationDb:", MedicationDb);
        console.log("Total Cost:", totalCost);
        console.log("Total VAT:", totalVat);

        MedicationDb.forEach(med => {
            console.log(`Med: ${med.name}, Price: R${med.price}, Quantity: ${med.quantity}, Total: R${(med.price * med.quantity).toFixed(2)}`);
        });
        console.log("=========================================");

        setLoading(true);
        fetch(`${basePath}/api/Customer/place-order`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                medications: MedicationDb,
                totalCost: totalCost,
                totalVat: totalVat
            }),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Failed to place order");
                }
                return response.json();
            })
            .then(data => {
                setLoading(false);
                setIsModalOpen(false);
                setIsOpen(true);
            })
            .catch(error => {
                console.error("Error placing order:", error);
                setLoading(false);
            });
    }

    const Testing = () => {
        setIsModalOpen(true);
    }

    const openPdf = (prescriptionBlob) => {
        const byteCharacters = atob(prescriptionBlob); // decode Base64
        const byteNumbers = new Array(byteCharacters.length).fill().map((_, i) => byteCharacters.charCodeAt(i));
        const byteArray = new Uint8Array(byteNumbers);

        const blob = new Blob([byteArray], { type: "application/pdf" });
        const blobUrl = URL.createObjectURL(blob);

        // Open PDF in same tab
        window.open(blobUrl, "_blank");
    }

    const GetRepeats = () => {
        setLoading(true);
        fetch(`${basePath}/api/Customer/customer-medication`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(response => response.json())
            .then(rows => {
                const groupedData = rows.reduce((acc, row) => {
                    const key = `${row.PrescriptionID}_${row.Date}_${row.Doctor}`;

                    if (!acc[key]) {
                        acc[key] = {
                            prescription: row.Prescription,
                            prescriptionName: row.Name,
                            date: row.Date,
                            doctor: row.Doctor,
                            medications: []
                        };
                    }

                    acc[key].medications.push({
                        PrescribedMedicationID: row.PrescribedMedicationID,
                        name: row.MedName,
                        dosage: row.Quantity,
                        usage: row.Instructions,
                        repeat: `${row.RepeatsLeft} /${row.NumberOfRepeats}`,
                        price: row.Price ?? 0
                    });

                    return acc;
                }, {});

                const groupedArray = Object.values(groupedData);
                setPrescriptionData(groupedArray);
                setFilteredPrescriptionData(groupedArray);
                setLoading(false);
            })
            .catch(error => {
                console.error("Fetch error:", error);
                setLoading(false);
            });
    }

    const CloseModal = () => {
        setIsModalOpen(false);
    }

    useEffect(() => {
        GetRepeats();
        function handleResize() {
            setRowsPerPage(calculateRowsPerPage());
            setCurrentPage(1); // reset to first page on resize
        }

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div className="manage-repeats">
            <div className="inputs">
                <input
                    type="text"
                    placeholder="Search by prescription or doctor..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                />
                <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                />
            </div>
            <div>
                {currentData && currentData.length > 0 ? (
                    <>
                        <div className="repeats-haeder">
                            <p>
                                <span>Prescription Name</span>
                                <span className="filter-container-customer">
                                    <i
                                        className="fa-solid fa-sort-up"
                                        id="top-filter"
                                        onClick={() => requestSort("prescriptionName", "ascending")}
                                    ></i>
                                    <i
                                        className="fa-solid fa-sort-down"
                                        onClick={() => requestSort("prescriptionName", "descending")}
                                    ></i>
                                </span>
                            </p>

                            <p>
                                <span>Date</span>
                                <span className="filter-container-customer">
                                    <i
                                        className="fa-solid fa-sort-up"
                                        id="top-filter"
                                        onClick={() => requestSort("date", "ascending")}
                                    ></i>
                                    <i
                                        className="fa-solid fa-sort-down"
                                        onClick={() => requestSort("date", "descending")}
                                    ></i>
                                </span>
                            </p>

                            <p>
                                <span>Doctor</span>
                                <span className="filter-container-customer">
                                    <i
                                        className="fa-solid fa-sort-up"
                                        id="top-filter"
                                        onClick={() => requestSort("doctor", "ascending")}
                                    ></i>
                                    <i
                                        className="fa-solid fa-sort-down"
                                        onClick={() => requestSort("doctor", "descending")}
                                    ></i>
                                </span>
                            </p>

                            <p></p>
                        </div>

                        {currentData.map((item, index) => (
                            <div key={index}>
                                <div className="box" onClick={CLicked} title="Click to Expand">
                                    <div>
                                        <span className="icon"><i className="fa-solid fa-right-long"></i></span>
                                        <span className="prescription">{item.prescriptionName}</span>
                                    </div>
                                    <p>{new Date(item.date).toLocaleDateString()}</p>
                                    <p className="doctor">
                                        <i className="fa-solid fa-user-doctor"></i>
                                        {item.doctor}
                                    </p>
                                    <CustomerButton text="ViewFile" onClick={() => openPdf(item.prescription)} />
                                </div>

                                <div className="medication-items">
                                    <div className="medication-heading">
                                        <span>Medication</span>
                                        <span>Quantity</span>
                                        <span>Instruction</span>
                                        <span>Repeats</span>
                                        <span>Price</span>
                                        <span></span>
                                    </div>
                                    {item.medications.map((med, index) => (
                                        <div className="div" key={index}>
                                            <input type="hidden" value={med.PrescribedMedicationID} />
                                            <div className="label-medication">
                                                <input
                                                    type="checkbox"
                                                    className="medication-repeat-checkBox-customer"
                                                    onClick={(e) => SelectedMedication(med.price, e, med)}
                                                    ref={el => checkboxRefs.current[med.PrescribedMedicationID] = el}
                                                />
                                                <span>{med.name}</span>
                                            </div>
                                            <span>{med.dosage}</span>
                                            <span>{med.usage}</span>
                                            <span>{med.repeat}</span>
                                            <div className="price-div">
                                                <span>R</span>
                                                <span>{parseFloat(med.price).toFixed(2)}</span>
                                            </div>
                                            <span>
                                                <CustomerButton text="History" onClick={() => GetMedicationHistoryRepeat(med.PrescribedMedicationID, med.name, med.repeat)}>History</CustomerButton>
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        <div className="total">
                            <p className="total-price">Total: R{totalCost.toFixed(2)}</p>
                            <p className="total-vat">Vat: R{totalVat.toFixed(2)}</p>
                            <CustomerButton text="PlaceOrder" onClick={Testing} />
                        </div>

                        <div className="pagination-controls-customer" style={{ width: "80%" }}>
                            {/* Prev button */}
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                            >
                                &lt; Prev
                            </button>

                            {/* Page numbers */}
                            {(() => {
                                let start = Math.max(1, currentPage - 2);
                                let end = Math.min(totalPages, start + 4);

                                // Shift window if we're at the last pages
                                if (end - start < 4) {
                                    start = Math.max(1, end - 4);
                                }

                                let pages = [];
                                for (let i = start; i <= end; i++) {
                                    pages.push(
                                        <button
                                            key={i}
                                            className={currentPage === i ? "active" : ""}
                                            onClick={() => setCurrentPage(i)}
                                        >
                                            {i}
                                        </button>
                                    );
                                }
                                return pages;
                            })()}

                            {/* Next button */}
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                            >
                                Next &gt;
                            </button>
                        </div>
                    </>
                ) : (
                    <p className="customer-no-data-found">No processed prescriptions found</p>
                )}
            </div>

            {IsModalOpen && (
                <OrderpreviewModal onClose={CloseModal}>
                    <div className="order-preview-container">
                        {Medications.map(medication => (
                            <div className="order-preview-items" key={medication.PrescribedMedicationID}>
                                <p>{medication.name}</p>
                                <p>R{medication.price.toFixed(2)}</p>
                                <p>{medication.quantity}</p>
                                <p>x{medication.totalSelected}</p>
                                <p>
                                    <button className="delete-prescription" onClick={() => RemoveMedication(medication)}>
                                        <i className="fa-solid fa-trash"></i>
                                    </button>
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="total-amount-preview">
                        Total : R{totalCost.toFixed(2)}
                    </div>

                    <div className="place-order-preview-container">
                        <CustomerButton text="Order" onClick={Placeorder} />
                    </div>
                </OrderpreviewModal>
            )}

            {showModal && (
                <GeneralModal title="Medication Repeat History" onClose={closeModal}>
                    <p className="history-med-customer"> For : {MedHistory}</p>

                    <div style={{ paddingLeft: "1.5rem" }}>
                        <div className="order-preview-items repeats-history-headers">
                            <span>Repeats</span>
                            <span>Date</span>
                            <span>Time</span>
                        </div>

                        {Array.isArray(HistoryRepeat) && HistoryRepeat.length > 0 ? (
                            HistoryRepeat.map((history) => (
                                <div className="order-preview-items" key={history.count}>
                                    <p>{history.count}</p>
                                    <p>{history.date}</p>
                                    <p>
                                        {history.time} {parseInt(history.time.substring(0, 2)) < 12 ? 'AM' : 'PM'}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <p>No repeat history found.</p>
                        )}
                    </div>

                    <br></br>
                    <div className="repeat-history-bottom">Total Repeats: {RepeatsCount.total}</div>
                    <div className="repeat-history-bottom">Total Repeats Left: {RepeatsCount.totalLeft}</div>

                    <div style={{ textAlign: "center", marginTop: "0.7rem" }}>
                        <CustomerButton text="Ok" onClick={closeModal} />
                    </div>
                </GeneralModal>
            )}

            <Loader isLoading={loading} />

            {IsOpen && (
                <SuccessModal captionText="Order Has been Placed Succefully!">
                    <div style={{ textAlign: "center" }}>
                        <button className="ok-modal-button" onClick={GoToOrder}>Ok</button>
                    </div>
                </SuccessModal>
            )}
        </div>
    );
}

export default ManageRepeats;