/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePageTitle } from "../../SharedComponents/SetPageTitle";
import { getData, postData } from "../../SharedComponents/apiService";
import "../PharmacistCSS_for_Components/PharmPrescriptionOrder.css";
import Loader from "../../SharedComponents/Loader";
import ToastSuccess from "../../SharedComponents/ToastSuccessModal"


const PharmacistOrdersPage = () => {

    const { setPageTitle } = usePageTitle();


    useEffect(() => {
        setPageTitle('Orders');
        // You can also set document.title for browser tab
        document.title = 'Health Hive';
    }, [setPageTitle]);

    const [selectedCustomer, setSelectedCustomer] = useState("");
    const [searchCustomer, setSearchCustomer] = useState("");
    const [searchDoctor, setSearchDoctor] = useState("");
    const [searchDate, setSearchDate] = useState("");
    const [expandedPrescriptions, setExpandedPrescriptions] = useState([]);
    const [selectedMedsPerPresc, setSelectedMedsPerPresc] = useState({});
    const [selectedCustOrderID, setselectedCustOrderID] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [orderToReject, setOrderToReject] = useState(null);
    const [showOrderHistory, setShowOrderHistory] = useState(false);
    const [historyStatusFilter, setHistoryStatusFilter] = useState("Processed");
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [orderToConfirm, setOrderToConfirm] = useState(null);
    const [selectedOrderReject, setselectedOrderReject] = useState(null);
    const [cutomerModal, setcutomerModal] = useState(false);
    const [rejectOrder, setrejectOrder] = useState([]);  
    const [orderHistory, setOrderHistory] = useState([]);
    const [pendingOrder, setPendingOrder] = useState([]);
    const [loading, setLoading] = useState(false);
    const [toast, settoast] = useState({ visible: false, message: "", type: "", duration: 3000 });
    const [selectedCustomerID, setselectedCustomerID] = useState(null);

    const vatRate = pendingOrder[0]?.medicationDetails[0]?.vat;
    const itemsPerPage = 3;


    async function fetchPendingOrders() {
        try {
            setLoading(true)

            const result = await getData('/api/Orders/get-PendingOrders');
            setPendingOrder(Array.isArray(result) ? result : [result]);
            console.log("Fetched Pending orders: ", result);

            //Here im clearing the states of selected orders
            setSelectedMedsPerPresc({});
            setselectedCustOrderID({});
            setselectedCustomerID({});

        } catch (error) {
            console.error("Error fetching customers:", error);
            console.log("Couldn’t Fetch Pending orders");
        } finally {
            setLoading(false)

        }
    }

    useEffect(() => {

        fetchPendingOrders();

    }, []); 

    const filteredPrescriptions = pendingOrder.filter(order => {
        const matchesCustomer =
            order.customerName.toLowerCase().includes(searchCustomer.toLowerCase()) ||
            order.idNumber?.toLowerCase().includes(searchCustomer.toLowerCase()) ||
            !searchCustomer; // include if search empty

        const matchesDate =
            !searchDate ||
            order.date.split("T")[0] === searchDate; // match yyyy-mm-dd exactly

        return matchesCustomer && matchesDate;
    });


    const openHistory = async () => {
        if (!showOrderHistory) {
            try {
                setLoading(true)

                const result = await getData('/api/Orders/get-processedORrejecctOrders');
                setOrderHistory(Array.isArray(result) ? result : [result]);
                console.log("Fetched order history: ", result);
            } catch (error) {
                console.log("Couldn't fetch order history: ", error);
            } finally {
                setLoading(false)

            }
        }

        // toggle between true and false
        setShowOrderHistory(prev => !prev);
    };


   


    const togglePrescription = (prescNum) => {
        setExpandedPrescriptions((prev) => {
            // If the clicked one is already open, collapse it
            if (prev.includes(prescNum)) {
                return [];
            } else {
                // When opening a new one, clear selections and only keep this one open
                setSelectedMedsPerPresc({});
                setselectedCustOrderID({});
                setselectedCustomerID({});
                return [prescNum];
            }
        });
    };


    const toggleSelection = (prescNum, medId, orderMedId,custID) => {
        setSelectedMedsPerPresc((prev) => {
            const currentMeds = prev[prescNum] || [];
            return {
                ...prev,
                [prescNum]: currentMeds.includes(medId)
                    ? currentMeds.filter((id) => id !== medId)
                    : [...currentMeds, medId],
            };
        });

        setselectedCustOrderID(prev => {
            const currentOrders = prev[prescNum] || [];
            return {
                ...prev,
                [prescNum]: currentOrders.includes(orderMedId)
                    ? currentOrders.filter(id => id !== orderMedId)
                    : [...currentOrders, orderMedId]
            };
        });

        setselectedCustomerID(prev => {
            const updated = { ...prev, [prescNum]: custID };
           // console.log("✅ Updated selectedCustomerID (inside set):", updated);
            return updated;
      
        });


    };

    //const filteredPrescriptions = pendingOrder
    //    .filter((c) => !selectedCustomer || c.customerOrderID === parseInt(selectedCustomer))
    //    .flatMap((c) =>
    //        c.medicationDetails
    //            .filter(
    //                (p) =>
    //                    c.customerName.toLowerCase().includes(searchCustomer.toLowerCase()) 
    //                    //p.date.includes(searchDate)
    //            )
    //            .map((p) => ({ ...p, customer: c.name }))
    //);


    const totalPages = Math.ceil(pendingOrder.length / itemsPerPage);

    const prescriptionsToShow = filteredPrescriptions.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const calcTotal = (prescription) => {
        const selectedIds = selectedMedsPerPresc[prescription.customerOrderID] || [];
        return prescription?.medicationDetails
            ?.filter((med) => selectedIds.includes(med.prescribedMedID))
            .reduce((sum, med) => sum + med.price * med.quantity, 0);
    };

    const navigate = useNavigate();

    function handleProcess(prescription) {
        // Mark order as confirmed in history
        setOrderToConfirm(prescription);
        setShowConfirmModal(true);
    }

    function showCustomers() {
        setcutomerModal(true);
    }

        
    const confirmProcess = async () => {

        // Prepare array of objects ... For each prescribedMedID, I grab the corresponding orderMedicationID from the same prescription using the index
        const medicationsToSend = Object.keys(selectedMedsPerPresc).flatMap(prescNum =>
            selectedMedsPerPresc[prescNum].map((prescId, idx) => ({
                PrescribedMedicationID: prescId,
                OrderedMedicationID: selectedCustOrderID[prescNum][idx] // match by index
            }))
        );
        setLoading(true);

        const userID = Object.values(selectedCustomerID)[0];

        const payload = {
            userID: userID,
            medications: medicationsToSend
        };

        try {
            const result = await postData("/api/Orders/processCustomer-order", payload);
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


        } catch (error) {
            console.error("Error processing order:", error);
        }

        setShowConfirmModal(false);

        setTimeout(() => {
            setLoading(false);
        }, 3000);

        fetchPendingOrders();


        setOrderToConfirm(null);
    };


    // Reject button click - open modal for reason
    const handleRejectClick = (prescription) => {

        //alert("Pressed chuu");

        setOrderToReject(prescription);
        setselectedOrderReject(prescription);
        setRejectReason("");
        setShowRejectModal(true);
    };


    // Confirm reject with reason
    const confirmReject = async () => {


        //if (!rejectReason.trim()) {
        //    alert("Please provide a reason for rejection.");
        //    return;
        //}


        var reason = rejectReason;
        var orderID = selectedOrderReject.orderMedicationID;




        try {
            const result = await postData("/api/Orders/reject-order", { CustomerOrderID: orderID, Reason: reason}  );
            console.log("Order rejected: ", result);
        }
        catch (error) {
            console.log("Couldnt reject order ", error);
        }

        fetchPendingOrders();
        setShowRejectModal(false);
        setOrderToReject(null);
    };


    // Filter order history by status
    const filteredOrderHistory = orderHistory.filter(order => {
        const matchesCustomer =
            order.customerName.toLowerCase().includes(searchCustomer.toLowerCase()) ||
            order.idNumber?.toLowerCase().includes(searchCustomer.toLowerCase()) ||
            !searchCustomer;

        const matchesDate =
            !searchDate ||
            order.date.split("T")[0] === searchDate;

        const matchesStatus = order.status === historyStatusFilter; // keep your status filter

        return matchesCustomer && matchesDate && matchesStatus;
    });


    return (
        <div className="orders-page">
            {toast.visible && (
                <ToastSuccess type={toast.type} message={toast.message} duration={toast.duration} />
            )}
            <div className="top-controls" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "1em 5em 0em 5em" }}>
                
                <input
                    type="text"
                    placeholder="Search Customer Name / ID"
                    value={searchCustomer}
                    onChange={(e) => setSearchCustomer(e.target.value)}
                />
                
                <input type="date" value={searchDate} onChange={(e) => setSearchDate(e.target.value)} />

                {/*<button onClick={openHistory}>*/}
                {/*    {showOrderHistory ? "Back to Orders" : "Order History"}*/}
                {/*</button>*/}
            </div>


            {showOrderHistory ? (
                <>
                    <div style={{ padding: "10px 0px 0px 6em" }}>
                        <label>
                            Filter by status:{" "}
                            <select
                                value={historyStatusFilter}
                                onChange={(e) => setHistoryStatusFilter(e.target.value)}
                            >
                                <option value="Processed">Processed</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                        </label>
                    </div>

                    {orderHistory.length === 0 && <p>No orders found.</p>}


                    {filteredOrderHistory.map((order) => (
                            <div key={order.customerOrderID} className="prescription-card">

                                <div className="prescription-header">
                                    <span>Order #: {order.customerOrderID}</span>
                                    <span>{order.date.split("T")[0]}</span>
                                    <span>Customer: {order.customerName}</span>
                                    <span>ID Number: {order.idNumber}</span>
                                    <span>Status: {order.status.toUpperCase()}</span>
                                </div>

                                <button onClick={() => togglePrescription(order.customerOrderID)}>
                                    {expandedPrescriptions.includes(order.customerOrderID)
                                        ? "Collapse"
                                        : "Expand"}
                                </button>

                                {expandedPrescriptions.includes(order.customerOrderID) && (
                                    <div className="expanded-section">
                                        <div className="table-header">
                                            <span>Medicine</span>
                                            <span>Dosage Form</span>
                                            <span>Instructions</span>
                                            <span>Repeats Left </span>
                                            <span>Price</span>
                                        </div>

                                        {order.medicationDetails.map((med) => (
                                            <div key={med.id} className="table-row">
                                                <span>{med.medName}</span>
                                                <span>{med.dosageForm}</span>
                                                <span>{med.instructions}</span>
                                                <span>{med.repeatsLeft}</span>
                                                <span>R{med.price}</span>
                                            </div>
                                        ))}

                                        {order.status === "Processed" && (
                                            <div className="totals">
                                                <div>
                                                    Total: R
                                                    {order.total ??
                                                        order.medicationDetails.reduce(
                                                            (sum, m) => sum + m.price,
                                                            0
                                                        )}
                                                </div>
                                                <div>
                                                    VAT (15%): R
                                                    {(
                                                        (order.total ??
                                                            order.medicationDetails.reduce(
                                                                (sum, m) => sum + m.price,
                                                                0
                                                            )) * vatRate
                                                    ).toFixed(2)}
                                                </div>
                                                <div>
                                                    Date Confirmed:{" "}
                                                    {order.dateConfirmed
                                                        ? new Date(order.dateConfirmed).toLocaleString()
                                                        : "N/A"}
                                                </div>
                                            </div>
                                        )}

                                        {/* REJECTED INFO */}
                                        {order.status === "Rejected" && (
                                            <div style={{ color: "red" }}>
                                                <strong>Reject Reason:</strong>{" "}
                                                {order.rejectReason ?? "N/A"}
                                                <br />
                                                <em>
                                                    Date Rejected:{" "}
                                                    {order.dateRejected
                                                        ? new Date(order.dateRejected).toLocaleString()
                                                        : "N/A"}
                                                </em>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                </>
            ) : (
                <>
                    <div className="prescriptions-table">                       

                            {filteredPrescriptions.length === 0 && <p>No orders found.</p>}

                            {filteredPrescriptions.map((prescription) => (
                                <div key={prescription.customerOrderID} className="prescription-card">
                                <div className="prescription-header">
                                    <span>Order# {prescription.customerOrderID}</span>
                                    <span>{prescription.date.split("T")[0]}</span>
                                    <span>Customer: {prescription.customerName}</span>
                                    <span>ID Number: {prescription.idNumber}</span>
                                   
                                    
                                </div>

                                    <button onClick={() => togglePrescription(prescription.customerOrderID)} className="process-btn">
                                        {expandedPrescriptions.includes(prescription.customerOrderID) ? "Collapse" : "Expand"}
                                </button>

                                   

                                    {expandedPrescriptions.includes(prescription.customerOrderID) && (
                                        <div className="meds-list">

                                            <table className="med-table">
                                                <thead>
                                                    <tr>
                                                        <th>Select</th>
                                                        <th>Medication</th>
                                                        <th>Dosage Form</th>
                                                        <th>Available Quantity</th>
                                                        <th>Order Quantity</th>
                                                        <th>Price</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {prescription.medicationDetails?.map((med) => {
                                                        const isChecked =
                                                            selectedMedsPerPresc[prescription.customerOrderID]?.includes(
                                                                med.prescribedMedID
                                                            ) || false;

                                                        // Split and trim medication ingredients
                                                        const medIngredients = med.medicationIngredients
                                                            ? med.medicationIngredients.split(",").map(i => i.trim().toLowerCase())
                                                            : [];

                                                        // Split and trim customer allergies
                                                        const customerAllergies = prescription.customerAllergies
                                                            ? prescription.customerAllergies.split(",").map(a => a.trim().toLowerCase())
                                                            : [];

                                                        // Check for allergy matches
                                                        const allergyMatches = medIngredients.filter(ingredient =>
                                                            customerAllergies.includes(ingredient)
                                                        );

                                                        const isAllergic = allergyMatches.length > 0;
                                                        const isLowStock = med.currentQuantity < med.quantity;

                                                        return (
                                                            <tr
                                                                key={med.prescribedMedID}
                                                                onClick={() => {
                                                                    if (isAllergic) {
                                                                       // alert(`⚠️ Patient allergic to ${med.medName}`);
                                                                        handleRejectClick(med);
                                                                    }

                                                                    if (!isLowStock) {
                                                                        toggleSelection(
                                                                            prescription.customerOrderID,
                                                                            med.prescribedMedID,
                                                                            med.orderMedicationID,
                                                                            prescription.userID
                                                                        );
                                                                    }
                                                                }}
                                                                className={`clickable-row 
                                                                    ${isChecked ? "selected-row" : ""} 
                                                                    ${isLowStock ? "low-stock" : ""} 
                                                                    ${isAllergic ? "allergic-row" : ""}`}
                                                                title={
                                                                    isAllergic
                                                                        ? "Patient is allergic, please click to reject medication"
                                                                        : isLowStock
                                                                            ? "Low on quantity, can't dispense medication"
                                                                            : ""
                                                                }
                                                            >
                                                                <td>
                                                                    {isAllergic ? (
                                                                        <span
                                                                            className="reject-icon"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation(); // prevent triggering row click
                                                                                handleRejectClick(med);

                                                                            }}
                                                                        >
                                                                            ❌
                                                                        </span>
                                                                    ) : (
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={isChecked}
                                                                            disabled={isLowStock}
                                                                            onChange={() =>
                                                                                toggleSelection(
                                                                                    prescription.customerOrderID,
                                                                                    med.prescribedMedID,
                                                                                    med.orderMedicationID,
                                                                                    prescription.userID
                                                                                )
                                                                            }
                                                                            onClick={(e) => e.stopPropagation()} // prevent triggering row click
                                                                        />
                                                                    )}
                                                                </td>
                                                                <td>{med.medName}</td>
                                                                <td>{med.dosageForm}</td>
                                                                <td>{med.currentQuantity}</td>
                                                                <td>{med.quantity}</td>
                                                                <td>R{med.price * med.quantity}</td>
                                                            </tr>

                                                        );
                                                    })}
                                                </tbody>

                                            </table>
                                            


                                            <div className="totals">
                                                {console.log("Quantity check: ", prescription) }
                                                <div>Total: R{(calcTotal(prescription) + vatRate/100*calcTotal(prescription) ).toFixed(2)}</div>
                                                <div>VAT ({vatRate}%): R{ vatRate/100 * (calcTotal(prescription) ).toFixed(2)}</div>
                                            </div>


                                            <button
                                                onClick={() => handleProcess(prescription)}
                                                disabled={
                                                    !selectedMedsPerPresc[prescription.customerOrderID] ||
                                                    selectedMedsPerPresc[prescription.customerOrderID].length === 0
                                                }
                                                className={
                                                    !selectedMedsPerPresc[prescription.customerOrderID] ||
                                                        selectedMedsPerPresc[prescription.customerOrderID].length === 0
                                                        ? "disabled-btn"
                                                        : "processOrdBtn"
                                                }
                                            >
                                                Process Order
                                            </button>
                                    </div>
                                )}
                            </div>
                        ))}

                        <div className="pagination">
                            <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
                                Prev
                            </button>
                            <span>
                                Page {currentPage} of {totalPages}
                            </span>
                            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
                                Next
                            </button>
                        </div>
                    </div>
                </>
            )}

            {cutomerModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Select Customer{orderToReject?.number}</h2>
                        <input type="text" placeholder="Search By Name or Id" />

                        <table>
                            <thead>
                                <tr>
                                   <th>Name</th>
                                   <th>Surname</th>
                                   <th>ID Number</th>
                                </tr>
                            </thead>
                           
                            <tbody>
                                <tr>
                                    <td>Chuku</td>
                                    <td>Chuku</td>
                                    <td>Chuku</td>
                                </tr>
                            </tbody>
                           

                        </table>

                        <button onClick={()=>setcutomerModal(false) }>Cancel</button>
                    </div>
                </div>
            ) }

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Reject </h2>       {/* Check and dont hard code the */}
                        {/*<textarea*/}
                        {/*    rows="4"*/}
                        {/*    placeholder="Enter reject reason"*/}
                        {/*    value={rejectReason}*/}
                        {/*    onChange={(e) => setRejectReason(e.target.value)}*/}
                        {/*/>*/}

                        <p>Please reject medication because patient is allergic to it</p>

                        <div style={{ marginTop: 10 }}>
                            <button onClick={confirmReject}>Confirm Reject</button>
                            <button onClick={() => setShowRejectModal(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm Process Modal */}
            {showConfirmModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        {console.log("Selected order num : ",pendingOrder) }
                        <h2>Confirm Processing</h2>
                        <p>Are you sure you want to process the Order ?</p>
                        <div className="totals">
                            <div>
                                Total: R{(calcTotal(orderToConfirm) * (1 + vatRate / 100)).toFixed(2)}
                            </div>
                            <div>VAT ({(vatRate ).toFixed(2)}%): R{vatRate/100 *(calcTotal(orderToConfirm) ).toFixed(2)}</div>

                        </div>
                        <div style={{ marginTop: 10 }}>
                            <button onClick={confirmProcess} className="btn-done">Yes, Process</button>
                            <button onClick={() => setShowConfirmModal(false)} className="btn-cancel">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            <Loader isLoading={loading} />

        </div>
    );

};

export default PharmacistOrdersPage;
