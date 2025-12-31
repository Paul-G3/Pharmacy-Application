import { useRef, useState, useEffect } from "react";
import { usePageTitle } from "../../SharedComponents/SetPageTitle";
import { useLocation } from 'react-router-dom';
import { postData } from "../../SharedComponents/apiService";
import '../PharmacistCSS_for_Components/loadPrescriptionPage.css'
import UploadPrescription from "../Components/UploadPrescription";
import PatientDetails from "../Components/PatientDetails";
import MedictionDetails from "../Components/MedictionDetails"
import ToastSuccess from "../../SharedComponents/ToastSuccessModal"
import Loader from "../../SharedComponents/Loader";

function LoadPrescription() {

    const basePath = process.env.NODE_ENV === 'production' ? '/GRP-04-11' : '';


    const location = useLocation();
    const prescription = location.state?.prescription;
    const [prescriptionLoaded, setPrescriptionLoaded] = useState(false);
    const [showDispense, setShowDispense] = useState(false);
    const [confirmationModal, setconfirmationModal] = useState(false);
    const [toast, settoast] = useState({ visible: false, message: "", type: "", duration: 3000 });
    const [loading, setLoading] = useState(false);
    const [sectionDisabled, setSectionDisabled] = useState(false);

    function showSavenDispense(event) {

        setShowDispense(event.target.checked);

    }


    useEffect(() => {
        if (prescription) {
            setPrescriptionLoaded(true);

            const byteCharacters = atob(prescription.prescriptionBlob);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }

            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: "application/pdf" });
            const file = new File([blob], prescription.fileName, { type: "application/pdf" });

            if (uploadRef.current?.setFile) {
                uploadRef.current.setFile(file);
            }
        } else {
            setPrescriptionLoaded(false);
        }
    }, [prescription]);


    const uploadRef = useRef();
    const patientRef = useRef();
    const medicationRef = useRef();
    const [showError, setShowError] = useState(false);
    const [showMedicationError, setshowMedicationError] = useState(false);
    const [showCustomerSelect, setshowCustomerSelect] = useState(false);
    const [showScriptUploadError, setshowScriptUploadError] = useState(false);


    useEffect(() => {
        if (patientRef.current?.getValues().dispense == 'YES') {
            setShowDispense(true);
        }
    }, [])



    const handleSave = async () => {
        const validUpload = uploadRef.current.validate();
        const validPatient = patientRef.current.validate();
        const validMedications = medicationRef.current.validate();

        console.log("Medications:", medicationRef.current.getValues().medications.length);
        setshowMedicationError(false);


        if (medicationRef.current.getValues().medications.length === 0) {
            alert("Please add at least one medication.");
            setshowMedicationError(true);
            return;
        }

        const noAllergyConflict = await medicationRef.current.validate();
        if (!noAllergyConflict) {
            //alert("Patient is allergic to one or more medications!");
            setconfirmationModal(false);
            return;
        }



        if (validUpload && validPatient && validMedications) {
            setShowError(false);


            // Gather values from child components via ref
            const uploadData = uploadRef.current.getValues();
            const patientData = patientRef.current.getValues();
            const medicationData = medicationRef.current.getValues();



            // I build a FormData object because I'll be sending a file (binary) + text data:
            const formData = new FormData();

            formData.append("DoctorName", patientData.doctor);
            formData.append("date", patientData.date.split("T")[0]);
            formData.append("PrescriptionBlob", uploadData.PrescriptionBlob);  //this is the File object
            formData.append("Name", uploadData.Name);
            formData.append("Prescription", JSON.stringify(patientData));
            formData.append("Medications", JSON.stringify(medicationData.medications));

            const prescriptionID = patientData?.prescriptionID;

            formData.append("prescriptionID", (prescriptionID != null && prescriptionID !== '') ? (prescriptionID) : -1);


            // Then I use a fetch Method to send data
            fetch(`${basePath}/api/UploadScript/add-prescription`, {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem("jwtToken")}`
                },
                body: formData,

            })
                .then(response => response.json())
                .then(result => {


                    uploadRef.current.clearValues();
                    patientRef.current.clearValues();
                    medicationRef.current.clearValues();
                    

                    if (result.success) {
                        settoast({
                            visible: true,
                            message: result.message,
                            type: "success",
                            duration: 3000
                        });

                        uploadRef.current.clearValues();
                        patientRef.current.clearValues();
                        medicationRef.current.clearValues();
                    } else {
                        settoast({
                            visible: true,
                            message: result.message || "An error occurred",
                            type: "error",
                            duration: 3000
                        });
                    }
                })

                .catch(error => {
                    console.error("Error saving prescription:", error);
                    alert("Failed to upload prescription.");
                });

        } else if (!validMedications) {
            alert("Patient is alergic to medications");
        }
        else {
            setShowError(true);
        }

        setconfirmationModal(false);
    };

    const confirmUpload = async () => {


        const validUpload = uploadRef.current.validate();
        const validPatient = patientRef.current.validate();
        const validMedications = medicationRef.current.validate();
        const medicationCount = medicationRef.current.getValues().medications;
        
        setshowMedicationError(false);
        setshowScriptUploadError(false);
        setshowCustomerSelect(false);

        const noAllergyConflict = medicationRef.current.validate();
        if (!noAllergyConflict) {
            //alert("Patient is allergic to one or more medications!");
            return;
        }

        if (
            validUpload &&
            validPatient &&
            validMedications &&
            medicationCount.length > 0 &&
            medicationCount.every(
                med =>
                    med.MedicationID &&
                    med.NumberOfRepeats &&
                    med.Quantity &&
                    med.instructions
            )
        ) {
            // ✅ All validations passed
            setShowError(false);
            setshowScriptUploadError(false);
            setshowCustomerSelect(false);
            setconfirmationModal(true);
        }
        else if (!validMedications) {
            return;
        }
        else if (!validUpload) {
            setshowScriptUploadError(true);
            return;
        }
        else if (!validPatient) {
            setshowCustomerSelect(true);
            return;
        }
        else if (
            medicationCount.length === 0 ||
            medicationCount.some(
                med =>
                    !med.MedicationID ||
                    !med.NumberOfRepeats ||
                    !med.Quantity ||
                    !med.instructions
            )
        ) {
            setshowMedicationError(true);
            return;
        }



    };




    const handleSaveDispense = async () => {
        const validUpload = uploadRef.current.validate();
        const validPatient = patientRef.current.validate();
        const validMedications = medicationRef.current.validate();

        if (medicationRef.current.getValues().medications.length === 0) {
            // alert("Please add at least one medication.");
            setshowMedicationError(true);
            return;
        }

        const noAllergyConflict = await medicationRef.current.validate();
        if (!noAllergyConflict) {
            //alert("Patient is allergic to one or more medications!");
            setconfirmationModal(false);
            return;
        }

        if (validUpload && validPatient && validMedications) {
            setShowError(false);
            setshowMedicationError(false);

            const uploadData = uploadRef.current.getValues();
            const patientData = patientRef.current.getValues();
            const medicationData = medicationRef.current.getValues();

            setconfirmationModal(false);
            setLoading(true)

            console.log("Upload total w quantity: ", medicationData);

            const formData = new FormData();
            formData.append("DoctorName", patientData.doctor);
            formData.append("PrescriptionBlob", uploadData.PrescriptionBlob);
            formData.append("Name", uploadData.Name);
            formData.append("Prescription", JSON.stringify(patientData));
            formData.append("Medications", JSON.stringify(medicationData.medications));
            formData.append("date", patientData.date.split("T")[0]);

            const prescriptionID = patientData?.prescriptionID;
            formData.append("prescriptionID", (prescriptionID != null && prescriptionID !== '') ? prescriptionID : -1);

            formData.append("TotalPrice", JSON.stringify(medicationData.TotalAmount));
            formData.append("VatAmount", JSON.stringify(medicationData.VatAmount));


            fetch(`${basePath}/api/UploadScript/addAndDispense-prescription`, {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem("jwtToken")}`,
                },
                body: formData,
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    return response.json(); 
                })
                .then(result => {
               

                    if (result.success) {
                        settoast({
                            visible: true,
                            message: result.message,
                            type: "success",
                            duration: 3000
                        });

                        //  alert("Prescription uploaded successfully!");
                        uploadRef.current.clearValues();
                        patientRef.current.clearValues();
                        medicationRef.current.clearValues();
                    } else {
                        settoast({
                            visible: true,
                            message: result.message || "An error occurred",
                            type: "error",
                            duration: 3000
                        });
                    }
                })
                .catch(error => {
                    console.error("Error saving prescription:", error);
                    alert("Failed to upload prescription.");
                });

            setTimeout(() => {
                setLoading(false);
            }, 5000);

        };

    }
    const patientdetails = patientRef.current?.getValues();


    const { setPageTitle } = usePageTitle();

    useEffect(() => {
        setPageTitle('Load Script');
        // You can also set document.title for browser tab
        document.title = 'Health Hive';
    }, [setPageTitle]);

    return (
        <div>
            <Loader isLoading={loading} />


            {toast.visible && (
                <ToastSuccess type={toast.type} message={toast.message} duration={toast.duration} />
            )}

            <div className="loadPrescontainer">

                <div className="loadPres">
                    <UploadPrescription
                        ref={uploadRef}
                        pdf={prescription?.prescriptionBlob}
                        fileName={prescription?.fileName}
                        disabled={sectionDisabled}
                    />

                    <PatientDetails
                        ref={patientRef}
                        personaldetails={prescription}
                        disabled={sectionDisabled}
                    />

                </div>

                {showCustomerSelect && (
                    <p style={{ color: "red", marginTop: "1rem" }}>
                        Please fill in all patient details.
                    </p>
                )}

                {showScriptUploadError && (
                    <p style={{ color: "red", marginTop: "1rem" }}>
                        Please upload a prescription.
                    </p>
                )}

                <label>
                    <input type="checkbox" checked={showDispense} onClick={showSavenDispense} />
                    Dispense now
                </label>

                <MedictionDetails
                    ref={medicationRef}
                    patientRef={patientRef}
                    setSectionDisabled={setSectionDisabled}
                />

                {showError && (
                    <p style={{ color: "red", marginTop: "1rem" }}>
                        Please fill in all required details.
                    </p>
                )}

                {showMedicationError && (
                    <p style={{ color: "red", marginTop: "1rem" }}>
                        Please add at least one medication.
                    </p>
                )}


                <div className="save-section">
                    {!showDispense && (
                        <button className="save-btn" onClick={confirmUpload}>
                            Save
                        </button>
                    )}


                    {showDispense && (
                        <button className="save-btn" onClick={confirmUpload} >
                            Save & Dispense
                        </button>
                    )}

                </div>
            </div>

            {confirmationModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Confirm Script Upload</h2>

                        <p>Upload Script for {patientdetails.customer}</p>

                        <div className="">
                            {!showDispense && (
                                <button className="btn-done" onClick={handleSave}>
                                    Yes
                                </button>
                            )}


                            {showDispense && (
                                <button className="btn-done" onClick={handleSaveDispense} >
                                    Yes
                                </button>
                            )}

                            <button className="btn-cancel" onClick={() => setconfirmationModal(false)}>No</button>

                        </div>


                    </div>
                </div>
            )}

        </div>
    );
}   

export default LoadPrescription;
