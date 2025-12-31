import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import styles from "../CSS_for_components/StockTake.module.css";
import Loader from "../../SharedComponents/Loader";
import { getData } from '../../SharedComponents/apiService';
import { usePageTitle } from "../../SharedComponents/SetPageTitle";

const PharmacyReport = () => {
    const [groupBy, setGroupBy] = useState('supplierName');
    const [medications, Setmedications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState('');
    const [currentPages, setCurrentPages] = useState({});
    const [GeneratedName, SetGeneratedName] = useState('');
    const { setPageTitle } = usePageTitle();
    const itemsPerPage = 5;

    useEffect(() => {
        setPageTitle('Report');
        document.title = 'Report | Pharmacy';
    }, [setPageTitle]);

    useEffect(() => {
        const FetchMedication = async () => {
            setLoading(true)
            try {
                const result = await getData("/manager/medication/StockTaking");
                if (Array.isArray(result)) {
                    Setmedications(result)
                } else {
                    console.warn("result is not an array")
                }
            } catch (err) {
                console.error("fetch Error ", err)
            } finally {
                setLoading(false)
            }
        }
        const FetchName = async () => {
            setLoading(true)
            try {
                const result = await getData("/manager/medication/GeneratedName");
                console.log(result)
                SetGeneratedName(result.message)
               
            } catch (err) {
                console.error("fetch Error ", err)
            } finally {
                setLoading(false)
            }
        }
        FetchName()
        FetchMedication()
    }, []);

    // Group medications based on selected criteria
    const groupMedications = () => {
        const groups = {};

        medications.forEach(med => {
            const key = med[groupBy];
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(med);
        });

        return groups;
    };

    const groupedMeds = groupMedications();
    const groupKeys = Object.keys(groupedMeds).sort();

    // Update selected group when groupBy changes or when data loads
    useEffect(() => {
        if (groupKeys.length > 0 && !groupKeys.includes(selectedGroup)) {
            setSelectedGroup(groupKeys[0]);
        }
        // Do nothing if selectedGroup is already valid
    }, [groupKeys]);

    // Initialize current pages for each group
    useEffect(() => {
        const pages = {};
        const keys = Object.keys(groupMedications());
        keys.forEach(key => {
            pages[key] = 1;
        });
        setCurrentPages(pages);
        // eslint-disable-next-line
    }, [medications, groupBy]);

    // Calculate subtotal for a group
    const calculateSubtotal = (group) => {
        if (!group || !Array.isArray(group)) return 0;
        return group.reduce((total, med) => total + med.currentQuantity, 0);
    };

    // Calculate grand total
    const calculateGrandTotal = () => {
        return medications.reduce((total, med) => total + med.currentQuantity, 0);
    };

    // Format group name based on grouping criteria
    const formatGroupName = (key) => {
        if (!key) return "(Unknown)";
        switch (groupBy) {
            case 'supplierName': return key.toUpperCase();
            case 'dosageForm': return `${key.toUpperCase()} FORM`;
            case 'scheduleLevel': return `SCHEDULE ${key.toUpperCase()}`;
            default: return key.toUpperCase();
        }
    };

    // Format dropdown option name
    const formatDropdownOption = (key) => {
        if (!key) return "(Unknown)";
        switch (groupBy) {
            case 'supplierName': return key;
            case 'dosageForm': return `${key} Form`;
            case 'scheduleLevel': return `Schedule ${key}`;
            default: return key;
        }
    };

    // Get paginated data for a specific group
    const getPaginatedData = (groupKey) => {
        const group = groupedMeds[groupKey];
        if (!group) return []; // Return empty array if group is undefined
        const currentPage = currentPages[groupKey] || 1;
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return group.slice(startIndex, endIndex);
    };

    // Calculate total pages for a group
    const getTotalPages = (groupKey) => {
        const group = groupedMeds[groupKey];
        if (!group) return 1;
        return Math.ceil(group.length / itemsPerPage);
    };

    // Handle page change for a specific group
    const handlePageChange = (groupKey, newPage) => {
        setCurrentPages(prev => ({
            ...prev,
            [groupKey]: newPage
        }));
    };

    // Generate PDF report
    const generatePDF = () => {
        setLoading(true);
        const doc = new jsPDF();
        const currentDate = new Date().toLocaleDateString();

        // Company Header
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text('PHARMACY MANAGEMENT SYSTEM', 105, 20, { align: 'center' });

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text('123 University Way, Gqeberha | Tel: +27 123 456 789', 105, 26, { align: 'center' });
        doc.text('Email: pharmacy@healthhive.com | https://soit-iis.mandela.ac.za/GRP-04-11/', 105, 31, { align: 'center' });

        // Report Title
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text(`STOCK REPORT - GROUPED BY ${groupBy.toUpperCase()}`, 105, 43, { align: 'center' });

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`Date Generated: ${currentDate}`, 105, 49, { align: 'center' });

        // move Generated By to a new line (separated from Date Generated)
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`Generated By: ${GeneratedName}`, 105, 55, { align: 'center' });

        doc.setDrawColor(0);
        doc.setLineWidth(0.5);
        doc.line(20, 58, 190, 58); // divider

        let startY = 66;

        // Add each group to the PDF
        groupKeys.forEach((groupKey, index) => {
            // Check if we need a new page
            if (startY > 250) {
                doc.addPage();
                startY = 20;
            }

            // Group header
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text(formatGroupName(groupKey), 20, startY);
            startY += 8;

            // Prepare table data
            const tableData = groupedMeds[groupKey].map(med => [
                med.medName,
                med.reOrderLevel.toString(),
                med.currentQuantity.toString(),
                '' // Empty column for "Counted"
            ]);

            // Add table
            autoTable(doc, {
                head: [['Medication', 'Re-Order Level', 'CurrentQuantity', 'Counted']],
                body: tableData,
                startY: startY,
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
                    1: { halign: 'left', cellWidth: 40 }
                },
                alternateRowStyles: { fillColor: [245, 245, 245] }
            });

            const finalY = doc.lastAutoTable.finalY + 5;

            // "Sub-total:" on the left
            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.text('Sub-total:', 20, finalY); // Left side

            // Subtotal value under "CurrentQuantity" column
            doc.text(calculateSubtotal(groupedMeds[groupKey]).toString(), 120, finalY, { align: 'right' });
            startY = finalY + 10;

            // Add page break after each group except the last one
            if (index < groupKeys.length - 1 && startY > 200) {
                doc.addPage();
                startY = 20;
            }
        });

        if (startY > 250) {
            doc.addPage();
            startY = 20;
        }

        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text('GRAND TOTAL:', 100, startY);
        doc.text(calculateGrandTotal().toString(), 180, startY, { align: 'right' });

        // Footer
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
        setLoading(false)
        window.open(pdfUrl, '_blank');
    };

    return (
        <div className={styles.report}>
            <Loader isLoading={loading} />
            <div className={styles.header}>
                <div className={styles.metadata}>
                    <p>Date Generated: {new Date().toLocaleDateString()}</p>
                    <div className={styles.selector}>
                        <label>Group By: </label>
                        <select value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
                            <option value="supplierName">Supplier</option>
                            <option value="dosageForm">Dosage Form</option>
                            <option value="scheduleLevel">Schedule</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className={styles.content}>
                <h2>STOCK BY {groupBy.toUpperCase()}</h2>

                {/* Group Selection Dropdown */}
                {groupKeys.length > 0 && (
                    <div className={styles.groupSelector}>
                        <label>Select {groupBy === 'supplierName' ? 'Supplier' : groupBy === 'dosageForm' ? 'Dosage Form' : 'Schedule'}: </label>
                        <select
                            value={selectedGroup}
                            onChange={(e) => setSelectedGroup(e.target.value)}
                            className={styles.groupDropdown}
                        >
                            {groupKeys.map((groupKey) => (
                                <option key={groupKey} value={groupKey}>
                                    {formatDropdownOption(groupKey)}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Display selected group content */}
                {groupKeys.length > 0 && selectedGroup && (
                    <div className={styles.groupContent}>
                        <div className={styles.group}>
                            <h3>{formatGroupName(selectedGroup)}</h3>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Medication</th>
                                        <th>Re-Order Level</th>
                                        <th>CurrentQuantity on Hand</th>
                                        <th>Counted</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {getPaginatedData(selectedGroup).map(med => (
                                        <tr key={med.id}>
                                            <td>{med.medName}</td>
                                            <td className={styles.number}>{med.reOrderLevel}</td>
                                            <td className={styles.number}>{med.currentQuantity}</td>
                                            <td className={styles.counted}></td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colSpan="2">Sub-total:</td>
                                        <td className={styles.number}>{calculateSubtotal(groupedMeds[selectedGroup])}</td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>

                            {/* Pagination Controls */}
                            {getTotalPages(selectedGroup) > 1 && (
                                <div className={styles.pagination}>
                                    <button
                                        onClick={() => handlePageChange(selectedGroup, currentPages[selectedGroup] - 1)}
                                        disabled={currentPages[selectedGroup] <= 1}
                                    >
                                        Previous
                                    </button>
                                    <span>
                                        Page {currentPages[selectedGroup]} of {getTotalPages(selectedGroup)}
                                    </span>
                                    <button
                                        onClick={() => handlePageChange(selectedGroup, currentPages[selectedGroup] + 1)}
                                        disabled={currentPages[selectedGroup] >= getTotalPages(selectedGroup)}
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className={styles.grandTotal}>
                    <h3>GRAND TOTAL: {calculateGrandTotal()}</h3>
                </div>
            </div>

            <div className={styles.footer}>
                <p>Pharmacy Manager Report - Page 1</p>
                <div className={styles.buttonGroup}>
                    <button onClick={generatePDF} className={styles.pdfButton}>
                        Generate PDF
                    </button>
                    {/*<button onClick={() => window.print()} className={styles.printButton}>*/}
                    {/*    Print Report*/}
                    {/*</button>*/}
                </div>
            </div>
        </div>
    );
};

export default PharmacyReport;