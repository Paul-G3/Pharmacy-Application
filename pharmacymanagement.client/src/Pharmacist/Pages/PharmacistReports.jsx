import { useEffect, useState, useRef } from "react";
import { usePageTitle } from "../../SharedComponents/SetPageTitle";
import "../PharmacistCSS_for_Components/PharmacistReports.css";
import { getData } from "../../SharedComponents/apiService";
import Loader from "../../SharedComponents/Loader";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function PharmacistReports() {
    const [pharmReport, setPharmReport] = useState([]);
    const [groupBy, setGroupBy] = useState("patient");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);

    const itemsPerPage = 5;
    const { setPageTitle } = usePageTitle();
    const reportRef = useRef();

    useEffect(() => {
        setPageTitle("Report");
        document.title = "Health Hive";
    }, [setPageTitle]);

    useEffect(() => {
        async function fetchReport() {
            try {
                setLoading(true);
                const result = await getData("/api/Orders/get-report");
                setPharmReport(result || []);
            } catch (error) {
                console.error("Couldn't fetch report details:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchReport();
    }, []);

    // ---------- Helpers ----------
    const groupData = (data, key) => {
        return data.reduce((acc, item) => {
            let groupKey = "";
            if (key === "patient") groupKey = item.patient;
            if (key === "medication") groupKey = item.medName;
            if (key === "schedule") groupKey = `Schedule ${item.scheduleLevel}`;
            if (!acc[groupKey]) acc[groupKey] = [];
            acc[groupKey].push(item);
            return acc;
        }, {});
    };

    const calcSubTotal = (records) =>
        records.reduce(
            (sum, r) =>
                sum + r.medications.reduce((s, m) => s + (m.quantity || 0), 0),
            0
        );

    const filteredData = pharmReport.filter((r) => {
        const reportDate = new Date(r.date);
        const afterStart = startDate ? reportDate >= new Date(startDate) : true;
        const beforeEnd = endDate ? reportDate <= new Date(endDate) : true;
        return afterStart && beforeEnd;
    });

    const grouped = groupData(filteredData, groupBy);
    const grandTotal = Object.values(grouped).reduce(
        (sum, group) => sum + calcSubTotal(group),
        0
    );

    const pharmacistName = pharmReport[0]?.pharmacistName || "Unknown Pharmacist";
    const today = new Date();
    const getDate = today.toLocaleDateString();

    const paginate = (records) => {
        const meds = records.flatMap((r) =>
            r.medications.map((m) => ({
                date: r.date,
                medName: m.medName,
                quantity: m.quantity,
                instructions: m.instructions,
                patient: r.patient,
            }))
        );
        const startIdx = (currentPage - 1) * itemsPerPage;
        return meds.slice(startIdx, startIdx + itemsPerPage);
    };

    const totalPages = (records) => {
        const totalItems = records.reduce(
            (sum, r) => sum + (r.medications?.length || 0),
            0
        );
        return Math.ceil(totalItems / itemsPerPage);
    };

    // ---------- PDF Generation ----------
    const generatePDF = () => {
        const doc = new jsPDF();
        const start = startDate
            ? new Date(startDate).toLocaleDateString()
            : new Date("2025-01-01").toLocaleDateString();

        const end = endDate
            ? new Date(endDate).toLocaleDateString()
            : new Date().toLocaleDateString();


        // Header
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text("PHARMACY MANAGEMENT SYSTEM", 105, 20, { align: "center" });

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("123 Health Street, Medical District | Tel: +27 123 456 789", 105, 26, { align: "center" });
        doc.text("Email: pharmacy@healthhive.com | https://pharmacy.example.com", 105, 31, { align: "center" });

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(`PRESCRIPTIONS DISPENSED BY ${pharmacistName.toUpperCase()}`, 105, 43, { align: "center" });

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`Date Generated: ${getDate}`, 105, 49, { align: "center" });
        doc.text(`Date Range: ${start} to ${end}`, 105, 55, { align: "center" });

        doc.setDrawColor(0);
        doc.setLineWidth(0.5);
        doc.line(20, 60, 190, 60);

        let startY = 65;
        Object.keys(grouped).forEach((groupKey, i) => {
            const records = grouped[groupKey];

            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text(`${groupBy === "patient" ? "PATIENT" : groupBy.toUpperCase()}: ${groupKey}`, 20, startY);
            startY += 7;

            const tableData = records.flatMap(r =>
                r.medications.map(med => [
                    new Date(r.date).toLocaleDateString(),
                    med.medName,
                    med.quantity,
                    med.instructions || "",
                    r.patient
                ])
            );

            autoTable(doc, {
                startY,
                head: [["Date", "Medication", "Qty", "Instructions", "Patient"]],
                body: tableData,
                theme: "grid",
                headStyles: { fillColor: [22, 160, 133], textColor: 255, halign: "center", fontStyle: "bold" },
                bodyStyles: { fontSize: 10 },
                margin: { left: 20, right: 20 },
            });

            startY = doc.lastAutoTable.finalY + 5;

            const subTotal = calcSubTotal(records);
            doc.setFont("helvetica", "bold");
            doc.text("Sub-total:", 120, startY, { align: "left" });
            doc.text(subTotal.toString(), 180, startY, { align: "right" });
            startY += 10;

            if (startY > 250 && i < Object.keys(grouped).length - 1) {
                doc.addPage();
                startY = 20;
            }
        });

        // GRAND TOTAL
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("GRAND TOTAL:", 120, startY, { align: "left" });
        doc.text(grandTotal.toString(), 180, startY, { align: "right" });

        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(100);
            doc.text(`Pharmacy Manager Report - Page ${i} of ${pageCount}`, 105, 290, { align: "center" });
        }

        doc.save(`Pharmacist_Report_${new Date().toISOString()}.pdf`);
    };

    return (
        <div className="report-container" ref={reportRef}>
            <Loader isLoading={loading} />

            <p>Date Generated : {getDate}</p>
            <h2 className="report-title">
                Prescriptions Dispensed BY {pharmacistName}
            </h2>

            <div className="date-filter">
                <label>From: </label>
                <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }} />
                <label>To: </label>
                <input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }} />

                <label htmlFor="groupBy">Group By: </label>
                <select id="groupBy" value={groupBy} onChange={(e) => { setGroupBy(e.target.value); setCurrentPage(1); }}>
                    <option value="patient">Patient</option>
                    <option value="medication">Medication</option>
                    <option value="schedule">Schedule</option>
                </select>
            </div>

            {Object.entries(grouped).map(([group, records], i) => {
                const currentPageData = paginate(records);
                const total = totalPages(records);
                return (
                    <div key={i}>
                        <h3 className="patient-header">
                            {groupBy === "patient" && `PATIENT: ${group}`}
                            {groupBy === "medication" && `MEDICATION: ${group}`}
                            {groupBy === "schedule" && `${group}`}
                        </h3>

                        <table className="report-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    {groupBy !== "medication" && <th>Medication</th>}
                                    {groupBy !== "patient" && <th>Patient</th>}
                                    <th>Qty</th>
                                    <th>Instructions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentPageData.map((m, idx) => (
                                    <tr key={idx}>
                                        <td>{new Date(m.date).toLocaleDateString()}</td>
                                        {groupBy !== "medication" && <td>{m.medName}</td>}
                                        {groupBy !== "patient" && <td>{m.patient}</td>}
                                        <td>{m.quantity}</td>
                                        <td>{m.instructions}</td>
                                    </tr>
                                ))}
                                <tr>
                                    <td colSpan="5" className="subtotal">
                                        Sub-total: {calcSubTotal(records)}
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        {total > 1 && (
                            <div className="pagination">
                                <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1}>Prev</button>
                                <span>Page {currentPage} of {total}</span>
                                <button onClick={() => setCurrentPage((p) => Math.min(p + 1, total))} disabled={currentPage === total}>Next</button>
                            </div>
                        )}
                    </div>
                );
            })}

            <div className="grand-total">GRAND TOTAL: {grandTotal}</div>

            <div className="rpt-Footer">
                <button className="print-btn" onClick={generatePDF}>
                    Print PDF
                </button>
            </div>
        </div>
    );
}

export default PharmacistReports;
