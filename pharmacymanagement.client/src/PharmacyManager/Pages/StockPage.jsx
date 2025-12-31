import DynamicTable from "../../SharedComponents/DynamicTable";
import "../CSS_for_components/StockPageStyle.css"
import React, { useState,useEffect } from 'react';
import { usePageTitle } from "../../SharedComponents/SetPageTitle";




function StockPage() {
    const MedStock = [
        { medicationName: "Paracetamol", quantityOnHand: 120, reorderLevel: 50, status: "normal" },
        { medicationName: "Ibuprofen", quantityOnHand: 30, reorderLevel: 40, status: "low" },
        { medicationName: "Amoxicillin", quantityOnHand: 75, reorderLevel: 60, status: "normal" },
        { medicationName: "Cetirizine", quantityOnHand: 20, reorderLevel: 25, status: "low" },
        { medicationName: "Metformin", quantityOnHand: 200, reorderLevel: 100, status: "normal" },
        { medicationName: "Aspirin", quantityOnHand: 15, reorderLevel: 20, status: "low" },
        { medicationName: "Lisinopril", quantityOnHand: 90, reorderLevel: 50, status: "normal" },
        { medicationName: "Atorvastatin", quantityOnHand: 45, reorderLevel: 40, status: "normal" },
        { medicationName: "Omeprazole", quantityOnHand: 10, reorderLevel: 15, status: "low" },
        { medicationName: "Simvastatin", quantityOnHand: 60, reorderLevel: 30, status: "normal" }
    ];
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');


    const { setPageTitle } = usePageTitle();

    useEffect(() => {
        setPageTitle('Stock');
        document.title = 'Stock | Pharmacy';
    }, [setPageTitle]);
    const filteredStock = MedStock.filter(item => {
        const matchesSearch = item.medicationName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === '' || item.status === statusFilter.toLowerCase();
        return matchesSearch && matchesStatus;
    });

    return (
        <>
            <div className="add-search">
                <input
                    className="search-input"
                    placeholder="Search by Medication Name"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                <select
                    className="filter-input"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="">All Stock</option>
                    <option value="low">Low Stock</option>
                    <option value="normal">Normal Stock</option>
                </select>
            </div>

            <div className="StockTable">
                <DynamicTable data={filteredStock} showActions={false } statusToHighlight="low" />
            </div>
    </>
   
)}
export default StockPage;