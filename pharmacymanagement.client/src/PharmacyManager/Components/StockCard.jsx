import card from "../CSS_for_components/StockCardStyle.module.css";
import { FaEllipsisV } from 'react-icons/fa';
import { useState } from "react";
import ViewMedicationModal from "../Components/ViewMedModal";
import EditMedicationModal from "../Components/EditMedModal";
import { postData } from '../../SharedComponents/apiService';
import ToastSuccess from "../../SharedComponents/ToastSuccessModal";
import Loader from "../../SharedComponents/Loader";


function StockCard({
    MedsInfo,
    Ingredients,
    dosageForms,
    suppliers,
    allMedications=[],
    refresh
}) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedMedication, setSelectedMedication] = useState(null);
    const [toast, setToast] = useState({ visible: false, message: "", type: "", duration: 3000 });
    const [loading, setLoading] = useState(false);



    const {
        medication,
        dosageForm,
        supplier,
        scheduleLevel,
        reOrderLevel,
        currentQuantity,
        status,
    } = MedsInfo || {};

    const isLowStock = currentQuantity < reOrderLevel;

    const handleOpenViewModal = () => {
        setSelectedMedication(MedsInfo);
        setViewModalOpen(true);
        setMenuOpen(false);
    };

    const handleOpenEditModal = () => {
        setSelectedMedication(MedsInfo);
        setEditModalOpen(true);
        setMenuOpen(false);
    };

    const handleSave = async (updatedMedication) => {
        try {
            setLoading(true)
            const result = await postData("/manager/medication/UpdateMedication", updatedMedication);
            if (result.success) {
                setToast({
                    visible: true,
                    message: result.message,
                    type: "success",
                    duration: 3000
                });
                setEditModalOpen(false);
                await refresh();
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

    const handleToggleStatus = async (id) => {
        // read name and status from the current local MedsInfo
        const medName = MedsInfo?.medication?.medicationName || MedsInfo?.medicationName || "Medication";
        const prevStatus = (MedsInfo?.status || "").toString().toLowerCase();

        try {
            const result = await postData("/manager/medication/DeleteMedication", id);
            // normalize response shape (handles fetch/axios variations)
            const payload = result?.data ?? result;
            const success = typeof payload === "object" && ("success" in payload) ? !!payload.success : true;
            // build client-side message using local name + previous status
            if (success) {
                const action = prevStatus === "available" ? "Disabled" : "Enabled";
                setToast({ visible: true, message: `${medName} ${action} successfully`, type: "success", duration: 3000 });
            } else {
                const serverMsg = payload?.message || "Operation failed";
                setToast({ visible: true, message: serverMsg, type: "error", duration: 3000 });
            }
            // refresh list so UI reflects the changed status
            await refresh();
        } catch (err) {
            setToast({ visible: true, message: err?.message ?? "Operation failed", type: "error", duration: 3000 });
        } finally {
            // hide toast after duration (Toast component also auto-hides)
            setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3200);
            setMenuOpen(false);
        }
    };

    return (
        <>
            {toast.visible && (
                <ToastSuccess type={toast.type} message={toast.message} duration={toast.duration} />
            )}
            <Loader isLoading={loading} />
            <div className={`${card["med-card"]} ${isLowStock ? card["low-stock"] : ""}`}>
                <div className={card["med-header"]}>
                    <div className={card["mednameheader"]}>
                        <h3 className={card["med-name"]}>{medication.medicationName}</h3>
                    </div>
                    <div className={card["dots-menu"]} onClick={() => setMenuOpen(!menuOpen)}>
                        <FaEllipsisV />
                        {menuOpen && (
                            <div className={card["dropdown-menu"]}>
                                <div onClick={handleOpenViewModal}>Details</div>

                                {status === "Available" ? (
                                    <div onClick={handleOpenEditModal}>Edit</div>
                                ) : (
                                    <div
                                        className={card["disabled-option"]}
                                        title="Cannot edit inactive medication or with inactive dependencies"
                                    >
                                        Edit
                                    </div>
                                )}

                                {(status === "Discontinued" || status === "Available") && (
                                    <div onClick={async () => await handleToggleStatus(medication.medicationID)}>
                                        {status === "Discontinued" ? "Enable" : "Disable"}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className={card["med-info"]}>
                    <div><strong>Form:</strong> {dosageForm.dosageForm}</div>
                    <div><strong>Supplier:</strong> {supplier.supplierName}</div>
                    <div><strong>Schedule:</strong> {scheduleLevel}</div>
                    <div><strong>Re-Order:</strong> {reOrderLevel}</div>
                    <div>
                        <strong>Quantity:</strong>
                        <span className={isLowStock ? card["low-quantity"] : ""}>
                            {currentQuantity}
                        </span>
                    </div>
                    <div
                        style={{
                            color: status === "Available" ? "#116A6F" : "orangered",
                            fontWeight: "bolder"
                        }}
                    >
                        {status}
                    </div>
                </div>
            </div>

            {viewModalOpen && (
                <ViewMedicationModal
                    medication={selectedMedication}
                    onClose={() => setViewModalOpen(false)}
                />
            )}

            {editModalOpen && (
                <EditMedicationModal
                    medication={selectedMedication}
                    onSave={handleSave}
                    onClose={() => setEditModalOpen(false)}
                    ingredientOptions={Ingredients}
                    dosageFormOptions={dosageForms}
                    existingMedications={allMedications }
                    suppliers={suppliers}
                />
            )}
        </>
    );
}

export default StockCard;