import dbstyle from "../CSS_for_components/DashboardStyle.module.css";
import React, { useState, useEffect } from 'react';
import { usePageTitle } from "../../SharedComponents/SetPageTitle";
import { getData, postData } from '../../SharedComponents/apiService';
import Loader from "../../SharedComponents/Loader";
import { useNavigate } from 'react-router-dom';
import ToastSuccess from "../../SharedComponents/ToastSuccessModal";


const PharmacyDashboard = () => {
    const navigate = useNavigate();

    const [metrics, setMetrics] = useState({
        lowStock: 0,
        pendingOrders: 0,
        activeMedications: [],
        suppliers: 0
    });
    const [orders, setOrders] = useState([]);

    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ visible: false, message: "", type: "", duration: 3000 });


    const { setPageTitle } = usePageTitle(); 

    useEffect(() => {
        setPageTitle('Dashboard');
        document.title = 'Dashboard | Pharmacy';
    }, [setPageTitle]);

    const GetOrderDetails = async () => {
        try {
            setLoading(true)
            const result = await getData('/manager/dashboard/OrderItems');
            setOrders(Array.isArray(result) ? result : []);
            const rawCount = result?.[0]?.PendingMedicationCount;
            const count = Number(rawCount ?? 0);
            setMetrics(prev => ({
                ...prev,
                pendingOrders: Number.isFinite(count) ? count : 0
            }));
        } catch (error) {
            console.error(error);
            // ensure we leave a sane default on error
            setOrders([]);
            setMetrics(prev => ({ ...prev, pendingOrders: 0 }));
        } finally {
            setLoading(false)
        }
    };

    useEffect(() => {
        const CriticalStock = async () => {
            try {
                setLoading(true)
                var result = await getData('/manager/dashboard/CriticalStockItems')
                setInventory(result.map(item => ({
                    ...item,
                    CurrentQuantity: item.CurrentQuantity,
                    ReOrderLevel: item.ReOrderLevel
                })))
                // Use the computed array length rather than the (possibly stale) state variable
                setMetrics(prev => ({
                    ...prev,
                    lowStock: (result || []).length
                }));
            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        }
        CriticalStock()

        const GetMedicationCount = async () => {
            try {
                setLoading(true)
                var result = await getData('/manager/dashboard/MedicationCount')
                setMetrics(prev => ({
                    ...prev,
                    activeMedications: result[0]?.MedCount ?? 0
                }));
            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        }
        GetMedicationCount()


        const GetSupplierCount = async () => {
            try {
                setLoading(true)
                var result = await getData('/manager/dashboard/SupplierCount')
                setMetrics(prev => ({
                    ...prev,
                    suppliers: result[0]?.SupplierCount ?? 0
                }));
            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        }
        GetSupplierCount()
        GetOrderDetails()
    }, []);

    const markAsReceived = async (orderId) => {
        try {
            setLoading(true)
            const result = await postData('/manager/orders/ApproveOrder', orderId);
            if (result.success) {
                setToast({
                    visible: true,
                    message: mess,
                    type: "success",
                    duration: 3000
                });
                await GetOrderDetails();
                setMetrics(prev => ({ ...prev, pendingOrders: Math.max(0, (Number(prev.pendingOrders) || 0) - 1) }));
            } else {
                setToast({
                    visible: true,
                    message: result.message || "An error occurred",
                    type: "error",
                    duration: 3000
                });
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    };

    const criticalItems = inventory.filter(item => item.CurrentQuantity < item.ReOrderLevel);
    const maxCriticalDisplay = 4;
    const displayedCriticalItems = criticalItems.slice(0, maxCriticalDisplay);
    const moreCriticalCount = criticalItems.length - maxCriticalDisplay;

    return (
        <div className={dbstyle["dashboard"]}>
            <header className={dbstyle["dashboard-header"]}>
                <h1>Pharmacy Manager Dashboard</h1>
                <div className={dbstyle["last-updated"]}>
                    Last updated: {new Date().toLocaleString()}
                </div>
            </header>
            <Loader isLoading={loading} />
            {toast.visible && (
                <ToastSuccess type={toast.type} message={toast.message} duration={toast.duration} />
            )}
            <div className={dbstyle["metrics-grid"]}>
                <MetricCard
                    title="Critical Stock Items"
                    value={criticalItems.length}
                    icon="⚠️"
                    variant="warning"
                    onClick={() => navigate('/PharmacyManager/NewOrder?filter=below')}
                />
                <MetricCard
                    title="Pending Orders"
                    value={metrics.pendingOrders}
                    icon="📦"
                    variant="primary"
                    onClick={() => navigate('/PharmacyManager/MedicationOrders?filter=pending')}
                />
                <MetricCard
                    title="Active Medications"
                    value={metrics.activeMedications}
                    icon="💊"
                    variant="success"
                    onClick={() => navigate('/PharmacyManager/Medication')}
                />
                <MetricCard
                    title="Active Suppliers"
                    value={metrics.suppliers}
                    icon="🏢"
                    variant="info"
                    onClick={() => navigate('/PharmacyManager/Management#supplier')}
                />
            </div>

            <DashboardSection title="Critical Stock Alerts">
                {criticalItems.length > 0 ? (
                    <ul className={dbstyle["alert-list"]}>
                        {displayedCriticalItems.map(item => (
                            <AlertItem
                                key={item.id}
                                message={`${item.MedName} - ${item.CurrentQuantity} remaining (min ${item.ReOrderLevel})`}
                                type="warning"
                            />
                        ))}
                        {moreCriticalCount > 0 && (
                            <li className={dbstyle["show-more"]}>
                                +{moreCriticalCount} more items low on stock
                            </li>
                        )}
                    </ul>
                ) : (
                    <div className={dbstyle["no-alerts"]}>No critical stock alerts</div>
                )}
            </DashboardSection>

            <DashboardSection title="Recent Medication Orders">
                <table className={dbstyle["data-table"]}>
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Supplier</th>
                            <th>Date</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr key={order.StockOrderID}>
                                <td>{order.StockOrderID}</td>
                                <td>{order.SupplierName}</td>
                                <td>{order.OrderDate.split('T')[0]}</td>
                                <td>
                                    <StatusPill status={order.Status} />
                                </td>
                                <td>
                                    {order.Status !== 'Received' && (
                                        <button
                                            className={`${dbstyle["btn"]} ${dbstyle["btn-sm"]}`}
                                            onClick={() => markAsReceived(order.StockOrderID)}
                                        >
                                            Mark Received
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </DashboardSection>

        </div>
    );

};

const MetricCard = ({ title, value, icon, variant, onClick }) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        let start = 0;
        // coerce invalid values to 0 to avoid NaN animation
        const end = Number(value) || 0;
        if (start === end) {
            setDisplayValue(end);
            return;
        }

        const duration = 800; // ms
        const increment = end / (duration / 16); // ~60fps
        let current = start;

        const timer = setInterval(() => {
            current += increment;
            if (current >= end) {
                current = end;
                clearInterval(timer);
            }
            setDisplayValue(Math.floor(current));
        }, 16);

        return () => clearInterval(timer);
    }, [value]);

    return (
        <div
            className={`${dbstyle["metric-card"]} ${dbstyle[variant]} ${dbstyle["clickable"]}`}
            onClick={onClick}
        >
            <div className={dbstyle["metric-icon"]}>{icon}</div>
            <div className={dbstyle["metric-content"]}>
                <h3>{title}</h3>
                <p className={dbstyle["metric-value"]}>{displayValue}</p>
            </div>
            <div className={dbstyle["quick-action"]}>
                <span>View →</span>
            </div>
        </div>
    );
};

const DashboardSection = ({ title, children }) => (
    <section className={dbstyle["dashboard-section"]}>
        <h2>{title}</h2>
        {children}
    </section>
);

const AlertItem = ({ message, type }) => (
    <li className={`${dbstyle["alert-item"]} ${dbstyle[type]}`}>
        <span className={dbstyle["alert-icon"]}>⚠️</span>
        {message}
    </li>
);

const StatusPill = ({ status }) => (
    <span className={`${dbstyle["status-pill"]} ${dbstyle[status.toLowerCase()]}`}>
        {status}
    </span>
);

const ProgressBar = ({ value, max }) => (
    <div className={dbstyle["progress-bar"]}>
        <div
            className={dbstyle["progress-fill"]}
            style={{ width: `${(value / max) * 100}%` }}
        ></div>
    </div>
);

export default PharmacyDashboard;