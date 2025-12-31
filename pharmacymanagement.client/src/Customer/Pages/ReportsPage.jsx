import "../CustomerCss/CustomerReportsPage.css";
import React, { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { usePageTitle } from "../../SharedComponents/SetPageTitle";
import Loader from '../../SharedComponents/Loader';
function ReportsPage() {
    const basePath = process.env.NODE_ENV === 'production' ? '/GRP-04-11' : '';
    const token = localStorage.getItem("jwtToken");

    const [selected, setSelected] = useState("Doctor");
    const [ReportByDoctor, setReportByDoctor] = useState([]);
    const [ReportByMedication, setReportByMedication] = useState([]);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const { setPageTitle } = usePageTitle();
    const [loading, setLoading] = useState(false);

    const handleGroupByChange = (e) => setSelected(e.target.value);

    useEffect(() => {
        setLoading(true);
        setPageTitle('Create Report');
        fetch(`${basePath}/api/Customer/customer-report`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            }
        })
            .then(res => {
                setLoading(false);
                if (!res.ok) throw new Error("Failed to fetch report");
                return res.json();
            })
            .then(data => {
                setLoading(false);
                if (!data || !data.doctorReport || !data.medicationReport) return;

                const groupedByDoctor = data.doctorReport.reduce((acc, row) => {
                    const key = row.Doctor;
                    if (!acc[key]) acc[key] = { doctor: key, medications: [], subTotal: 0 };
                    acc[key].medications.push({
                        date: row.Date,
                        medication: row.MedName,
                        quantity: row.Quantity,
                        repeats: row.NumberOfRepeats
                    });
                    acc[key].subTotal += row.Quantity;
                    return acc;
                }, {});
                setReportByDoctor(Object.values(groupedByDoctor));

                const groupedByMedication = data.medicationReport.reduce((acc, row) => {
                    const key = row.MedName;
                    if (!acc[key]) acc[key] = { Medication: key, Details: [], subTotal: 0 };
                    acc[key].Details.push({
                        quantity: row.Quantity,
                        Pharmacist: row.Pharmacist ?? "Unknown",
                        Date: row.Date,
                        Status: row.Status ?? "N/A"
                    });
                    acc[key].subTotal += row.Quantity;
                    return acc;
                }, {});
                setReportByMedication(Object.values(groupedByMedication));
            })
            .catch(err => console.error("Error fetching report:", err));
    }, []);

    const getFilteredDoctorReport = () => {
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        if (end) end.setHours(23, 59, 59, 999);

        return ReportByDoctor.map(doc => {
            const filteredMeds = doc.medications.filter(m => {
                const date = new Date(m.date);
                if (start && end) return date >= start && date <= end;
                if (start) return date >= start;
                if (end) return date <= end;
                return true;
            });

            if (!filteredMeds.length) return null;
            const subTotal = filteredMeds.reduce((sum, m) => sum + m.quantity, 0);
            return { ...doc, medications: filteredMeds, subTotal };
        }).filter(Boolean);
    };

    const getFilteredMedicationReport = () => {
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        if (end) end.setHours(23, 59, 59, 999);

        return ReportByMedication.map(med => {
            const filteredDetails = med.Details.filter(d => {
                const date = new Date(d.Date);
                if (start && end) return date >= start && date <= end;
                if (start) return date >= start;
                if (end) return date <= end;
                return true;
            });

            if (!filteredDetails.length) return null;
            const subTotal = filteredDetails.reduce((sum, d) => sum + d.quantity, 0);
            return { ...med, Details: filteredDetails, subTotal };
        }).filter(Boolean);
    };

    const doctorDisplay = getFilteredDoctorReport();
    const medicationDisplay = getFilteredMedicationReport();

    const grandTotalDoctor = doctorDisplay.reduce((sum, doc) => sum + doc.subTotal, 0);
    const grandTotalMedication = medicationDisplay.reduce((sum, med) => sum + med.subTotal, 0);

    // ? Check if there’s filtered data
    const hasData =
        (selected === "Doctor" && doctorDisplay.length > 0) ||
        (selected === "Medication" && medicationDisplay.length > 0);

    // --- Generate PDF ---
    const generatePDF = () => {
        const doc = new jsPDF();
        const currentDate = new Date().toLocaleDateString();

        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('PHARMACY MANAGEMENT SYSTEM', 105, 20, { align: 'center' });

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('123 Health Street, Medical District | Tel: +27 123 456 789', 105, 26, { align: 'center' });
        doc.text('Email: pharmacy@healthhive.com | https://pharmacy.example.com', 105, 31, { align: 'center' });

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(`DISPENSED PRESCRIPTIONS - GROUPED BY ${selected.toUpperCase()}`, 105, 43, { align: 'center' });

        doc.setFontSize(10);
        doc.text(`Date Generated: ${currentDate}`, 105, 49, { align: 'center' });

        doc.line(20, 52, 190, 52);

        let startY = 60;

        if (selected === 'Doctor') {
            doctorDisplay.forEach(docGroup => {
                if (startY > 250) { doc.addPage(); startY = 20; }
                doc.setFontSize(12);
                doc.text(`Doctor: ${docGroup.doctor}`, 20, startY);
                startY += 8;

                const tableData = docGroup.medications.map(med => [
                    new Date(med.date).toLocaleDateString(),
                    med.medication,
                    med.quantity.toString(),
                    med.repeats.toString()
                ]);

                autoTable(doc, {
                    head: [['Date', 'Medication', 'Quantity', 'Repeats']],
                    body: tableData,
                    startY,
                    theme: 'grid',
                    headStyles: { fillColor: [22, 160, 133], textColor: 255 },
                    bodyStyles: { fontSize: 10 },
                    alternateRowStyles: { fillColor: [245, 245, 245] }
                });

                startY = doc.lastAutoTable.finalY + 5;
                doc.text(`Subtotal: ${docGroup.subTotal}`, 160, startY, { align: 'right' });
                startY += 10;
            });

            doc.text('GRAND TOTAL:', 140, startY);
            doc.text(grandTotalDoctor.toString(), 180, startY, { align: 'right' });
        }

        if (selected === 'Medication') {
            medicationDisplay.forEach(medGroup => {
                if (startY > 250) { doc.addPage(); startY = 20; }
                doc.setFontSize(12);
                doc.text(`Medication: ${medGroup.Medication}`, 20, startY);
                startY += 8;

                const tableData = medGroup.Details.map(d => [
                    new Date(d.Date).toLocaleDateString(),
                    d.Pharmacist,
                    d.quantity.toString(),
                    d.Status
                ]);

                autoTable(doc, {
                    head: [['Date', 'Pharmacist', 'Quantity', 'Status']],
                    body: tableData,
                    startY,
                    theme: 'grid',
                    headStyles: { fillColor: [22, 160, 133], textColor: 255 },
                    bodyStyles: { fontSize: 10 },
                    alternateRowStyles: { fillColor: [245, 245, 245] }
                });

                startY = doc.lastAutoTable.finalY + 5;
                doc.text(`Subtotal: ${medGroup.subTotal}`, 160, startY, { align: 'right' });
                startY += 10;
            });

            doc.text('GRAND TOTAL:', 140, startY);
            doc.text(grandTotalMedication.toString(), 180, startY, { align: 'right' });
        }

        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(100);
            doc.text(`Pharmacy Manager Report - Page ${i} of ${pageCount}`, 105, 285, { align: 'center' });
            doc.text(`Generated on ${currentDate}`, 105, 290, { align: 'center' });
        }

        // ? Open PDF in new tab
        const pdfBlob = doc.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        window.open(pdfUrl, '_blank');
    };

    return (
        <div className="reperts-page-container-customer">
            <div className="customer-report-filters">
                <div>
                    <label>Group By</label>
                    <select onChange={handleGroupByChange} value={selected}>
                        <option value="Doctor">Doctor</option>
                        <option value="Medication">Medication</option>
                    </select>
                </div>
                <div>
                    <label>Start Date</label>
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                </div>
                <div>
                    <label>End Date</label>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                </div>
            </div>

            <h2 style={{ textAlign: "center", color: "#116A6F", margin: "1rem 0" }}>
                Dispensed Prescriptions By {selected}
            </h2>

            {/* ? Display reports if data exists */}
            {hasData ? (
                <>
                    {selected === "Doctor" && doctorDisplay.map((doc, index) => (
                        <div key={index} className="doctor-report">
                            <p><span>{selected}:</span> {doc.doctor}</p>
                            <div className="report-header-customer">
                                <span>Date</span>
                                <span>Medication</span>
                                <span>Quantity</span>
                                <span>Repeats</span>
                            </div>
                            <hr />
                            {doc.medications.map((med, i) => (
                                <div key={i} className="medication-row-customer">
                                    <span>{new Date(med.date).toLocaleDateString()}</span>
                                    <span>{med.medication}</span>
                                    <span>{med.quantity}</span>
                                    <span>{med.repeats}</span>
                                </div>
                            ))}
                            <p style={{ textAlign: "center" }}><strong>Subtotal:</strong> {doc.subTotal}</p>
                        </div>
                    ))}

                    {selected === "Medication" && medicationDisplay.map((med, index) => (
                        <div key={index} className="medication-report">
                            <p><span>{selected}:</span> {med.Medication}</p>
                            <div className="report-header-customer">
                                <span>Date</span>
                                <span>Pharmacist</span>
                                <span>Quantity</span>
                                <span>Status</span>
                            </div>
                            <hr />
                            {med.Details.map((d, i) => (
                                <div key={i} className="medication-row-customer">
                                    <span>{new Date(d.Date).toLocaleDateString()}</span>
                                    <span>{d.Pharmacist}</span>
                                    <span>{d.quantity}</span>
                                    <span>{d.Status}</span>
                                </div>
                            ))}
                            <p style={{ textAlign: "center" }}><strong>Subtotal:</strong> {med.subTotal}</p>
                        </div>
                    ))}

                    <p style={{ textAlign: "center", fontWeight: "bold", marginTop: "1rem" }}>
                        Grand Total: {selected === "Doctor" ? grandTotalDoctor : grandTotalMedication}
                    </p>

                    {/* ? Show Generate PDF button only if data exists */}
                    <div style={{ textAlign: "center", margin: "2rem 0" }}>
                        <button
                            onClick={generatePDF}
                            style={{
                                padding: '0.5rem 1rem',
                                backgroundColor: '#116A6F',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer'
                            }}
                        >
                            Generate PDF
                        </button>
                    </div>
                </>
            ) : (
                <p style={{
                    textAlign: "center",
                    color: "gray",
                    fontStyle: "italic",
                    marginTop: "2rem"
                }}>
                    No data found for the selected range.
                </p>
            )}
        </div>
    );
}

export default ReportsPage;
