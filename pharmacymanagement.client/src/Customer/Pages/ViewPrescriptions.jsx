import { useState, useEffect } from "react";
import "../CustomerCss/ViewPrescription.css";
import { FaFilePdf } from 'react-icons/fa';
import GeneralModal from "../../SharedComponents/GeneralModal";
import Loader from "../../SharedComponents/Loader";
import SuccessModal from "../../SharedComponents/SuccessModal";
import DeleteModal from "../../SharedComponents/DeleteModal";
import CustomerButton from "../Components/CustomerButton";
import { usePageTitle } from "../../SharedComponents/SetPageTitle";

function ViewPrescriptions() {
    const basePath = process.env.NODE_ENV === 'production' ? '/GRP-04-11' : '';
    const token = localStorage.getItem("jwtToken");

    // State variables
    const [selectedDate, setSelectedDate] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [Prescriptions, setPrescription] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedPrescription, setSelectedPrescription] = useState([]);
    const [selectedFile, setSelectedFile] = useState([]);
    const [status, SetStatus] = useState("NO");
    const [isChecked, setIsChecked] = useState(false);
    const [loading, setLoading] = useState(false);
    const [IsDeleteOpen, setIsDeleteOpen] = useState(false);
    const [IsOpen2, setIsOpen2] = useState(false);
    const [IsOpen, setIsOpen] = useState(false);
    const [fileName, setFileName] = useState();
    const [DeletedPrescription, setDeletedPrescription] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(calculateRowsPerPage());
    const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
    const { setPageTitle } = usePageTitle();
    // Pagination & filtering
    const filteredPrescriptions = Prescriptions.filter(p => {
        const matchesName = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDate = selectedDate ? new Date(p.date).toISOString().slice(0, 10) === selectedDate : true;
        return matchesName && matchesDate;
    });

    // Sorting
    let sortedPrescriptions = [...filteredPrescriptions];
    if (sortConfig.key !== null) {
        sortedPrescriptions.sort((a, b) => {
            let aValue, bValue;
            if (sortConfig.key === "name") {
                aValue = a.name.toLowerCase();
                bValue = b.name.toLowerCase();
            } else if (sortConfig.key === "date") {
                aValue = new Date(a.date);
                bValue = new Date(b.date);
            }
            if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
            return 0;
        });
    }

    const totalPages = Math.ceil(sortedPrescriptions.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const currentData = sortedPrescriptions.slice(startIndex, startIndex + rowsPerPage);

    function calculateRowsPerPage() {
        const screenHeight = window.innerHeight;
        if (screenHeight > 1200) return 13;
        if (screenHeight >= 992) return 11;
        if (screenHeight >= 768) return 9;
        if (screenHeight >= 600) return 7;
        return 3;
    }

    // Modal methods
    const openModal = () => setShowModal(true);
    const closeModal = () => setShowModal(false);

    const openPdf = (prescriptionBlob) => {
        const byteCharacters = atob(prescriptionBlob);
        const byteNumbers = new Array(byteCharacters.length).fill().map((_, i) => byteCharacters.charCodeAt(i));
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "application/pdf" });
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, "_blank");
    }

    const GetPrescriptions = () => {
        setLoading(true);
        fetch(`${basePath}/api/Customer/get-customer-prescriptions`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.ok ? res.json() : Promise.reject("Failed to fetch prescriptions"))
            .then(data => { setPrescription(data); setLoading(false); })
            .catch(() => setLoading(false));
    }

    useEffect(() => {
        setPageTitle('Pending Scripts');
        GetPrescriptions();
        function handleResize() {
            setRowsPerPage(calculateRowsPerPage());
            setCurrentPage(1);
        }
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const DeletePrescription = () => {
        setLoading(true);
        fetch(`${basePath}/api/Customer/delete-Prescription`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ prescriptionId: DeletedPrescription })
        })
            .then(res => res.ok ? res.json() : Promise.reject("Failed to delete"))
            .then(() => { GetPrescriptions(); setIsDeleteOpen(false); setIsOpen2(true); })
            .catch(() => setLoading(false));
    }

    const editPrescription = (p) => {
        openModal();
        setSelectedPrescription(p);
        setFileName(p.name);
        setIsChecked(p.status === "YES");
    }

    const PrescriptionStatus = () => {
        const newValue = !isChecked;
        setIsChecked(newValue);
        SetStatus(newValue ? "YES" : "NO");
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (Prescriptions.some(p => p.name === file.name)) {
            alert("This prescription already exists. Upload canceled!");
            e.target.value = "";
            return;
        }
        setSelectedFile(file);
        setFileName(file.name);
    };

    const OpenDeleteModal = (value) => { setDeletedPrescription(value); setIsDeleteOpen(true); }

    const UploadPrescription = async () => {
        if (!selectedPrescription) { alert("No prescription selected"); return; }
        const formData = new FormData();
        formData.append("PrescriptionId", selectedPrescription.prescriptionID);
        if (selectedFile) formData.append("PrescriptionBlob", selectedFile);
        formData.append("Status", status);

        setLoading(true);
        fetch(`${basePath}/api/Customer/edit-Prescription`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData
        })
            .then(res => res.ok ? res.json() : Promise.reject("Failed to edit"))
            .then(() => { GetPrescriptions(); SetStatus("NO"); closeModal(); setIsOpen(true); })
            .catch(() => setLoading(false));
    };

    const handleSort = (key, direction) => setSortConfig({ key, direction });

    return (
        <div className="view-prescription">
            {showModal && (
                <GeneralModal title="Edit Prescription" onClose={closeModal}>
                    <div className="edit-inputs-container">
                        <label>Prescription</label><br />
                        <input type="file" accept="application/pdf" onChange={handleFileChange} />
                    </div>
                    <div className="file-preview-item">
                        <FaFilePdf className="nav-icon" id="file-icon-add" />
                        <span className="file-name">{fileName}</span>
                    </div>
                    <div className="process-container">
                        <input type="checkbox" id="process" className="edit-prescription-input" onClick={PrescriptionStatus} checked={isChecked} />
                        <label htmlFor="process">Dispense Prescription</label>
                    </div>
                    <div className="upload-button-container">
                        <CustomerButton text="Edit" onClick={UploadPrescription} />
                    </div>
                </GeneralModal>
            )}

            <div className="filter-inputs">
                <div className="search-by-name-customer">
                    <input type="text"
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        placeholder="Search prescription"
                    />
                </div>
                <div className="filter-by-data-customer">
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => { setSelectedDate(e.target.value); setCurrentPage(1); }}
                    />
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <td>
                            <span>Prescription</span>
                            <span className="filter-container-customer">
                                <i className="fa-solid fa-sort-up" id="top-filter"
                                    onClick={() => handleSort("name", "asc")}></i>
                                <i className="fa-solid fa-sort-down" style={{ cursor: "pointer" }}
                                    onClick={() => handleSort("name", "desc")}></i>
                            </span>
                        </td>
                        <td>
                            <span>Date</span>
                            <span className="filter-container-customer">
                                <i className="fa-solid fa-sort-up" id="top-filter"
                                    onClick={() => handleSort("date", "asc")}></i>
                                <i className="fa-solid fa-sort-down" style={{ cursor: "pointer" }}
                                    onClick={() => handleSort("date", "desc")}></i>
                            </span>
                        </td>
                        <td>Dispense</td>
                        <td></td>
                    </tr>
                </thead>

                <tbody>
                    {currentData.map(p => (
                        <tr key={p.prescriptionID} id={p.prescriptionID}>
                            <td>
                                <button onClick={() => openPdf(p.prescriptionBlob)} className="prescrription-file-customer" title="click here to open file">
                                    <FaFilePdf className="nav-icon" id="file-icon-table" />
                                    {p.name}
                                </button>
                            </td>
                            <td>{new Date(p.date).toLocaleDateString()}</td>
                            <td>
                                <button className={p.status === "YES" ? "prescription-status-customer" : "prescription-status-customer-no"}>
                                    {p.status}
                                </button>
                            </td>
                            <td>
                                <button className="edit-prescription" title="click to edit prescription" onClick={() => editPrescription(p)}>
                                    <i className="fa-solid fa-pen-to-square"></i>
                                </button>
                                <button className="delete-prescription" title="click to delete prescription" onClick={() => OpenDeleteModal(p.prescriptionID)}>
                                    <i className="fa-solid fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="pagination-controls-customer">
                <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
                    &lt; Prev
                </button>

                {(() => {
                    let start = Math.max(1, currentPage - 2);
                    let end = Math.min(totalPages, start + 4);
                    if (end - start < 4) start = Math.max(1, end - 4);

                    let pages = [];
                    for (let i = start; i <= end; i++) {
                        pages.push(
                            <button key={i} className={currentPage === i ? "active" : ""} onClick={() => setCurrentPage(i)}>
                                {i}
                            </button>
                        );
                    }
                    return pages;
                })()}

                <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
                    Next &gt;
                </button>
            </div>

            {IsDeleteOpen && (
                <DeleteModal captionText="Are you sure you want to Delete?">
                    <div className="delete-buttons-container">
                        <button onClick={() => setIsDeleteOpen(false)} className="delete-button-modal-no">No</button>
                        <button onClick={DeletePrescription} className="delete-button-modal-yes">Yes</button>
                    </div>
                </DeleteModal>
            )}

            {IsOpen && (
                <SuccessModal captionText="Prescription Has been Updated Successfully!">
                    <div style={{ textAlign: "center" }}>
                        <button onClick={() => setIsOpen(false)} className="ok-modal-button">Ok</button>
                    </div>
                </SuccessModal>
            )}

            {IsOpen2 && (
                <SuccessModal captionText="Prescription Has been Deleted Successfully!">
                    <div style={{ textAlign: "center" }}>
                        <button onClick={() => setIsOpen2(false)} className="ok-modal-button">Ok</button>
                    </div>
                </SuccessModal>
            )}

            <Loader isLoading={loading} />
        </div>
    );
}

export default ViewPrescriptions;
