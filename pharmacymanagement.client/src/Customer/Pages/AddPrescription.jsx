import { FaFilePdf } from 'react-icons/fa';
import React, { useState,useEffect } from 'react';
import '../CustomerCss/AddPrescription.css';
import CustomerButton from "../Components/CustomerButton"
import Loader from "../../SharedComponents/Loader";
import SuccessModal from "../../SharedComponents/SuccessModal"; 
import { useNavigate } from 'react-router-dom'; 
import { usePageTitle } from "../../SharedComponents/SetPageTitle";

function AddPrescription() {

    const basePath = process.env.NODE_ENV === 'production' ? '/GRP-04-11' : '';
    const token = localStorage.getItem("jwtToken"); // adjust the key if needed

    //state variable
    const [files, setFiles] = useState([]);
    const [status, SetStatus] = useState("NO");
    const [loading, setLoading] = useState(false);
    const [IsOpen, setIsOpen] = useState(false);
    const { setPageTitle } = usePageTitle();
    const navigate = useNavigate();

    useEffect(() => {
        setPageTitle('Add Prescription');
    }, []);

    const PrescriptionStatus = () => {
        SetStatus("YES");
    }

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles(selectedFiles); 
        console.log(files);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const droppedFiles = Array.from(e.dataTransfer.files); 
        setFiles(droppedFiles);
        console.log(droppedFiles);
        //alert(droppedFiles);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const UploadPrescription = async () => {
        if (files.length === 0) {
            alert("Please select a file first");
            return;
        }

        const formData = new FormData();
        formData.append("PrescriptionBlob", files[0]); // send the first PDF file     
        formData.append("Status", status);

        setLoading(true);
            fetch(`${basePath}/api/Customer/Add-Prescription`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                    // ? DO NOT set 'Content-Type': multipart/form-data — browser handles it
                },
                body: formData
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Failed to fetch allergies");
                    }
                    return response.json();
                })
                .then(data => {
                    setLoading(false);
                    setIsOpen(true);
                })
                .catch(error => {
                    console.error("Error fetching allergies:", error);
                    setLoading(false);
                });
    };

    function viewPrescriptions() {
        setTimeout(() => {
            navigate("/Customer/ViewPrescriptions");
        }, 2000);
    }

    return (
        <div className="upload-box">
            <h2 className="upload-title">Upload Prescription</h2>

            <div
                className="drop-zone"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
            >
                <input
                    type="file" 
                    onChange={handleFileChange}
                    className="file-input"
                    accept="application/pdf"
                />
                <p><FaFilePdf className="nav-icon" id="file-icon-choose" /></p>
                <p>You can drag and drop files or click here to add them.</p>
            </div>
             
            <div className="file-preview-list">
                {files.map((file, index) => (
                    <div key={index} className="file-preview-item">
                        <FaFilePdf className="nav-icon" id="file-icon-add" />
                        <span className="file-name">{file.name}</span>
                    </div>
                ))}
            </div>

            <div className="process-container">
                <input type="checkbox" id="process" onClick={PrescriptionStatus} />
                <label htmlFor="process">Dispense Prescription</label>
            </div>

            <div className="upload-button-container"> 
                <CustomerButton text="Upload" onClick={UploadPrescription} />
            </div>

            {
                IsOpen && (<SuccessModal captionText="Prescription Has been Added Succefully!">

                    <div style={{ textAlign: "center" }}>
                        <button onClick={viewPrescriptions} className="ok-modal-button">Ok</button>
                    </div>

                </SuccessModal>
                )} 

            <Loader isLoading={loading} />
        </div>
    );
}

export default AddPrescription;
