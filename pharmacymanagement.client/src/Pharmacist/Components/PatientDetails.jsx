/* eslint-disable no-unused-vars */
import { forwardRef, useImperativeHandle, useRef, useState, useEffect } from "react";
import { getData, postData } from "../../SharedComponents/apiService";
import '../PharmacistCSS_for_Components/LoadPrescriptionPage.css'
import Loader from "../../SharedComponents/Loader";
import ToastSuccess from "../../SharedComponents/ToastSuccessModal"
import Select from "react-select";


const PatientDetails = forwardRef(({ personaldetails, disabled = false }, ref) => {
    const fieldsRef = useRef({});
    //const { personaldetails } = props;
    const [showDoctorModal, setShowDoctorModal] = useState(false);
    const [showConfirmDoc, setshowConfirmDoc] = useState(false);
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [showConfromCust, setshowConfromCust] = useState(false);
    const [showAddCustomerModal, setshowAddCustomerModal] = useState(false);
    const [listDoctorsModal, setlistDoctorsModal] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [loading, setLoading] = useState(false);
    const [toast, settoast] = useState({ visible: false, message:"", type:"", duration: 3000 });

    const [doctorFields, setDoctorFields] = useState({
        name: "", surname: "", practice: "", contact: "", email: "", id:""
    });

    const [customerFields, setCustomerFields] = useState({
        name: "", surname: "", dob: "", address: "", gender: "", id: "", contact: "", email: "", allergy:""
    });

    const [doctorErrors, setDoctorErrors] = useState({});
    const [customerErrors, setCustomerErrors] = useState({});

    const [selectedCustomer, setSelectedCustomer] = useState(personaldetails?.customerName || "");
    const [selectedDoctor, setSelectedDoctor] = useState(personaldetails?.name || "");
    const [SelectedDoctorId, setSelectedDoctorId] = useState(personaldetails?.name || "");

    const [customers, setCustomers] = useState([]);
    const [doctors, setDoctors] = useState([]);

    // SEARCH AND PAGGINATION
    const [currentPage, setCurrentPage] = useState(1);
    const [currentPageDoctors, setcurrentPageDoctors] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchTermDoctors, setsearchTermDoctors] = useState("");
    const rowsPerPage = 5;

    // Filter customers by search
    const filteredCustomers = customers.filter((customer) =>
        (customer.name + " " + customer.surname + " " + customer.idNumber)
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
    );

    // Pagination logic
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = filteredCustomers.slice(indexOfFirstRow, indexOfLastRow);
    const totalPages = Math.ceil(filteredCustomers.length / rowsPerPage);

    const filteredDoctors = doctors.filter((doctor) =>
        (doctor.doctorName + " " + doctor.doctorSurname + " " + doctor.practiceNumber)
            .toLowerCase()
            .includes(searchTermDoctors.toLowerCase()) // separate search state
    );

    const indexOfLastDoctor = currentPageDoctors * rowsPerPage;
    const indexOfFirstDoctor = indexOfLastDoctor - rowsPerPage;
    const currentDoctorRows = filteredDoctors.slice(
        indexOfFirstDoctor,
        indexOfLastDoctor
    );
    const totalDoctorPages = Math.ceil(filteredDoctors.length / rowsPerPage);

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // reset to first page
    };

    // Pagination numbers (show max 3)
    const getPageNumbers = () => {
        let start = Math.max(1, currentPage - 1);
        let end = Math.min(totalPages, start + 2);

        // Adjust start if we are near the end
        if (end - start < 2) {
            start = Math.max(1, end - 2);
        }

        const pages = [];
        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    };

    ///Part where I fetch customers
    useEffect(() => {
        async function fetchCustomers() {
            try {
                setLoading(true)

                const result = await getData('/api/UploadScript/get-customers');
                setCustomers(Array.isArray(result) ? result : [result]);
            } catch (error) {
                console.error("Error fetching customers:", error);
                console.log("Couldnt Fetch scustomers");

            } finally {
                setLoading(false)

            }
        }

        fetchCustomers();
    }, []); // only runs once when component mounts


    //Here I fetsch Dodcors to load on the table
    useEffect(function fetchDoctors() {
        async function fetchDoctors() {
            try {
                setLoading(true)

                const result = await getData('/api/UploadScript/get-doctors')
                setDoctors(Array.isArray(result) ? result : [result]);
            }
            catch (error) {
                console.log("Cpuldnt fetch Doctors: ", error);
            } finally {
                setLoading(false)

            }
        }

        fetchDoctors();
    }, []);

    useEffect(() => {
        if (personaldetails?.name && customers.length > 0) {
            setSelectedCustomer(personaldetails.name);
            const selected = customers.find(c => c.name === personaldetails.name);
            if (selected) {
                if (fieldsRef.current.id) fieldsRef.current.id.value = selected.idNumber;
                if (fieldsRef.current.dob) fieldsRef.current.dob.value = selected.dob;
                if (fieldsRef.current.customer) fieldsRef.current.customer.value = selected.name;
                alert(`Allergies: ${selected.allergies}`);
            }
        }
    }, [personaldetails, customers]); // runs when either changes


    useImperativeHandle(ref, () => ({
        validate: () => {
            const customer = fieldsRef.current.customer?.value;
            const id = fieldsRef.current.id?.value;
            //   const dob = fieldsRef.current.dob?.value;
            const doctor = fieldsRef.current.doctor?.value;
            const DoctorID = fieldsRef.current.DoctorID?.value;
            const date = fieldsRef.current.date?.value;
            const allergy = fieldsRef.current.ingredient?.value;
            const prescriptionID = fieldsRef.current.prescriptionID?.value; 

            if (
                !customer || customer === "Select customer" ||
                !id || /*!dob||*/  !date||
                !doctor || doctor === "Select doctor" 
            ) {
                return false;
            }
            return true;
        },

        // 📝 ADDED: expose a method to get the form data
        getValues: () => ({
            customer: fieldsRef.current.customer?.value,
            CustomerID: fieldsRef.current.userID?.value,
            //    dob: fieldsRef.current.dob?.value,
            dispense : fieldsRef.current.dispense?.value,

            DoctorID: fieldsRef.current.DoctorID?.value,
            date: fieldsRef.current.date?.value,
            allergy: fieldsRef.current.ingredient?.value || fieldsRef.current.allergy?.value,
            prescriptionID: fieldsRef.current.prescriptionID?.value,
        }),

        clearValues: () => {
            if (fieldsRef.current.customer) fieldsRef.current.customer.value = "";
            if (fieldsRef.current.userID) fieldsRef.current.id.value = "";
            if (fieldsRef.current.doctor) fieldsRef.current.doctor.value = "";
            if (fieldsRef.current.dispense) fieldsRef.current.dispense.value = "";
            if (fieldsRef.current.DoctorID) fieldsRef.current.DoctorID.value = "";
            if (fieldsRef.current.date) fieldsRef.current.date.value = "";
            if (fieldsRef.current.ingredient) fieldsRef.current.ingredient.value = "";
            if (fieldsRef.current.ingredient) fieldsRef.current.allergy.value = "";
            if (fieldsRef.current.ingredient) fieldsRef.current.dispense.value = "";

            setSelectedCustomer("");
            setSelectedDoctor("");
            setSelectedDoctorId("");
        }
    }));

    /////Part Where I Select The Customer from the table
    function handleCustomerSelect(customer) {
        setSelectedCustomer(`${customer.name} ${customer.surname}`);

        //alert(`Allergies: ${customer.allergies}`);

        if (fieldsRef.current.id) fieldsRef.current.id.value = customer.idNumber;
        if (fieldsRef.current.userID) fieldsRef.current.userID.value = customer.userID;
        // if (fieldsRef.current.dob) fieldsRef.current.dob.value = customer.dob;
        //if (fieldsRef.current.dispense) fieldsRef.current.dispense.value = customer.dispense;
        if (fieldsRef.current.customer) fieldsRef.current.customer.value = customer.userName;
        if (fieldsRef.current.ingredient) fieldsRef.current.ingredient.value = customer.allergy;

        setshowAddCustomerModal(false);
    }

    /////Part Where I Select The Doctor from the table
    function handleSelectDoctor(doctor) {
        setSelectedDoctor(`${doctor.doctorName} ${doctor.doctorSurname}`);
        setSelectedDoctorId(`${doctor.doctorID}`);

        if (fieldsRef.current.doctorID) fieldsRef.current.doctorID.value = doctor.doctorID;
        if (fieldsRef.current.doctorName) fieldsRef.current.doctorName.value = doctor.doctorName;
        if (fieldsRef.current.doctorSurname) fieldsRef.current.doctorSurname.value = doctor.doctorSurname;
        if (fieldsRef.current.practiceNumber) fieldsRef.current.practiceNumber.value = doctor.practiceNumber;

        setlistDoctorsModal(false);
    }

    function confirmCust() {
        const errors = {};
        Object.entries(customerFields).forEach(([key, value]) => {
            if (key !== "allergy" && !value.trim()) errors[key] = true;
        });
        setCustomerErrors(errors);


        if (Object.keys(errors).length === 0) {
            setShowConfirmation(true);

            setshowConfromCust(true);
            setShowCustomerModal(false);
        }
    }

    function confirmDoc() {
        const errors = {};
        const namePattern = /^[A-Za-z\s'-]+$/;
        const practicePattern = /^\d{6}$/; // ✅ Only 6 digits allowed now
        const contactPattern = /^0\d{9}$/;
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        Object.entries(doctorFields).forEach(([key, value]) => {
            const trimmedValue = value.trim();

            // Required field check
            if (key !== "id" && !trimmedValue) {
                errors[key] = "This field is required";
            } else {
                // Field-specific validations
                if ((key === "name" || key === "surname") && !namePattern.test(trimmedValue)) {
                    errors[key] = "Only letters allowed";
                }

                if (key === "practice" && !practicePattern.test(trimmedValue)) {
                    errors[key] = "Practice number must be exactly 6 digits (e.g. 123456)";
                }

                if (key === "contact" && !contactPattern.test(trimmedValue)) {
                    errors[key] = "Must be a 10-digit SA number starting with 0";
                }

                if (key === "email" && !emailPattern.test(trimmedValue)) {
                    errors[key] = "Invalid email address";
                }
            }
        });

        // ✅ Check if the PR number already exists in your doctors list
        const practiceNum = doctorFields.practice.trim();
        const exists = doctors.some(doc => doc.practiceNumber === practiceNum);

        if (exists) {
            errors.practice = "This practice number already exists";
        }

        setDoctorErrors(errors);

        // stop if any errors found
        if (Object.keys(errors).length > 0) {
            return;
        }

        // ✅ if valid, continue your logic
        setShowConfirmation(true);
        setshowConfirmDoc(true);
        setShowDoctorModal(false);
    }


    // Part where I add new and Validate Doctor fields
    const handleDoctorDone = async () => {
        const errors = {};
        Object.entries(doctorFields).forEach(([key, value]) => {
            if (key !== "id" && !value.trim()) errors[key] = true;
        });

        setDoctorErrors(errors);

        if (Object.keys(errors).length === 0) {
            setShowConfirmation(true);
            setLoading(true);
            const { name, surname, practice, contact, email } = doctorFields;

            const addDocPayload = { DoctorName: name, DoctorSurname: surname, PracticeNumber: practice, ContactNumber: contact, Email:email };


            try {
                const result = await postData("/api/UploadScript/add-doctor", addDocPayload);
                setshowConfirmDoc(false);

                if (result.success) {
                    settoast({
                        visible: true,
                        message: result.message,
                        type: "success",
                        duration: 3000
                    })
                }
                else {
                    settoast({
                        visible: true,
                        message: result.message || "An error occured",
                        type: "error",
                        duration: 3000
                    })
                }
                // Optional: refresh doctor list
                const updatedDoctors = await getData("/api/UploadScript/get-doctors");
                setDoctors(Array.isArray(updatedDoctors) ? updatedDoctors : [updatedDoctors]);
            } catch (error) {
                console.error("Error saving doctor:", error);
                alert("Failed to add Doctor.");
            }

            setTimeout(() => {
                setShowDoctorModal(false);
                setShowConfirmation(false);
                setLoading(false);
                setDoctorFields({
                    name: "", surname: "", practice: "", contact: "", email: "", id: ""
                });
                setDoctorErrors({});
            }, 1000);
        }
    };


    // Part where I add new and Validate Customer fields
    const handleCustomerDone = async () => {
        const errors = {};
        Object.entries(customerFields).forEach(([key, value]) => {
            if (key !== "allergy" &&!value.trim()) errors[key] = true;
        });
        setCustomerErrors(errors);


        if (Object.keys(errors).length === 0) {
            setShowConfirmation(true);
           
            setLoading(true);

            const { name, surname, dob, address, gender, id, contact, email, allergy } = customerFields;

            const addCustomerPayLoad = {
                user: {
                    IDNumber: id,
                    DOB: dob,
                    Name: name,
                    Surname: surname,
                    AddressLine: address,
                    Email: email,
                    PhoneNumber: contact,
                    Gender: gender
                },
                customerAllergies: selectedAllergies.map((id) => ({
                    ActiveIngredientID: id  
                }))
            };
           

            try {
                const result = await postData("/api/UploadScript/add-customer", addCustomerPayLoad);
                setshowConfromCust(false);
                if (result.success) {
                    settoast({
                        visible: true,
                        message: result.message,
                        type: "success",
                        duration: 3000
                    })
                }
                else {
                    settoast({
                        visible: true,
                        message: result.message || "An error occured",
                        type: "error",
                        duration: 3000
                    })
                }
                //Here I am Updating the Customer List
                const UpdatedCustomers = await getData("/api/UploadScript/get-customers");
                setCustomers(Array.isArray(UpdatedCustomers) ? UpdatedCustomers : [UpdatedCustomers]);

            } catch (error) {
                console.log(error);
                alert("Failed to add Customer");
            }

            setTimeout(() => {
                setShowCustomerModal(false);
                setShowConfirmation(false);
                setLoading(false);
                setCustomerFields({
                    name: "", surname: "", dob: "", address: "", gender: "", id: "", contact: "", email: "", allergy:""
                });
                console.log("presses");
                setCustomerErrors({});      // 👈 clear errors here
                setSelectedAllergies([]);   // 👈 clear selected allergies here
                
            }, 3000);
        }
    };

    // dealing with allergies

    const [selectedAllergy, setSelectedAllergy] = useState("");
    const [availableAllergies, setAvailableAllergies] = useState([""]);

    // dealing with allergies
    /////Part where I select Active Ingredients
     useEffect(function fetchActiveIngredients() {
            async function fetchActiveIngredients(){
                try {
                    const result = await getData('/api/UploadScript/get-activeIngredients');
                    setAvailableAllergies(Array.isArray(result) ? result : [result]);
                    //console.log("Fetched allergies: ", result);
                }
                catch (error) {
                    console.log("Couldn't fetch Allergies: ", error);
                }
            }

            fetchActiveIngredients();
        }, [])
   

    const [selectedAllergies, setSelectedAllergies] = useState([]);

    const handleAddAllergy = () => {
        if (selectedAllergy && !selectedAllergies.includes(selectedAllergy)) {
            setSelectedAllergies((prev) => [...prev, selectedAllergy]);
            setSelectedAllergy("");
        }
    };

    const handleRemoveAllergy = (index) => {
        const updated = [...selectedAllergies];
        updated.splice(index, 1);
        setSelectedAllergies(updated);
    };


    return (
        <div className="section patient-details">
            <Loader isLoading={loading} />
            {toast.visible && (
                <ToastSuccess type={toast.type} message={toast.message} duration={toast.duration } />
            ) }

            <h3>Patient Details</h3>

            <label style={{ display: 'block', marginBottom: '1rem' }}>
                Customer:
                <input
                    type="text"
                    ref={(el) => (fieldsRef.current.customer = el)}
                    value={selectedCustomer}
                    placeholder="Click here to select"
                    readOnly
                    disabled={disabled}
                    onClick={() => setshowAddCustomerModal(true)}
                    className="searching"
                /><span className="ValidationAsteric">*</span>
                <button type="button" disabled={disabled} onClick={() => setshowAddCustomerModal(true)} className="process-btn " title="Click to select customer"> <i class="fa-solid fa-magnifying-glass"></i> </button> 


                <button type="button" onClick={() => setShowCustomerModal(true)} className="process-btn" disabled={disabled} title="Click to add new customer">Add New</button>
            </label>

            <label style={{ display: 'block', marginBottom: '1rem' }}>
                ID Number:
                <input type="text" disabled={disabled} readOnly ref={(el) => fieldsRef.current.id = el} value={personaldetails?.idNumber} /> <span className="ValidationAsteric">*</span>
                <input type="text" hidden ref={(el) => fieldsRef.current.userID = el} value={personaldetails?.userID} />
                <input type="hidden" ref={el => fieldsRef.current.ingredient = el} />

            </label>

            <input
                type="hidden"
                ref={(el) => (fieldsRef.current.prescriptionID = el)} value={personaldetails?.prescriptionID}
            />

            <input
                type="hidden"
                ref={(el) => (fieldsRef.current.allergy = el)} value={personaldetails?.allergy}
            />

            <input
                type="hidden"
                ref={(el) => (fieldsRef.current.dispense = el)} value={personaldetails?.dispense}
            />

            {/*<label style={{ display: 'block', marginBottom: '1rem' }}>*/}
            {/*    DOB:*/}
            {/*    <input type="text" readOnly ref={(el) => fieldsRef.current.dob = el} value={personaldetails?.dob.split("T")[0] } />*/}
            {/*</label>*/}



            <label style={{ display: 'block', marginBottom: '1rem' }}>
                Doctor:

                <input type="text" readOnly placeholder="Click here to select doctor " className="searching" ref={(el) => fieldsRef.current.doctor = el} value={selectedDoctor} disabled={disabled} onClick={() => setlistDoctorsModal(true)} /> <span className="ValidationAsteric">*</span>
                <input type="text" hidden ref={(el) => fieldsRef.current.DoctorID = el} value={SelectedDoctorId} disabled={disabled} /> 
                
                <button type="button" onClick={() => setlistDoctorsModal(true)} className="process-btn searching" title="Click to select doctor" disabled={disabled} > <i class="fa-solid fa-magnifying-glass"></i> </button> 
                <button type="button" onClick={() => setShowDoctorModal(true)} className="process-btn" title="Click to add new doctor" disabled={disabled}>Add New</button>
            </label>

            <label style={{ display: 'block', marginBottom: '1rem' }}>
                Prescription Date:
                <input type="date"
                    ref={(el) => fieldsRef.current.date = el}     
                    max={new Date().toISOString().split("T")[0]} // prevents selecting future dates
                    disabled={disabled}
                /> <span className="ValidationAsteric">*</span>
            </label>

            {/*Confirm Customer */}
            {showConfirmDoc && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2> Confirm Doctor</h2>

                        <div className="content-afterhead">
                            <div className="sideToSide">
                                <div>
                                    <p>Name:</p>
                                    <p>Surname:</p>
                                    <p>Practice Number:</p>
                                    <p>Contact:</p>
                                    <p>Email:</p>
                                </div>

                                <div>
                                    <p>{doctorFields.name}</p>
                                    <p>{doctorFields.surname}</p>
                                    <p>{doctorFields.practice}</p>
                                    <p>{doctorFields.contact}</p>
                                    <p>{doctorFields.email}</p>
                                    
                                </div>
                            </div>

                            <div className="Acustomer-btns">
                                <button className="btn-done" onClick={handleDoctorDone}>Done</button>
                                <button
                                    className="btn-cancel"
                                    onClick={() => {
                                        setshowConfirmDoc(false);
                                        setSelectedAllergies([]);
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>

                        </div>

                    </div>
                </div>
            )}

            {/* Add Doctor Modal */}
            {showDoctorModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Add New Doctor</h2>

                        {["name", "surname", "practice", "contact", "email"].map((field) => (
                            <label key={field}>
                                {field.charAt(0).toUpperCase() +
                                    field
                                        .slice(1)
                                        .replace(/practice/, "Practice Number")
                                        .replace(/contact/, "Contact Number")}
                                :
                                <span className="ValidationAsteric">*</span>

                                <input
                                    type="text"
                                    value={doctorFields[field]}
                                    maxLength={20}  
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        let errorMessage = "";
                                        {

                                            // Validation rules
                                            if (field === "name" || field === "surname") {
                                                const namePattern = /^[A-Za-z\s'-]+$/;
                                                if (!namePattern.test(value) && value !== "") {
                                                    errorMessage = "Only letters allowed";
                                                }
                                            }

                                            if (field === "practice") {
                                                const practicePattern = /^\d{6}$/;
                                                const trimmedValue = value.trim();

                                                // Validate format
                                                if (!practicePattern.test(trimmedValue) && trimmedValue !== "") {
                                                    errorMessage = "Format must be 6 digits (e.g. 125654)";
                                                }
                                                // ✅ Check if practice number already exists
                                                else if (doctors.some(doc => doc.practiceNumber === trimmedValue)) {
                                                    errorMessage = "This practice number already exists";
                                                }
                                            }

                                            if (field === "contact") {
                                                const contactPattern = /^0\d{9}$/;
                                                if (!contactPattern.test(value) && value !== "") {
                                                    errorMessage = "Must be a 10-digit SA number starting with 0";
                                                }
                                            }

                                            if (field === "email") {
                                                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                                                if (!emailPattern.test(value) && value !== "") {
                                                    errorMessage = "Invalid email address";
                                                }
                                            }

                                            // Update states
                                            setDoctorFields({ ...doctorFields, [field]: value });
                                            setDoctorErrors({ ...doctorErrors, [field]: errorMessage });
                                        }
                                    }}
                                    style={doctorErrors[field] ? { border: "1px solid red" } : {}}
                                />

                                {doctorErrors[field] && (
                                    <p style={{ color: "red", fontSize: "0.8em", marginTop: "4px" }}>
                                        {doctorErrors[field]}
                                    </p>
                                )}
                            </label>
                        ))}


                        <div>
                            <button className="btn-done" onClick={confirmDoc}>Done</button>
                            <button className="btn-cancel" onClick={() => setShowDoctorModal(false)}>Cancel</button>
                        </div>

                        {/*{showConfirmation ? (*/}
                        {/*    <div className="confirmation-text">Doctor added successfully!</div>*/}
                        {/*) : (*/}
                        {/*    <div>*/}
                        {/*        <button className="btn-done" onClick={confirmDoc}>Done</button>*/}
                        {/*        <button className="btn-cancel" onClick={() => setShowDoctorModal(false)}>Cancel</button>*/}
                        {/*    </div>*/}
                        {/*)}*/}
                    </div>
                </div>
            )}

            {/*Confirm Customer */ }
            {showConfromCust && (
                <div className= "modal-overlay">
                    <div className="modal-content">
                        <h2> Confirm Customer</h2>

                        <div className="content-afterhead">
                            <div className ="sideToSide">
                                <div>
                                    <p>Name:</p>
                                    <p>Surname:</p>
                                    <p>ID Number:</p>
                                    <p>Date of birth:</p>
                                    <p>Gender:</p>
                                    <p>Contact:</p>
                                    <p>Email:</p>
                                    <p>Address:</p>
                                </div>

                                <div>
                                    <p>{customerFields.name }</p>
                                    <p>{customerFields.surname }</p>
                                    <p>{customerFields.id}</p>
                                    <p>{customerFields.dob}</p>
                                    <p>{customerFields.gender}</p>
                                    <p>{customerFields.contact}</p>
                                    <p>{customerFields.email}</p>
                                    <p>{customerFields.address}</p>
                                </div>
                            </div>
                            
                            <div className="Acustomer-btns">
                                <button className="btn-done" onClick={handleCustomerDone}>Done</button>
                                <button
                                    className="btn-cancel"
                                    onClick={() => {
                                        setshowConfromCust(false);
                                        setSelectedAllergies([]);
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>

                        </div>

                    </div>
                </div>
            ) }

            {/* Add Customer Modal */}
            {showCustomerModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Add New Customer</h2>
                        <div className="content-afterhead">

                            <div className="form-grid">
                                {["name", "surname", "gender", "id", "dob", "contact", "email", "address"].map((field) => (
                                    <div className="form-group" key={field}>
                                        <label>
                                            {field.toUpperCase() === "DOB"
                                                ? "DOB"
                                                : field.toUpperCase() === "ID"
                                                    ? "ID Number"
                                                    : field.toUpperCase() === "CONTACT"
                                                        ? "Contact Number"
                                                        : field.charAt(0).toUpperCase() + field.slice(1)}{" "}
                                            <span className="ValidationAsteric">*</span>
                                        </label>

                                        {field === "dob" ? (
                                            <input
                                                type="date"
                                                value={customerFields[field]}
                                                onChange={(e) => setCustomerFields({ ...customerFields, [field]: e.target.value })}
                                                max={new Date().toISOString().split("T")[0]}
                                                style={customerErrors[field] ? { border: "1px solid red" } : {}}
                                            />
                                        ) : field === "email" ? (
                                                <div>
                                                    <input
                                                        type="email"
                                                        value={customerFields[field]}
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            // Check email format
                                                            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                                                            let errorMessage = !emailPattern.test(value) ? "Invalid email address" : "";

                                                            { console.log("Check email: ", customers) }

                                                            if (value) {
                                                                const exists = customers.some(
                                                                    (c) => c?.email && c.email.toLowerCase() === value.toLowerCase()
                                                                );
                                                                if (exists) errorMessage = "This email already exists";
                                                            }

                                                            setCustomerErrors({ ...customerErrors, [field]: errorMessage });
                                                            setCustomerFields({ ...customerFields, [field]: value });
                                                        }}
                                                        style={customerErrors[field] ? { border: "1px solid red" } : {}}
                                                        placeholder="Enter email"
                                                    />
                                                    {customerErrors[field] && (
                                                        <span style={{ color: "red", fontSize: "12px" }}>{customerErrors[field]}</span>
                                                    )}
                                                </div>
                                            ) : field === "contact" ? (
                                            <input
                                                type="text"
                                                value={customerFields[field]}
                                                onChange={(e) => {
                                                    let value = e.target.value.replace(/\D/g, "");
                                                    if (value.length > 10) value = value.slice(0, 10);
                                                    if (value === "" || value.startsWith("0")) setCustomerFields({ ...customerFields, [field]: value });
                                                }}
                                                style={customerErrors[field] ? { border: "1px solid red" } : {}}
                                            />
                                        ) : field === "id" ? (
                                            <div>
                                                <input
                                                    type="text"
                                                    value={customerFields[field] || ""}
                                                    onChange={(e) => {
                                                        let value = e.target.value.replace(/\D/g, "");
                                                        if (value.length > 13) value = value.slice(0, 13);

                                                        let errorMessage = "";
                                                        if (value.length >= 6) {
                                                            const month = value.slice(2, 4);
                                                            const day = value.slice(4, 6);
                                                            if (!(parseInt(month) >= 1 && parseInt(month) <= 12) || !(parseInt(day) >= 1 && parseInt(day) <= 31)) {
                                                                errorMessage = "Invalid date format (must start with YYMMDD)";
                                                            }
                                                        }

                                                        const exists = customers.some((c) => c?.idNumber && String(c.idNumber) === value);
                                                        if (exists) errorMessage = "This ID already exists";

                                                        setCustomerErrors({ ...customerErrors, [field]: errorMessage });
                                                        setCustomerFields({ ...customerFields, [field]: value });
                                                    }}
                                                    style={{
                                                        border: customerErrors[field] ? "2px solid red" : "1px solid #ccc",
                                                        backgroundColor: customerErrors[field] ? "#ffe6e6" : "white",
                                                    }}
                                                />
                                                {customerErrors[field] && (
                                                    <p style={{ color: "red", fontSize: "0.85em", marginTop: "4px" }}>{customerErrors[field]}</p>
                                                )}
                                            </div>
                                        ) : field === "gender" ? (
                                            <select
                                                value={customerFields[field]}
                                                onChange={(e) => setCustomerFields({ ...customerFields, [field]: e.target.value })}
                                                style={customerErrors[field] ? { border: "1px solid red" } : {}}
                                            >
                                                <option value="">Select gender</option>
                                                <option>Male</option>
                                                <option>Female</option>
                                            </select>
                                        ) : (
                                            <div>
                                                <input
                                                    type="text"
                                                    value={customerFields[field]}
                                                    maxLength={20}  
                                                    onChange={(e) => {
                                                        let value = e.target.value;

                                                        // Prevent numbers in name and surname
                                                        if ((field === "name" || field === "surname") && /\d/.test(value)) {
                                                            setCustomerErrors({ ...customerErrors, [field]: "Numbers are not allowed in this field" });
                                                            return;
                                                        } else {
                                                            setCustomerErrors({ ...customerErrors, [field]: "" });
                                                        }

                                                        setCustomerFields({ ...customerFields, [field]: value });
                                                    }}
                                                    style={customerErrors[field] ? { border: "1px solid red" } : {}}
                                                />
                                                {customerErrors[field] && (
                                                    <span style={{ color: "red", fontSize: "12px" }}>{customerErrors[field]}</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "95%", marginBottom: "1rem" }}>
                                <Select
                                    options={availableAllergies.map(allergy => ({
                                        value: allergy.activeIngredientID,
                                        label: allergy.ingredient
                                    }))}
                                    onChange={(selectedOption) => {
                                        if (selectedOption && !selectedAllergies.includes(selectedOption.value)) {
                                            setSelectedAllergies([...selectedAllergies, selectedOption.value]);
                                        }
                                    }}
                                    placeholder="Select allergy"
                                    isSearchable
                                />

                                <div className="selected-allergies" style={{ marginTop: "0.5rem" }}>
                                    {selectedAllergies.map((id, index) => {
                                        const allergy = availableAllergies.find(a => a.activeIngredientID === id);
                                        return (
                                            <span key={index} className="allergy-chip">
                                                {allergy?.ingredient || id}
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const updated = [...selectedAllergies];
                                                        updated.splice(index, 1);
                                                        setSelectedAllergies(updated);
                                                    }}
                                                    style={{ marginLeft: "5px" }}
                                                >
                                                    &times;
                                                </button>
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>                            
                        </div>

                        <div className="Acustomer-btns">
                            <button className="btn-done" onClick={confirmCust}>Done</button>
                            <button
                                className="btn-cancel"
                                onClick={() => {
                                    setShowCustomerModal(false);
                                    setSelectedAllergies([]);
                                }}
                            >
                                Cancel
                            </button>
                            </div>

                       
                       
                    </div>
                </div>
            )}

            {/* Customer List Modal */}
            {showAddCustomerModal && (
                <div className="modal-overlay">
                    <div className="modal-content">

                        <h2>Customers</h2>

                        <button className="closeButton" onClick={() => setshowAddCustomerModal(false)}>Close</button>
                        <input
                            type="search"
                            placeholder="Search By Name or ID"
                            value={searchTerm}
                            onChange={handleSearch}
                            />

                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Surname</th>
                                    <th>ID Number</th>
                                </tr>
                            </thead>

                            <tbody>
                                {currentRows.length > 0 ? (
                                    currentRows.map((customer, index) => (
                                        <tr key={index} onClick={() => handleCustomerSelect(customer)}>
                                            <td>{customer.name}</td>
                                            <td>{customer.surname}</td>
                                            <td>{customer.idNumber}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" style={{ textAlign: "center" }}>
                                            No results found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        {filteredCustomers.length > 0 && (
                            <div style={{ marginTop: "10px" }}>
                                <button onClick={handlePrevPage} disabled={currentPage === 1}>
                                    Prev
                                </button>

                                {getPageNumbers().map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        style={{
                                            fontWeight: currentPage === page ? "bold" : "normal",
                                        }}
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button onClick={handleNextPage} disabled={currentPage === totalPages}>
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Doctor List Modal */}
            {listDoctorsModal && (
                <div className="modal-overlay">
                    <div className="modal-content">

                        <h2>Doctors</h2>
                        <button onClick={() => setlistDoctorsModal(false)}>Close</button>

                        <input
                            type="search"
                            placeholder="Search By Name or ID"
                            value={searchTermDoctors}
                            onChange={(e) => {
                                setsearchTermDoctors(e.target.value);
                                setcurrentPageDoctors(1);
                            }}
                        />

                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Surname</th>
                                    <th>Practice Number</th>
                                </tr>
                            </thead>

                            <tbody>
                                {currentDoctorRows.length > 0 ? (
                                    currentDoctorRows.map((doctor, index) => (
                                        <tr key={index} onClick={() => handleSelectDoctor(doctor)}>
                                            <td>{doctor.doctorName}</td>
                                            <td>{doctor.doctorSurname}</td>
                                            <td>{doctor.practiceNumber}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" style={{ textAlign: "center" }}>
                                            No results found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {/* Pagination for Doctors */}
                        {filteredDoctors.length > 0 && (
                            <div style={{ marginTop: "10px" }}>
                                <button
                                    onClick={() => setcurrentPageDoctors(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPageDoctors === 1}
                                >
                                    Prev
                                </button>

                                {(() => {
                                    let start = Math.max(1, currentPageDoctors - 1);
                                    let end = Math.min(totalDoctorPages, start + 2);
                                    if (end - start < 2) start = Math.max(1, end - 2);

                                    const pages = [];
                                    for (let i = start; i <= end; i++) pages.push(i);

                                    return pages.map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => setcurrentPageDoctors(page)}
                                            style={{
                                                fontWeight: currentPageDoctors === page ? "bold" : "normal",
                                            }}
                                        >
                                            {page}
                                        </button>
                                    ));
                                })()}

                                <button
                                    onClick={() => setcurrentPageDoctors(prev => Math.min(prev + 1, totalDoctorPages))}
                                    disabled={currentPageDoctors === totalDoctorPages}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

        </div>
    );
});

export default PatientDetails;
