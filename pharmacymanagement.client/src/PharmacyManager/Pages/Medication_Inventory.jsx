import StockCard from "../Components/StockCard";
import AddMedicationModal from "../Components/NewMedModal";
import { usePageTitle } from "../../SharedComponents/SetPageTitle";
import stockstyle from "../CSS_for_components/StockStyle.module.css"
import { useState, useEffect } from "react";
import { useSearchParams } from 'react-router-dom';
import { getData,postData } from '../../SharedComponents/apiService';
import Loader from "../../SharedComponents/Loader";
import ToastSuccess from "../../SharedComponents/ToastSuccessModal";


const itemsPerPage = 9;

function StockPage() {
    const [MedData, SetMedData] = useState([]); 
    const [ActiveDosage, SetActiveDosage] = useState([]);
    const [ActiveSupplier, SetActiveSupplier] = useState([]);
    const [ActiveIngredients, SetActiveIngredients] = useState([]);
    const [loading, setLoading] = useState(false)
    const [toast, setToast] = useState({ visible: false, message: "", type: "", duration: 3000 });

    const fetchMedication = async () => {
        try {
            setLoading(true)
            const result = await getData("/manager/medication/Medication");
            if (Array.isArray(result)) {
                SetMedData(result);
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
        fetchMedication();

        const fetchActiveDosage = async () => {
            try {
                const result = await getData("/manager/medication/ActiveDosageForm");
                if (Array.isArray(result)) {
                    SetActiveDosage(result);
                }
            } catch (err) {
                console.error("fetch Error ", err);
            }
        };
        fetchActiveDosage();

        const fetchActiveSupplier = async () => {
            try {
                const result = await getData("/manager/medication/ActiveSupplier");
                if (Array.isArray(result)) {
                    SetActiveSupplier(result);
                }
            } catch (err) {
                console.error("fetch Error ", err);
            }
        };
        fetchActiveSupplier();

        const fetchActiveIngredient = async () => {
            try {
                const result = await getData("/manager/medication/ActiveIngredients");
                if (Array.isArray(result)) {
                    SetActiveIngredients(result);
                }
            } catch (err) {
                console.error("fetch Error ", err);
            }
        };
        fetchActiveIngredient();
    }, []);

    const [searchParams] = useSearchParams();
    const [currentPage, setCurrentPage] = useState(1);
    const { setPageTitle } = usePageTitle();

    useEffect(() => {
        setPageTitle('Medication');
        document.title = 'Medication | Pharmacy';
    }, [setPageTitle]);

    const [searchTerm, setSearchTerm] = useState("");
    const [dosageFormFilter, setDosageFormFilter] = useState("");
    const [ingredientFilter, setIngredientFilter] = useState("");
    const [stockFilter, setStockFilter] = useState("all");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const handleSearch = (item) => {
        const term = searchTerm.toLowerCase();
        return (
            item.medication.medicationName.toLowerCase().includes(term) ||
            item.supplier.supplierName.toLowerCase().includes(term)
        );
    };

    useEffect(() => {
        if (searchParams.get('filter') === 'low') {
            setStockFilter('low');
        }
    }, [searchParams]);

    const handleFilter = (item) => {
        const matchesForm = !dosageFormFilter || item.dosage.dosageForm === dosageFormFilter;
        const matchesIngredient = !ingredientFilter ||
            item.activeIngredients.some(ing => ing.ingredient === ingredientFilter);

        const matchesStock =
            stockFilter === "all" ||
            (stockFilter === "low" && item.currentQuantity < item.reOrderLevel) ||
            (stockFilter === "close" && item.currentQuantity - 10 <= item.reOrderLevel &&
                item.reOrderLevel + 10 <= item.currentQuantity) ||
            (stockFilter === "sufficient" && item.currentQuantity >= item.reOrderLevel);

        return matchesForm && matchesIngredient && matchesStock;
    };

    const filteredData = MedData.filter(item => handleSearch(item) && handleFilter(item));

    const uniqueForms = [...new Set(MedData.map(d => d.dosage.dosageForm))].sort();
    const uniqueIngredients = [
        ...new Set(
            MedData.flatMap(d => d.activeIngredients.map(ing => ing.ingredient))
        )
    ].sort();

    const currentItems = filteredData
        .slice()
        .sort((a, b) => a.medication.medicationName.localeCompare(b.medication.medicationName))
        .slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
        );
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    return (
        <>
            <Loader isLoading={loading} />
            {toast.visible && (
                <ToastSuccess type={toast.type} message={toast.message} duration={toast.duration} />
            )}
            <div className={stockstyle.StockPageContainer}>
                <div className={stockstyle["right-container"]}>
                    <div className={stockstyle["NewMed-btn"]}>
                        <button onClick={() => setIsAddModalOpen(true)}>New Medication</button>
                    </div>
                    <h2 className={stockstyle["filter-header"]}>Filter Search</h2>
                    <div className={stockstyle["filter-bar"]}>
                        <input
                            type="text"
                            placeholder="Search medication or supplier"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1); // Reset to first page on search
                            }}
                        />

                        <select value={dosageFormFilter} onChange={(e) => {
                            setDosageFormFilter(e.target.value);
                            setCurrentPage(1); // Reset to first page on filter change
                        }}>
                            <option value="">All Forms</option>
                            {uniqueForms.map(form => <option key={form} value={form}>{form}</option>)}
                        </select>

                        <select value={ingredientFilter} onChange={(e) => {
                            setIngredientFilter(e.target.value);
                            setCurrentPage(1); // Reset to first page on filter change
                        }}>
                            <option value="">All Ingredients</option>
                            {uniqueIngredients.map(ing => <option key={ing} value={ing}>{ing}</option>)}
                        </select>

                        <select
                            value={stockFilter}
                            onChange={(e) => {
                                const value = e.target.value;
                                setStockFilter(value);
                                setCurrentPage(1); // Reset to first page on filter change
                                if (value === 'low') {
                                    searchParams.set('filter', 'low');
                                } else {
                                    searchParams.delete('filter');
                                }
                            }}
                        >
                            <option value="all">All Stock</option>
                            <option value="low">Low Stock</option>
                            <option value="sufficient">Sufficient Stock</option>
                            <option value="close">Close to Low</option>
                        </select>

                        <div
                            className={stockstyle["status-flags-info"]}
                            style={{ marginTop: "10px", fontSize: "0.95em", color: "#555" }}
                        >
                            <strong>Status Flags:</strong>
                            <ul style={{ margin: 0, paddingLeft: "1.2em" }}>
                                <li><b>spBlocked</b>: Medication is blocked due to supplier issues.</li>
                                <li><b>ingBlocked</b>: Medication is blocked due to ingredient restrictions.</li>
                                <li><b>dsBlocked</b>: Medication is blocked due to dosage form restrictions.</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className={stockstyle["left-contaner"]}>
                    <div className={stockstyle["grid-container"]}>
                        {currentItems.length > 0 ? (
                            currentItems.map((item, idx) => {
                                const medsInfo = {
                                    medication: item.medication,
                                    dosageForm: item.dosage,
                                    supplier: item.supplier,
                                    scheduleLevel: item.scheduleLevel,
                                    reOrderLevel: item.reOrderLevel,
                                    currentQuantity: item.currentQuantity,
                                    activeIngredients: item.activeIngredients,
                                    strenght: item.strength,
                                    price: item.price,
                                    status: item.status
                                };
                                return (
                                    <StockCard
                                        key={idx}
                                        MedsInfo={medsInfo}
                                        activeIngredients={item.activeIngredients}
                                        Ingredients={ActiveIngredients}
                                        dosageForms={ActiveDosage}
                                        suppliers={ActiveSupplier}
                                        allMedications={MedData }
                                        refresh={fetchMedication}
                                    />
                                );
                            })
                        ) : (
                            <p>No matching medication found.</p>
                        )}
                    </div>

                    <div className={stockstyle.pagination}>
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => p - 1)}
                        >
                            Previous
                        </button>
                        <span>Page {currentPage} of {totalPages}</span>
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(p => p + 1)}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            <AddMedicationModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAddMedication={async (newMed) => {
                    // Check for duplicate medication name
                    const exists = MedData.some(
                        med =>
                            med.medication.medicationName.trim().toLowerCase() ===
                            newMed.MedicationName.trim().toLowerCase()
                    );
                    if (exists) {
                        return { success: false, message: "Medication already exists." };
                    }
                    const result = await postData("/manager/medication/NewMedication", newMed);
                    if (result.success) {
                        setToast({
                            visible: true,
                            message: result.message,
                            type: "success",
                            duration: 3000
                        });
                        fetchMedication();
                    } else {
                        setToast({
                            visible: true,
                            message: result.message || "An error occurred",
                            type: "error",
                            duration: 3000
                        });
                    }
                }}
                suppliers={ActiveSupplier}
                dosageFormOptions={ActiveDosage}
                ingredientOptions={ActiveIngredients}
            />
        </>
    );
}

export default StockPage;
