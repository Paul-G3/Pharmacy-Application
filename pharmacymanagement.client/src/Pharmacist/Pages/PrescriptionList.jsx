import '../PharmacistCSS_for_Components/PrescriptionList.css';
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { getData, postData } from "../../SharedComponents/apiService";
import { usePageTitle } from "../../SharedComponents/SetPageTitle";
import Loader from "../../SharedComponents/Loader";

function PrescriptionList() {

    const { setPageTitle } = usePageTitle();

    useEffect(() => {
        setPageTitle('Pending Scripts');
        document.title = 'Health Hive';
    }, [setPageTitle]);

    const [loading, setLoading] = useState(false);
    const [pendingScripts, setpendingScripts] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterDispense, setFilterDispense] = useState("All"); // 👈 New state
    const [currentPage, setCurrentPage] = useState(1);
    const prescriptionsPerPage = 7;

    async function fetchPendingScripts() {
        try {
            setLoading(true);
            const result = await getData('/api/UploadScript/get-pendingScripts');
            setpendingScripts(Array.isArray(result) ? result : [result]);
            console.log("Fetched Pending scripts:", result);
        } catch (error) {
            console.error("Error fetching customers:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchPendingScripts();
    }, []);

    function matchesSearch(item) {
        return (
            item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.idNumber.includes(searchTerm)
        );
    }

    // ✅ Combine search and dispense filter
    const filteredPrescriptions = pendingScripts
        .filter(matchesSearch)
        .filter(item => {
            if (filterDispense === "All") return true;
            return item.dispense?.toUpperCase() === filterDispense.toUpperCase();
        });

    // ✅ Sorting: YES first
    const sortedPrescriptions = filteredPrescriptions.sort((a, b) => {
        if (a.dispense === "YES" && b.dispense !== "YES") return -1;
        if (a.dispense !== "YES" && b.dispense === "YES") return 1;
        return 0;
    });

    // Pagination
    const indexOfLastPrescription = currentPage * prescriptionsPerPage;
    const indexOfFirstPrescription = indexOfLastPrescription - prescriptionsPerPage;
    const currentPrescriptions = sortedPrescriptions.slice(indexOfFirstPrescription, indexOfLastPrescription);
    const totalPages = Math.ceil(filteredPrescriptions.length / prescriptionsPerPage);

    const handleNext = () => { if (currentPage < totalPages) setCurrentPage(prev => prev + 1); };
    const handlePrev = () => { if (currentPage > 1) setCurrentPage(prev => prev - 1); };

    const navigate = useNavigate();
    function handleProcess(prescription) {
        navigate("/Pharmacist/Prescription", { state: { prescription } });
    }

    function downloadPrescription(prescription) {
        if (!prescription.prescriptionBlob) {
            alert("No prescription file found.");
            return;
        }
        const byteCharacters = atob(prescription.prescriptionBlob);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "application/pdf" });

        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    return (
        <div className="prescription-page">

            {/* 🔍 Search + Filter Row */}
            <div className="searchCustPrescr" style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <input
                    type="text"
                    placeholder="Search By Customer Name / ID"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ flex: "1" }}
                />
                <select
                    value={filterDispense}
                    onChange={(e) => setFilterDispense(e.target.value)}
                    style={{ padding: "6px", borderRadius: "8px" }}
                >
                    <option value="All">All</option>
                    <option value="YES">Yes</option>
                    <option value="NO">No</option>
                </select>
            </div>

            <br />

            <div className="prescription-table-container">
                {currentPrescriptions.length > 0 ? (
                    <table className="prescription-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Surname</th>
                                <th>ID Number</th>
                                <th>File</th>
                                <th>Dispense</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentPrescriptions.map((item) => (
                                <tr key={item.id}
                                    className={item.dispense === "YES" ? "urgent-row" : ""}
                                    title={item.dispense === "YES" ? "Urgent: Requested for dispense!" : ""}
                                >
                                    <td>{item.customerName}</td>
                                    <td>{item.surname}</td>
                                    <td>{item.idNumber}</td>
                                    <td>
                                        <a href="#" onClick={(e) => { e.preventDefault(); downloadPrescription(item); }}>
                                            {item.fileName}
                                        </a>
                                    </td>
                                    <td>
                                        <span className={item.dispense === "YES" ? "dispenseOpt" : "dontDispense"}>
                                            {item.dispense}
                                        </span>
                                        {item.dispense === "YES" && <span>⚠️</span>}
                                    </td>
                                    <td>
                                        <button onClick={() => handleProcess(item)} title="Click to process" className="process-btn">
                                            Process
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="not-found-message">Prescription not found</p>
                )}
            </div>

            <div className="pagination">
                <button onClick={handlePrev} disabled={currentPage === 1}>Previous</button>
                <button onClick={handleNext} disabled={currentPage === totalPages}>Next</button>
            </div>

            <Loader isLoading={loading} />
        </div>
    );
}

export default PrescriptionList;
