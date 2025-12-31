import GeneralModal from "../../SharedComponents/GeneralModal";
import React, { useState, useEffect } from "react";
import "../CustomerCss/CustomerOrdersPageStyle.css";
import CustomerButton from "../Components/CustomerButton";
import Loader from "../../SharedComponents/Loader";
import { useNavigate } from 'react-router-dom';
import { usePageTitle } from "../../SharedComponents/SetPageTitle";

function CustomerOrdersPage() {
    const basePath = process.env.NODE_ENV === "production" ? "/GRP-04-11" : "";
    const token = localStorage.getItem("jwtToken");

    const [customerOrders, SetCustomerOrders] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [OrderDetails, setOrderDetails] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(calculateRowsPerPage());
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    // NEW STATE FOR FILTERS & SORTING
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
    const { setPageTitle } = usePageTitle();

    function GoToOrdersHistory() {
        navigate("/Customer/OrdersHistory");
    }
    function calculateRowsPerPage() {
        const screenHeight = window.innerHeight;
        if (screenHeight > 1200) return 13;
        else if (screenHeight >= 992) return 11;
        else if (screenHeight >= 768) return 9;
        else if (screenHeight >= 600) return 7;
        else return 3;
    }

    // ?? FETCH ORDERS
    const GetCustomerOrders = () => {
        setLoading(true);
        fetch(`${basePath}/api/Customer/get-customer-orders`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        })
            .then((response) => {
                if (!response.ok) throw new Error("Failed to fetch orders");
                return response.json();
            })
            .then((data) => {
                const groupedData = data.reduce((acc, row) => {
                    const key = `${row.CustomerOrderID}_${row.OrderDate}_${row.Status}`;
                    if (!acc[key]) {
                        acc[key] = {
                            OrderNumber: row.CustomerOrderID,
                            date: row.OrderDate,
                            status: row.Status,
                            totalAmount: row.TotalAmount,
                            details: [],
                        };
                    }

                    acc[key].details.push({
                        name: row.MedName,
                        dosage: row.Quantity,
                        price: row.ItemPrice ?? 0,
                    });
                    return acc;
                }, {});
                SetCustomerOrders(Object.values(groupedData));
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    useEffect(() => {
        setPageTitle('Orders');
        GetCustomerOrders();

        function handleResize() {
            setRowsPerPage(calculateRowsPerPage());
            setCurrentPage(1);
        }

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // ?? FILTER + ?? DATE FILTER
    const filteredOrders = customerOrders.filter((order) => {
        const matchesSearch =
            order.OrderNumber.toString().toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDate = selectedDate
            ? new Date(order.date).toISOString().split("T")[0] === selectedDate
            : true;
        return matchesSearch && matchesDate;
    });

    // ???? SORTING LOGIC
    const sortedOrders = React.useMemo(() => {
        let sortable = [...filteredOrders];
        if (sortConfig.key) {
            sortable.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                // convert to lowercase if text
                if (typeof aValue === "string") aValue = aValue.toLowerCase();
                if (typeof bValue === "string") bValue = bValue.toLowerCase();

                if (aValue < bValue) return sortConfig.direction === "ascending" ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === "ascending" ? 1 : -1;
                return 0;
            });
        }
        return sortable;
    }, [filteredOrders, sortConfig]);

    // ?? PAGINATION
    const totalPages = Math.ceil(sortedOrders.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const currentData = sortedOrders.slice(startIndex, startIndex + rowsPerPage);

    const requestSort = (key, direction) => {
        setSortConfig({ key, direction });
    };

    const openModal = () => setShowModal(true);
    const closeModal = () => setShowModal(false);

    const ViewOrderDetails = (order) => {
        setOrderDetails(order.details);
        openModal(true);
    };

    return (
        <div className="customer-orders-page">
            {showModal && (
                <GeneralModal title="Order Details" onClose={closeModal}>
                    <div className="customer-order-item header-details">
                        <div>Medication</div>
                        <div>Quantity</div>
                        <div>Price</div>
                    </div>
                    <ol className="order-details-container">
                        {OrderDetails.map((item, index) => (
                            <li className="customer-order-item" key={index}>
                                <div>{item.name}</div>
                                <div>x{item.dosage}</div>
                                <div>R{item.price.toFixed(2)}</div>
                            </li>
                        ))}
                    </ol>

                    <p className="total-number-items">
                        <b>Total number of items : </b>
                        {OrderDetails.length}
                    </p>

                    <div className="register-ok-btn">
                        <CustomerButton text="Ok" onClick={closeModal} />
                    </div>
                </GeneralModal>
            )}

            <div className="history-order-customer">
                <CustomerButton text="Order History" onClick={GoToOrdersHistory} />
            </div>

            <div className="filter-inputs">
                <input
                    type="text"
                    placeholder="Search by Order Number"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                />
            </div>

            <table>
                <thead>
                    <tr>
                        <td>
                            <span>Order Number</span>
                            <span className="filter-container-customer">
                                <i
                                    className="fa-solid fa-sort-up"
                                    id="top-filter"
                                    onClick={() => requestSort("OrderNumber", "ascending")}
                                ></i>
                                <i
                                    className="fa-solid fa-sort-down"
                                    onClick={() => requestSort("OrderNumber", "descending")}
                                ></i>
                            </span>
                        </td>

                        <td>
                            <span>Order Date</span>
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
                        </td>

                        <td>
                            <span>Order Status</span>
                            <span className="filter-container-customer">
                                <i
                                    className="fa-solid fa-sort-up"
                                    id="top-filter"
                                    onClick={() => requestSort("status", "ascending")}
                                ></i>
                                <i
                                    className="fa-solid fa-sort-down"
                                    onClick={() => requestSort("status", "descending")}
                                ></i>
                            </span>
                        </td>

                        <td>
                            <span>Order Amount</span>
                            <span className="filter-container-customer">
                                <i
                                    className="fa-solid fa-sort-up"
                                    id="top-filter"
                                    onClick={() => requestSort("totalAmount", "ascending")}
                                ></i>
                                <i
                                    className="fa-solid fa-sort-down"
                                    onClick={() => requestSort("totalAmount", "descending")}
                                ></i>
                            </span>
                        </td>

                        <td></td>
                    </tr>
                </thead>

                <tbody>
                    {currentData.map((order, index) => (
                        <tr key={index}>
                            <td>#{order.OrderNumber}</td>
                            <td>{new Date(order.date).toLocaleDateString()}</td>
                            <td>
                                <span className={order.status}>{order.status}</span>
                            </td>
                            <td className="price-div">R{order.totalAmount.toFixed(2)}</td>
                            <td>
                                <button
                                    className="order-details-customer"
                                    onClick={() => ViewOrderDetails(order)}
                                >
                                    Order Details
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="pagination-controls-customer">
                <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                >
                    &lt; Prev
                </button>

                {Array.from(
                    { length: Math.min(5, totalPages) },
                    (_, i) => i + Math.max(1, currentPage - 2)
                )
                    .filter((i) => i <= totalPages)
                    .map((i) => (
                        <button
                            key={i}
                            className={currentPage === i ? "active" : ""}
                            onClick={() => setCurrentPage(i)}
                        >
                            {i}
                        </button>
                    ))}

                <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                >
                    Next &gt;
                </button>
            </div>

            <Loader isLoading={loading} />
        </div>
    );
}

export default CustomerOrdersPage;
