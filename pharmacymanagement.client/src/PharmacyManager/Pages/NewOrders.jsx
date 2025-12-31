import React, { useState, useEffect } from 'react';
import { usePageTitle } from "../../SharedComponents/SetPageTitle";
import { getData, postData } from '../../SharedComponents/apiService';
import styles from '../CSS_for_components/NewOrders.module.css';
import Modal from '../Components/ModalComponent';
import OrderForm from '../Components/OrderFormComponent';
import Loader from "../../SharedComponents/Loader";
import { useSearchParams,Link } from 'react-router-dom';
import ToastSuccess from "../../SharedComponents/ToastSuccessModal";




const NewOrders = () => {
    const { setPageTitle } = usePageTitle();
    const [orders, setOrders] = useState([]);
    const [selectedOrders, setSelectedOrders] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(false);
    const [isOrderModalVisible, setIsOrderModalVisible] = useState(false);
    const [preselectedMeds, setPreselectedMeds] = useState([]);
    const [invalidRows, setInvalidRows] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(8); 
    const [stockFilter, setStockFilter] = useState('all');
    const [toast, setToast] = useState({ visible: false, message: "", type: "", duration: 3000 });
    const [searchParams] = useSearchParams();

    useEffect(() => {
        if (searchParams.get('filter') === 'below') {
            setStockFilter('below');
        }
    }, [searchParams]);
    useEffect(() => {
        setPageTitle('New Orders');
        document.title = 'New Orders | Pharmacy';
    }, [setPageTitle]);

    const fetchMedication = async () => {
        try {
            setLoading(true)
            const result = await getData("/manager/medication/GetStockOrderDetails");
            if (Array.isArray(result)) {
                setOrders(
                    result
                        .map(m => ({
                            id: m.medicationID,
                            medName: m.medicationName,
                            currentStock: m.currentQuantity,
                            orderLevel: m.reOrderLevel,
                            OrderedStatus:m.orderedStatus,
                            quantity: 0,
                        }))
                        .sort((a, b) => {
                            const aLow = a.currentStock < a.orderLevel;
                            const bLow = b.currentStock < b.orderLevel;
                            if (aLow === bLow) {
                                return a.medName.localeCompare(b.medName);
                            }
                            return aLow ? -1 : 1;
                        })
                );
            } else {
                console.warn("Result is not an array");
            }
        } catch (err) {
            console.error("Fetch Error", err);
        } finally {
            setLoading(false)
        }
    };
   
    useEffect(() => {
        fetchMedication()

        function updateRowsPerPage() {
            if (window.innerWidth < 600) setRowsPerPage(4);
            else if (window.innerWidth < 900) setRowsPerPage(6);
            else setRowsPerPage(10);
        }
        updateRowsPerPage();
        window.addEventListener('resize', updateRowsPerPage);
        return () => window.removeEventListener('resize', updateRowsPerPage);
    }, []);
  
    const closeOrderModal = () => {
        setIsOrderModalVisible(false);
    };
    const showOrderModal = () => {
        setIsOrderModalVisible(true);
    };

    const handleQuantityChange = (orderId, value) => {
        setOrders(prev => prev.map(order =>
            order.id === orderId ? { ...order, quantity: value } : order
        ));
        setInvalidRows(prev => prev.filter(id => id !== orderId));
    };

    const handleCheckboxChange = (orderId) => {
        setSelectedOrders(prev =>
            prev.includes(orderId)
                ? prev.filter(id => id !== orderId)
                : [...prev, orderId]
        );
        setInvalidRows(prev => prev.filter(id => id !== orderId));
    };

    const handleSubmitOrder =async (newOrderData) => {
        setLoading(true)
        try {
            const result = await postData("/manager/medication/OrderMedication", newOrderData)
            if (result.success) {
                setToast({
                    visible: true,
                    message: result.message,
                    type: "success",
                    duration: 3000
                });
                await fetchMedication()
            } else {
                setToast({
                    visible: true,
                    message: result.message || "An error occurred",
                    type: "error",
                    duration: 3000
                });
            }
        } catch (err) {
            console.error('Failed to remove profile picture', err);
        } finally {
            setLoading(false)
        }
        
        closeOrderModal();
    };
    const handleShowOrderModal = () => {
        if (selectedOrders.length === 0) {
            setPreselectedMeds([]);
            showOrderModal();
            return;
        }

        const invalidSelected = orders.filter(
            order => selectedOrders.includes(order.id) && (!order.quantity || Number(order.quantity) < 1)
        ).map(order => order.id);

        if (invalidSelected.length > 0) {
            setInvalidRows(invalidSelected);
            return;
        }

        setInvalidRows([]);
        const selectedOrderDetails = orders
            .filter(order => selectedOrders.includes(order.id) && order.quantity > 0)
            .map(order => ({
                medicationID: order.id,
                quantity: Number(order.quantity)
            }));

        setPreselectedMeds(selectedOrderDetails);
        setIsOrderModalVisible(true);
    };

    const filteredOrders = orders
    .filter(order => order.medName.toLowerCase().includes(searchText.toLowerCase()))
    .filter(order => {
        if (stockFilter === 'below') {
            return order.currentStock < order.orderLevel;
        }
        if (stockFilter === 'close') {
            return (
                order.currentStock - 10 <= order.orderLevel &&
                order.orderLevel + 10 <= order.currentStock
            );
        }
        if (stockFilter === 'ordered') {
            return order.OrderedStatus && order.OrderedStatus.startsWith('Ordered');
        }
        
        return true; // 'all'
    });

    const paginatedOrders = filteredOrders.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );
    const totalPages = Math.ceil(filteredOrders.length / rowsPerPage);

    const handlePageChange = (pageNum) => {
        setCurrentPage(pageNum);
    };

    return (
        <div className={styles['new-orders-container']}>
            <Loader isLoading={loading} />
            {toast.visible && (
                <ToastSuccess type={toast.type} message={toast.message} duration={toast.duration} />
            )}
            <div className={styles['order-actions']}>
                <input
                    type="text"
                    placeholder="Search Medication"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                />
                <select
                    value={stockFilter}
                    onChange={e => setStockFilter(e.target.value)}
                    style={{ marginLeft: '1rem' }}
                >
                    <option value="all">All Stock</option>
                    <option value="below">Low Stock</option>
                    <option value="close">Stock Close To Low</option>
                    <option value="ordered">Ordered Stock</option>
                </select>
                <button
                    className={styles['submit-button']}
                    onClick={handleShowOrderModal}
                >
                    Submit Orders
                </button>
            </div>

            {loading ? (
                <div className={styles.loading}>Loading...</div>
            ) : (
                <div className={styles['orders-table-container']}>
                    <table className={styles['orders-table']}>
                        <thead>
                            <tr>
                                <th className={styles.checkboxCol}></th>
                                <th>Medication</th>
                                <th>Current Stock</th>
                                <th>Re-Order Level</th>
                                <th>Ordered Status</th>
                                <th>Quantity to Order</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedOrders.map(order => {
                                const isInvalid = selectedOrders.includes(order.id) && (!order.quantity || Number(order.quantity) < 1) && invalidRows.includes(order.id);
                                const isLowStock = order.currentStock < order.orderLevel;
                                return (
                                    <tr
                                        key={order.id}
                                        className={[
                                            isInvalid ? styles.invalidRow : "",
                                            isLowStock ? styles.lowStockRow : ""
                                        ].join(" ")}
                                    >
                                        <td className={styles.checkboxCol}>
                                            <input
                                                type="checkbox"
                                                checked={selectedOrders.includes(order.id)}
                                                onChange={() => handleCheckboxChange(order.id)}
                                            />
                                        </td>
                                        <td>{order.medName}</td>
                                        <td>{order.currentStock}</td>
                                        <td>{order.orderLevel}</td>
                                        <td>
                                            {order.OrderedStatus && order.OrderedStatus.toLowerCase().startsWith('ordered') ? (
                                                <Link to={`/PharmacyManager/MedicationOrders?medName=${encodeURIComponent(order.medName)}`} className={styles['link-no-style']}>
                                                    {order.OrderedStatus}
                                                </Link>
                                            ) : (
                                                order.OrderedStatus || '—'
                                            )}
                                        </td>
                                        <td>
                                            {selectedOrders.includes(order.id) && (
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={order.quantity || ''}
                                                    onChange={(e) =>
                                                        handleQuantityChange(order.id, e.target.value)
                                                    }
                                                    placeholder="Qty"
                                                />
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
          
            {totalPages > 1 && (
    <div style={{ marginTop: '1rem', textAlign: 'center' }}>
        <button
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            style={{
                margin: '0 5px',
                padding: '5px 10px',
                backgroundColor: '#f0f0f0',
                border: 'none',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            }}
        >
            &lt;
        </button>

        {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
            let pageNum;
            if (totalPages <= 5) {
                pageNum = index + 1;
            } else if (currentPage <= 3) {
                pageNum = index + 1;
            } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + index;
            } else {
                pageNum = currentPage - 2 + index;
            }

            return (
                <button
                    key={pageNum}
                    style={{
                        margin: '0 5px',
                        padding: '5px 10px',
                        backgroundColor: currentPage === pageNum ? '#90c3d4' : '#f0f0f0',
                        border: 'none',
                        cursor: 'pointer',
                    }}
                    onClick={() => handlePageChange(pageNum)}
                >
                    {pageNum}
                </button>
            );
        })}

        <button
            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            style={{
                margin: '0 5px',
                padding: '5px 10px',
                backgroundColor: '#f0f0f0',
                border: 'none',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            }}
        >
            &gt;
        </button>
    </div>
)}
            <Modal
                title="Create New Order"
                isOpen={isOrderModalVisible}
                onClose={closeOrderModal}
                style={{ width: 'min-content' }}
                wide
            >
                <OrderForm
                    onSubmit={handleSubmitOrder}
                    onCancel={closeOrderModal}
                    preselectedMeds={preselectedMeds}
                />
            </Modal>
        </div>
    );
};

export default NewOrders;
