import React, { useState, useEffect } from 'react';
import Modal from '../Components/ModalComponent';
import Order from "../CSS_for_components/MedicationOrderStyle.module.css";
import { usePageTitle } from "../../SharedComponents/SetPageTitle";
import DynamicTable from '../../SharedComponents/DynamicTable';
import { useSearchParams } from 'react-router-dom';
import { getData, postData } from '../../SharedComponents/apiService';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Loader from "../../SharedComponents/Loader";
import ToastSuccess from "../../SharedComponents/ToastSuccessModal";


const MedicationOrders = () => {
    const [orders, setOrders] = useState([]);
    const { setPageTitle } = usePageTitle();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [supplierFilter, setSupplierFilter] = useState('All');
    const [dateSort, setDateSort] = useState('latest');
    const [showDateRange, setShowDateRange] = useState(false);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(false)
    const [toast, setToast] = useState({ visible: false, message: "", type: "", duration: 3000 });



    useEffect(() => {
        setPageTitle('History');
        document.title = 'History | Pharmacy';
    }, [setPageTitle]);

    useEffect(() => {
        if (searchParams.get('filter') === 'pending') {
            setStatusFilter('Pending');
        }
    }, [searchParams]);

    useEffect(() => {
        const medName = searchParams.get('medName')
        if (medName) {
            setSearchTerm(medName);
            setStatusFilter('Pending');
        }
    }, [searchParams]);

    const FetchOrderDetails = async () => {
        setLoading(true)
        try {
            const result = await getData("/manager/orders/GetOrders");
            if (Array.isArray(result)) {
                setOrders(result)
            } else {
                console.warn("result is not an array")
            }
        } catch (err) {
            console.error("fetch Error ", err)
        } finally {
            setLoading(false)
        }
    }
    useEffect(() => {
        FetchOrderDetails()
    }, []);

    const handleDateSortChange = (value) => {
        setDateSort(value);
        if (value !== 'custom') {
            setShowDateRange(false);
            setStartDate(null);
            setEndDate(null);
        } else {
            setShowDateRange(true);
        }
    };

    const suppliers = [...new Set(orders.map(order => order.supplierName).filter(Boolean))].sort((a, b) =>
        a.localeCompare(b)
    );
    const statusOptions = [
        { value: 'All', label: 'All Orders' },
        { value: 'Pending', label: "Pending Orders" },
        { value: 'Received', label: "Received Orders" }
    ];
    const dateSortOptions = [
        { value: 'latest', label: 'Latest First' },
        { value: 'earliest', label: 'Earliest First' },
        { value: 'custom', label: 'Custom Range' }
    ];

    const filteredOrders = orders.filter(order => {
        const searchTermLower = searchTerm.toLowerCase();
        const orderDate = new Date(order.orderDate);

        const matchesSearch =
            order.stockOrderID.toString().toLowerCase().includes(searchTermLower) ||
            (order.supplierName || '').toLowerCase().includes(searchTermLower) ||
            order.items.some(item =>
                (item.medicationName || '').toLowerCase().includes(searchTermLower)
            );

        const matchesStatus =
            statusFilter === 'All' ||
            (order.status && order.status.toString().toLowerCase() === statusFilter.toString().toLowerCase());

        const matchesSupplier =
            supplierFilter === 'All' || order.supplierName === supplierFilter;

        let matchesDateRange = true;
        if (dateSort === 'custom') {
            if (startDate) {
              
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                matchesDateRange = matchesDateRange && orderDate >= start;
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                matchesDateRange = matchesDateRange && orderDate <= end;
            }
        }

        return matchesSearch && matchesStatus && matchesSupplier && matchesDateRange;
    });

    const sortedOrders = [...filteredOrders].sort((a, b) => {
        const dateA = new Date(a.orderDate);
        const dateB = new Date(b.orderDate);
        return dateSort === 'latest' || dateSort === 'custom' ? dateB - dateA : dateA - dateB;
    });

    const showModal = (order) => {
        setSelectedOrder(order);
        setIsModalVisible(true);
    };

    const closeModal = () => {
        setIsModalVisible(false);
        setSelectedOrder(null);
    };

    const markAsReceived = async (orderId) => {
        // optimistic UI update — compare against stockOrderID (previous code compared `order.id`)
        setOrders(prev => prev.map(order =>
            order.stockOrderID === orderId ? { ...order, status: 'Received' } : order
        ));
        const result = await postData('/manager/orders/ApproveOrder', orderId)
        if (result.success) {
            setToast({
                visible: true,
                message: result.message,
                type: "success",
                duration: 3000
            });
            await FetchOrderDetails()
        } else {
            setToast({
                visible: true,
                message: result.message || "An error occurred",
                type: "error",
                duration: 3000
            });
            // revert optimistic update on failure
            await FetchOrderDetails();
        }

        closeModal();
    };

    const resetDateFilters = () => {
        setStartDate(null);
        setEndDate(null);
    };

    const generateOrderPDF = (order) => {
        if (!order) return;
        const currentDate = new Date().toLocaleDateString();

        const doc = new jsPDF();

        // Company Header
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text('PHARMACY MANAGEMENT SYSTEM', 105, 20, { align: 'center' });

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text('123 Health Street, Medical District | Tel: +27 123 456 789', 105, 26, { align: 'center' });
        doc.text('Email: pharmacy@healthhive.com | https://pharmacy.example.com', 105, 31, { align: 'center' });

        doc.setDrawColor(0);
        doc.setLineWidth(0.5);
        doc.line(20, 34, 190, 34); // divider

        // Order Info Section
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text('Medication Order Details', 20, 44);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`Order Number: ${order.stockOrderID}`, 20, 52);
        doc.text(`Supplier: ${order.supplierName}`, 20, 58);
        doc.text(`Date: ${order.orderDate.split('T')[0]}`, 20, 64);
        doc.text(`Status: ${order.status}`, 20, 70);

        // Items Table
        const tableData = order.items.map(item => [
            item.medicationName,
            item.quantityOrdered
        ]);

        autoTable(doc, {
            head: [['Medication', 'Quantity']],
            body: tableData,
            startY: 80,
            theme: 'grid',
            headStyles: {
                fillColor: [22, 160, 133], // teal
                textColor: 255,
                halign: 'center',
                fontStyle: 'bold'
            },
            bodyStyles: {
                fontSize: 10
            },
            columnStyles: {
                0: { cellWidth: 120 },
                1: { halign: 'right', cellWidth: 40 }
            },
            alternateRowStyles: { fillColor: [245, 245, 245] }
        });

        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(100);
            doc.text(`Pharmacy Manager Report - Page ${i} of ${pageCount}`, 105, 285, { align: 'center' });
            doc.text(`Generated on ${currentDate}`, 105, 290, { align: 'center' });
        }

        // Open PDF in new tab
        const pdfBlob = doc.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        window.open(pdfUrl, '_blank');
    };


    const tableData = sortedOrders.map(order => ({
        'Order id': order.stockOrderID,
        'Order Number': order.stockOrderID,
        'Supplier': order.supplierName,
        'Date': order.orderDate.split('T')[0],
        'Status': order.status,
        'Items': (() => {
            const meds = order.items.map(i => i.medicationName);
            return meds.length > 2
                ? meds.slice(0, 2).join(', ') + ', ...'
                : meds.join(', ');
        })()
    }));

    return (
        <div className={Order["medication-orders"]}>
            {toast.visible && (
                <ToastSuccess type={toast.type} message={toast.message} duration={toast.duration} />
            )}
            <div className={Order["filters-container"]}>
                <div className={Order["search-filter"]}>
                    <input
                        type="text"
                        placeholder="Search by Order No. , Supplier & Items"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={Order["search-input"]}
                        style={{ width: "20rem" }}
                    />
                </div>
                <Loader isLoading={loading} />

                <div className={Order["dropdown-filters"]}>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className={Order["filter-select"]}
                    >
                        {statusOptions.map((status, index) => (
                            <option key={index} value={status.value}>{status.label}</option>
                        ))}
                    </select>

                    <select
                        value={supplierFilter}
                        onChange={(e) => setSupplierFilter(e.target.value)}
                        className={Order["filter-select"]}
                    >
                        <option value="All">All Suppliers</option>
                        {suppliers.map((supplier, index) => (
                            <option key={index} value={supplier}>{supplier}</option>
                        ))}
                    </select>

                    <select
                        value={dateSort}
                        onChange={(e) => handleDateSortChange(e.target.value)}
                        className={Order["filter-select"]}
                    >
                        {dateSortOptions.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className={`${Order["date-range-filter"]} ${showDateRange ? Order["visible"] : Order["hidden"]}`}>
                <div className={Order["date-range-content"]}>
                    <div className={Order["date-picker-group"]}>
                        <label>From:</label>
                        <DatePicker
                            selected={startDate}
                            onChange={date => setStartDate(date)}
                            selectsStart
                            startDate={startDate}
                            endDate={endDate}
                            className={Order["date-picker"]}
                            placeholderText="Start date"
                        />
                    </div>

                    <div className={Order["date-picker-group"]}>
                        <label>To:</label>
                        <DatePicker
                            selected={endDate}
                            onChange={date => setEndDate(date)}
                            selectsEnd
                            startDate={startDate}
                            endDate={endDate}
                            minDate={startDate}
                            className={Order["date-picker"]}
                            placeholderText="End date"
                        />
                    </div>

                    <button
                        onClick={resetDateFilters}
                        className={Order["reset-date-btn"]}
                    >
                        Reset Dates
                    </button>
                </div>
            </div>

            <DynamicTable
                data={tableData}
                actions={[
                    {
                        label: 'View Details',
                        className: Order["text-button"],
                        onClick: (row) => {
                            const selectedOrder = orders.find(o => o.stockOrderID === row['Order Number']);
                            showModal(selectedOrder);
                        }
                    }
                ]}
                statusToHighlight="Pending"
            />

            {/* Order Details Modal */}
            <Modal
                title="Order Details"
                isOpen={isModalVisible}
                onClose={closeModal}
                footer={
                    <>
                        <button type="button" className={Order["close-btn"]} onClick={closeModal}>
                            Cancel
                        </button>
                        {selectedOrder?.status !== 'Received' && (
                            <button
                                className={Order["save-btn"]}
                                onClick={() => markAsReceived(selectedOrder?.stockOrderID)}
                            >
                                Mark as Received
                            </button>
                        )}
                    </>
                }
            >
                {selectedOrder && (
                    <div>
                        <p><strong>Order Number:</strong> {selectedOrder.stockOrderID}</p>
                        <p><strong>Supplier:</strong> {selectedOrder.supplierName}</p>
                        <p><strong>Date:</strong> {selectedOrder.orderDate.split('T')[0]}</p>
                        <p><strong>Status:</strong>
                            <span className={Order["status-tag"] + " " + Order[selectedOrder.status.toLowerCase()]}>
                                {selectedOrder.status}
                            </span>
                        </p>

                        <h4>Order Items:</h4>
                        <ul className={Order["order-items"]}>
                            {selectedOrder.items.map((item, index) => (
                                <li key={index}>
                                    {item.medicationName} - {item.quantityOrdered} units
                                </li>
                            ))}
                        </ul>

                        <button onClick={() => generateOrderPDF(selectedOrder)} className={Order["generate-pdf-btn"]}>
                            Download PDF
                        </button>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default MedicationOrders;