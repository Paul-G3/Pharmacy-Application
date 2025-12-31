import React, { useState, useMemo, useEffect } from "react";
import medmodal from "../CSS_for_components/ModalStyle.module.css";
import { getData } from "../../SharedComponents/apiService";
import Loader from "../../SharedComponents/Loader";


export default function OrderForm({ onSubmit, onCancel, preselectedMeds = []}) {
    const [supplierMedicationMap, setSupplierMedicationMap] = useState({});
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const fetchMedication = async () => {
            try {
                setLoading(true)
                const result = await getData("/manager/medication/GetMedBySupplier");
                if (Array.isArray(result)) {
                    const map = {};
                    result.forEach(sup => {
                        map[sup.supplierID] = {
                            supplierName: sup.supplierName,
                            meds: sup.medArray
                        };
                    });
                    setSupplierMedicationMap(map);
                } else {
                    console.warn("Result is not an array");
                }
            } catch (err) {
                console.error("Fetch Error", err);
            } finally {
                setLoading(false)
            }
        };
        fetchMedication();
    }, []);

    const medIDToSupplierID = useMemo(() => {
        const map = {};
        Object.entries(supplierMedicationMap).forEach(([supID, obj]) => {
            obj.meds.forEach(med => {
                map[med.medicationID] = supID;
            });
        });
        return map;
    }, [supplierMedicationMap]);

    const [formItems, setFormItems] = useState(
        preselectedMeds.length > 0
            ? preselectedMeds.map(med => ({
                medication: med.medicationID,
                quantity: med.quantity || ""
            }))
            : [{ medication: "", quantity: "" }]
    );

    useEffect(() => {
        if (preselectedMeds.length > 0) {
            setFormItems(preselectedMeds.map(med => ({
                medication: med.medicationID,
                quantity: med.quantity || ""
            })));
        }
    }, [preselectedMeds]);

    const [message, setMessage] = useState("");

    const handleItemChange = (idx, field, value) => {
        setFormItems((prevItems) => {
            const updatedItems = [...prevItems];
            updatedItems[idx] = { ...updatedItems[idx], [field]: value };

            if (field === "medication" && value) {
                const supplierId = medIDToSupplierID[value];
                setSelectedSupplier(supplierId);
            }

            return updatedItems;
        });
    };

    const addItem = () => {
        setFormItems([{ medication: "", quantity: "" }, ...formItems]);
        setSelectedSupplier(null);
    };

    const removeItem = (idx) => {
        setFormItems(formItems.filter((_, i) => i !== idx));
        // Reset supplier selection if no items left
        if (formItems.length === 1) {
            setSelectedSupplier(null);
        }
    };

    const handleSubmit = () => {
        if (formItems.some(it => !it.medication || !it.quantity)) {
            setMessage("Please complete all fields.");
            return;
        }

        // Check for duplicates
        const medIds = formItems.map(it => it.medication);
        const hasDuplicates = new Set(medIds).size !== medIds.length;
        if (hasDuplicates) {
            setMessage("You have selected the same medication more than once.");
            return;
        }

        // Group items by supplier
        const itemsBySupplier = {};
        formItems.forEach(it => {
            const supplierId = medIDToSupplierID[it.medication];
            if (!itemsBySupplier[supplierId]) itemsBySupplier[supplierId] = [];
            itemsBySupplier[supplierId].push({
                medicationID: +it.medication,
                quantityOrdered: +it.quantity,
            });
        });

        Object.values(itemsBySupplier).forEach(orderItems => {
            onSubmit(orderItems);
        });
    };


    const groupedBySupplier = useMemo(() => {
        const groups = {};
        formItems.forEach((item, idx) => {
            const supplierId = item.medication ? medIDToSupplierID[item.medication] : "none";
            if (!groups[supplierId]) groups[supplierId] = [];
            groups[supplierId].push({ ...item, idx });
        });
        return groups;
    }, [formItems, medIDToSupplierID]);

    const getSupplierName = (supplierId) => {
        return supplierId === "none"
            ? "No supplier selected"
            : supplierMedicationMap[supplierId]?.supplierName || "Unknown Supplier";
    };

    return (
        <div className={medmodal["order-form"]}>
            <Loader isLoading={loading} />
            <div className={medmodal["supplier-display"]}>
                <h3>
                    {selectedSupplier
                        ? `Supplier: ${getSupplierName(selectedSupplier)}`
                        : "Select a medication to see supplier"}
                </h3>
            </div>

            <h4>Order Items</h4>

            <div className={medmodal["order-items"] }>
                {Object.entries(groupedBySupplier).map(([supplierId, items]) => (
                    <div key={supplierId} className={medmodal["supplier-group"]}>
                        {supplierId !== "none" && (
                            <h5 className={medmodal["supplier-header"]}>
                                {getSupplierName(supplierId)}
                            </h5>
                        )}

                        {items.map(({ idx, ...item }) => (
                            <div key={idx} className={medmodal["order-item-for"]}>
                                {/* Medication select */}
                                <div className={medmodal["form-group"]}>
                                    <label className={medmodal["detail-label"]}>Medication *</label>
                                    <select
                                        value={item.medication}
                                        onChange={(e) => handleItemChange(idx, "medication", e.target.value)}
                                    >
                                        <option value="">Select medication</option>

                                        {Object.entries(supplierMedicationMap)
                                            .sort(([, a], [, b]) => a.supplierName.localeCompare(b.supplierName))
                                            .map(([supId, supplier]) => (
                                                <optgroup key={supId} label={supplier.supplierName}>
                                                    {supplier.meds
                                                        .slice()
                                                        .sort((a, b) => a.medName.localeCompare(b.medName))
                                                        .map((med) => {
                                                            const isSelectedElsewhere = formItems.some(
                                                                (fi, i) => i !== idx && Number(fi.medication) === Number(med.medicationID)
                                                            );

                                                            return (
                                                                <option
                                                                    key={med.medicationID}
                                                                    value={med.medicationID}
                                                                    disabled={isSelectedElsewhere}
                                                                >
                                                                    {med.medName}
                                                                </option>
                                                            );
                                                        })}
                                                </optgroup>
                                            ))}
                                    </select>


                                </div>

                                <div className={medmodal["form-group"]}>
                                    <label className={medmodal["detail-label"]}>Qty *</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={item.quantity}
                                        onChange={(e) =>
                                            handleItemChange(idx, "quantity", e.target.value)
                                        }
                                    />
                                </div>

                                {formItems.length > 1 && (
                                    <button
                                        type="button"
                                        className={medmodal["remove-btn"]}
                                        onClick={() => removeItem(idx)}
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            <button
                type="button"
                className={medmodal["add-btn"]}
                onClick={addItem}
            >
                + Add medication
            </button>

            {message && <p className={medmodal["error-message"]}>{message}</p>}

            <div className={medmodal["modal-footer"]}>
                <button
                    type="button"
                    className={medmodal["close-btn"]}
                    onClick={onCancel}
                >
                    Cancel
                </button>
                <button
                    type="button"
                    className={medmodal["save-btn"]}
                    onClick={handleSubmit}
                >
                    Submit Order
                </button>
            </div>
        </div>
    );
}