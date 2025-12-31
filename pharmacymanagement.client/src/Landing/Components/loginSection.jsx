import React, { useRef, useEffect, useState } from 'react';
import '../landingcss/loginSection.css'; 
import GeneralModal from '../../SharedComponents/GeneralModal';
import CustomerButton from '../../Customer/Components/CustomerButton';
import Select from 'react-select';
import { useNavigate } from "react-router-dom";
import '../landingcss/loginSection.css';
import Loader from '../../SharedComponents/Loader';
import SuccessModal from "../../SharedComponents/SuccessModal";
function LoginSection() {
    const basePath = process.env.NODE_ENV === 'production' ? '/GRP-04-11' : '';
    const [loading, setLoading] = useState(false)

    //state variables
    let NameRef = useRef();
    let SurnameRef = useRef();
    let IDNumberRef = useRef();
    let EmailRef = useRef();
    let PasswordRef = useRef();
    let ConfirmPasswordRef = useRef(); 
    let phoneNumberRef = useRef();
    let PasswordLoginRef = useRef();
    let EmailLoginRef = useRef(); 
    let selectedAllegyRef = useRef();

    //validation refs
    let NameValidationRef = useRef();
    let SurnameValidationRef = useRef();
    let IdNumberValidationRef = useRef();
    let EmailValidationRef = useRef();
    let PhoneNumberValidationRef = useRef();
    let PasswordValidationRef = useRef();
    let ConfirmPasswordValidationRef = useRef();


    /*let EmailLoginRef = useRef();*/
    const navigate = useNavigate();
    const [allergies, setAllergies] = useState([]);
    const [selectedAllergy, setSelectedAllergy] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showForgotPassword, setshowForgotPassword] = useState(false);
    const [PasswordVisible, setPasswordVisible] = useState("password");
    const [PasswordVisibleRegister, setPasswordVisibleRegister] = useState("password");
    const [PasswordVisibleConfirm, setPasswordVisibleConfirm] = useState("password");
    const [PasswordIcon, setPasswordIcon] = useState("fa-solid fa-eye-slash")
    const [PasswordIconRegister, setPasswordIconRegisters] = useState("fa-solid fa-eye-slash")
    const [PasswordIconConfirm, setPasswordIconConfirm] = useState("fa-solid fa-eye-slash")
    const [SuccessRegister, setSuccessRegister] = useState(false);
    const [IncorrectDetails, setIncorrectDetails] = useState(false);


    //fogot pasword
    const [ForgotPassID, setForgotPassID] = useState(null);
    const [ForgotPassEmail, setForgotPassEmail] = useState(null);
    const [UserExists, setUserExists] = useState(false);
    const [ForgotSuccess, setForgotSuccess] = useState(false);

    //showing errors for forgotpassword
    const [ShowErrorEmail, setShowErrorEmail] = useState(false);
    const [ShowErrorID, setShowErrorID] = useState(false);

    useEffect(() => {
        fetch(`${basePath}/api/Customer/getAllergies`)
            .then(response => response.json())
            .then(data => {
                setAllergies(data);
            })
            .catch(error => {
                console.error("Fetch error:", error);
            });
    }, []);


    const ResetPassword = () => {
        let valid = true;
        let IdError = document.querySelector(".id-error");
        let EmailError = document.querySelector(".email-error");
        // Email validation regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        

        // Validate ID number
        if (!ForgotPassID || ForgotPassID.trim() === "") {

            IdError.textContent = "Please enter your ID number.";
            valid = false;
        }
        else if (ForgotPassID.length !== 13) {
            IdError.textContent = "ID number must be exactly 13 digits long."
            valid = false;
        }
        else if (!/^[0-9]+$/.test(ForgotPassID)) {
            IdError.textContent = "ID number must contain numbers only."
            valid = false;
        }
        else {
            IdError.textContent = "";
            valid = true;
        }

        // Validate email
        if (!ForgotPassEmail || ForgotPassEmail.trim() === "") {
            EmailError.textContent = "Please enter your email address.";
            valid = false;
        } else if (!emailRegex.test(ForgotPassEmail)) {
            EmailError.textContent = "Please enter a valid email address.";
            valid = false;
        }
        else {
            EmailError.textContent = "";
            valid = true;
        }


        // Stop if invalid
        if (!valid) {
            return;
        }
        
        let forgotPassword = {
            Email: ForgotPassEmail,
            IDNumber: ForgotPassID
        }
        setLoading(true);
        fetch(`${basePath}/api/Authenticate/reset-password`, {
            method: "POST",
            headers: {
                'Content-Type': "application/json",
            },
            body: JSON.stringify(forgotPassword)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Failed to fetch allergies");
                }
                return response.json();
            })
            .then(data => {
                if (data != null) {
                    setshowForgotPassword(false);
                    setForgotSuccess(true);
                }
                
                setLoading(false);
            })
            .catch(error => {
                setUserExists(true);
                setLoading(false);
            });

    }
    const validationForm = () => {
        let valid = true;


        if (NameRef.current.value.trim() === "") { //name validation 
            NameValidationRef.current.classList.add("show-valiation-register");
            NameValidationRef.current.textContent = "Name is required."
            valid = false;
        }
        else if (!/^[A-Za-z]+$/.test(NameRef.current.value.trim())) { 
            NameValidationRef.current.classList.add("show-valiation-register");
            NameValidationRef.current.textContent = "Name should contain letters only."
            valid = false;
        }
        else {
            NameValidationRef.current.classList.remove("show-valiation-register");
        }

        if (SurnameRef.current.value.trim() === "") { //surname validation 
            SurnameValidationRef.current.classList.add("show-valiation-register");
            SurnameValidationRef.current.textContent = "Surname is required";
            valid = false;
        }
        else if (!/^[A-Za-z]+$/.test(SurnameRef.current.value.trim())) {
            SurnameValidationRef.current.classList.add("show-valiation-register");
            SurnameValidationRef.current.textContent = "Surname should contain letters only.";
            valid = false;
        }
        else {
            SurnameValidationRef.current.classList.remove("show-valiation-register");
        }

        //if (IDNumberRef.current.value.trim() === "") { //Id number validation
        //    IdNumberValidationRef.current.classList.add("show-valiation-register");
        //    IdNumberValidationRef.current.textContent = "ID number is required."
        //    valid = false;
        //}
        //else if (IDNumberRef.current.value.length != 13) {
        //    IdNumberValidationRef.current.classList.add("show-valiation-register");
        //    IdNumberValidationRef.current.textContent = "ID number must be 13 digits long."
        //    valid = false;
        //}
        //else if (!/^\d{13}$/.test(IDNumberRef.current.value.trim())) {
        //    IdNumberValidationRef.current.classList.add("show-valiation-register");
        //    IdNumberValidationRef.current.textContent = "ID number must contain numbers only."
        //    valid = false;
        //}
        //else {
        //    IdNumberValidationRef.current.classList.remove("show-valiation-register");
        //}
        if (IDNumberRef.current.value.trim() === "") { // required
            IdNumberValidationRef.current.classList.add("show-valiation-register");
            IdNumberValidationRef.current.textContent = "ID number is required.";
            valid = false;
        }
        else if (IDNumberRef.current.value.length !== 13) { // must be 13 digits
            IdNumberValidationRef.current.classList.add("show-valiation-register");
            IdNumberValidationRef.current.textContent = "ID number must be 13 digits long.";
            valid = false;
        }
        else if (!/^\d{13}$/.test(IDNumberRef.current.value.trim())) { // digits only
            IdNumberValidationRef.current.classList.add("show-valiation-register");
            IdNumberValidationRef.current.textContent = "ID number must contain digits only.";
            valid = false;
        }
        else {
            //  Extract and validate date part (first 6 digits)
            const id = IDNumberRef.current.value.trim();
            const year = parseInt(id.substring(0, 2), 10);
            const month = parseInt(id.substring(2, 4), 10);
            const day = parseInt(id.substring(4, 6), 10);

            // Guess century (e.g., 990101 -> 1999 or 2000)
            const fullYear = year > 25 ? 1900 + year : 2000 + year;

            // Create date object
            const date = new Date(fullYear, month - 1, day);

            // Check if valid calendar date
            if (
                date.getFullYear() !== fullYear ||
                date.getMonth() + 1 !== month ||
                date.getDate() !== day
            ) {
                IdNumberValidationRef.current.classList.add("show-valiation-register");
                IdNumberValidationRef.current.textContent = "ID number contains an invalid date of birth.";
                valid = false;
            } else {
                IdNumberValidationRef.current.classList.remove("show-valiation-register");
            }
        }

        if (EmailRef.current.value.trim() === "") { //email valiation
            EmailValidationRef.current.classList.add("show-valiation-register");
            EmailValidationRef.current.textContent = "Email is required."
            valid = false;
        }
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(EmailRef.current.value.trim())) {
            EmailValidationRef.current.classList.add("show-valiation-register");
            EmailValidationRef.current.textContent = "Email is invalid."
            valid = false;
        }
        else {
            EmailValidationRef.current.classList.remove("show-valiation-register");
        }

        if (phoneNumberRef.current.value.trim() === "") { //phone number validation
            PhoneNumberValidationRef.current.classList.add("show-valiation-register");
            PhoneNumberValidationRef.current.textContent = "Phone number is required."
            valid = false;
        }
        else if (phoneNumberRef.current.value.length != 10) {
            PhoneNumberValidationRef.current.classList.add("show-valiation-register");
            PhoneNumberValidationRef.current.textContent = "Phone number must be 10 digits long."
        }
        else if (!/^\d+$/.test(phoneNumberRef.current.value.trim())) { 
            PhoneNumberValidationRef.current.classList.add("show-valiation-register");
            PhoneNumberValidationRef.current.textContent = "Phone number must contain digits only.";
            valid = false;
        }
        else if (!phoneNumberRef.current.value.startsWith("0")) { // must start with 0
            PhoneNumberValidationRef.current.classList.add("show-valiation-register");
            PhoneNumberValidationRef.current.textContent = "Phone number must start with 0.";
            valid = false;
        }
        else {
            PhoneNumberValidationRef.current.classList.remove("show-valiation-register");
        }

        if (PasswordRef.current.value.trim() === "") { //password validation
            PasswordValidationRef.current.classList.add("show-valiation-register");
            PasswordValidationRef.current.textContent = "Password is required.";
            valid = false;
        }
        else {
            PasswordValidationRef.current.classList.remove("show-valiation-register");
        }

        if (ConfirmPasswordRef.current.value.trim() === "") { //confirm password validation
            ConfirmPasswordValidationRef.current.classList.add("show-valiation-register");
            ConfirmPasswordValidationRef.current.textContent = "Confirm password is required.";
            valid = false;
        }
        else {
            ConfirmPasswordValidationRef.current.classList.remove("show-valiation-register");
        }

        if (ConfirmPasswordRef.current.value.trim() !== PasswordRef.current.value.trim()) {
            ConfirmPasswordValidationRef.current.classList.add("show-valiation-register");
            ConfirmPasswordValidationRef.current.textContent = "Confirm password doesnt match password.";
            PasswordValidationRef.current.classList.add("show-valiation-register");
            PasswordValidationRef.current.textContent = "Password doesnt match confirm paswword.";

            valid = false;
        } else {
            ConfirmPasswordValidationRef.current.classList.remove("show-valiation-register");
            PasswordValidationRef.current.classList.remove("show-valiation-register");
        }

        
        return valid;
    }


    const RegisterUser = () => { //register method

        let valid = validationForm();
        
        if (valid) { 
            let user = {
                Name: NameRef.current.value,
                Surname: SurnameRef.current.value,
                IDNumber: IDNumberRef.current.value,
                Email: EmailRef.current.value,
                Password: PasswordRef.current.value,
                Allergies: selectedAllergy,
                PhoneNumber: phoneNumberRef.current.value
            }
            setLoading(true);

            fetch(`${basePath}/api/Customer/regiser`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'//type of data being sent should be json format
                },
                body: JSON.stringify(user) // data being sent and in a json format stringify
            })
                .then(async response => {
                    setLoading(false);
                    const result = await response.json(); // Wait for JSON to be parsed

                    if (response.ok) {
                        setSuccessRegister(true);
                        NameRef.current.value = "";
                        SurnameRef.current.value = "";
                        IDNumberRef.current.value = "";
                        EmailRef.current.value = "";
                        PasswordRef.current.value = "";
                        setSelectedAllergy([]);
                        phoneNumberRef.current.value = "";
                        console.log("Server Message:", result.message);
                    } else {
                       /* alert(result.message);*/
                        ConfirmPasswordValidationRef.current.classList.add("show-valiation-register");
                        ConfirmPasswordValidationRef.current.textContent = result.message;
                    }
                })
            .catch(error => {
                console.error("Error fetching allergies:", error);
                setLoading(false);
            });
            }
        

    }

    const LoginIn = async () => {
        const user = {
            Email: EmailLoginRef.current.value,
            Password: PasswordLoginRef.current.value
        };

        try {
            setLoading(true);
            const response = await fetch(`${basePath}/api/Authenticate/authenticate`, {
                method: "POST",
                headers: {
                    'Content-Type': "application/json"
                },
                body: JSON.stringify(user)
            });

            if (!response.ok) {
                setIncorrectDetails(true);
                return;
            }

            const result = await response.json();

            localStorage.setItem("jwtToken", result.token);

            const role = result.data.userType;

            {console.log("Getting first log: ",result.data )}
            setLoading(false);
            if (role === "C") {
                navigate("/Customer")
            }
            else if (role === "P" && result.data.isFirst === 1) {
                navigate("/Pharmacist/Settings")

            }
            else if (role === "P") {
                navigate("/Pharmacist")
            }
            else if (role === "M") {
                navigate("/PharmacyManager")
            }
        } catch (error) {
            console.error("Fetch upload error:", error);
            alert("Login failed: " + error.message);
        } finally {
            setLoading(false)
        }
    }
    const containerRef = useRef(null);

    const handleRegisterClick = () => {
        containerRef.current.classList.add("active");
    };

    const handleLoginClick = () => {
        containerRef.current.classList.remove("active");
    };

    const HandleSelectedAllergy = () => {
        const selected = selectedAllegyRef.current?.getValue?.()[0]; // get selected item

        if (!selected) return; 

        // check if allergy already exists in the selected list
        const alreadyExists = selectedAllergy.some(
            allergy => allergy.value === selected.value
        );

        if (alreadyExists) {
            alert("This allergy has already been selected!");
            return;
        }

        // if not found, add it to the list
        setSelectedAllergy(prev => [
            ...prev,
            { value: selected.value, text: selected.label }
        ]);
    };


    const removeAllergy = (valueToRemove) => {
        setSelectedAllergy(prev =>
            prev.filter(allergy => allergy.value !== valueToRemove)
        );
    };

    const PasswordVisibility = () => {

        if (PasswordVisible == "password") {
            setPasswordIcon("fa-solid fa-eye");
            setPasswordVisible("text");
        }
        else {
            setPasswordIcon("fa-solid fa-eye-slash");
            setPasswordVisible("password");
        }
    }
    const PasswordVisibilityRegister = () => {

        if (PasswordVisibleRegister == "password") {
            setPasswordIconRegisters("fa-solid fa-eye");
            setPasswordVisibleRegister("text");
        }
        else {
            setPasswordIconRegisters("fa-solid fa-eye-slash");
            setPasswordVisibleRegister("password");
        }
    }

    const PasswordVisibilityConfirm = () => {

        if (PasswordVisibleConfirm == "password") {
            setPasswordIconConfirm("fa-solid fa-eye");
            setPasswordVisibleConfirm("text");
        }
        else {
            setPasswordIconConfirm("fa-solid fa-eye-slash");
            setPasswordVisibleConfirm("password");
        }
    }
    


    const closeModalRegister = () => setSuccessRegister(false);
    const closeModal2 = () => {

        setshowForgotPassword(false);
        setUserExists(false);
    }

    const closeSuccessForgot = () => {
        setForgotSuccess(false);
        setshowForgotPassword(false);
        setUserExists(false);
    }
    const closeModal = () => setShowModal(false);

    return (
        <div className="login-container" id="login">
            <Loader isLoading={loading} />
            {showModal && (<GeneralModal title="Add Allergies" onClose={closeModal}>

                    <div className="allegies-selection-container">
                        <Select ref={selectedAllegyRef}
                            className="register-allergies"
                            options={allergies.map(allergy => ({
                                value: allergy.activeIngredientID,
                                label: allergy.ingredient
                            }))}
                            placeholder="Select Allergy"
                            isSearchable
                        />

                        <CustomerButton text="+Add" onClick={HandleSelectedAllergy} />
                    </div>


                <ul className="selected-allergies-div">
                        {
                            selectedAllergy.map(allergy => (
                                <li key={allergy.value} value={allergy.value}>{allergy.text}
                                    <i className="fa-solid fa-trash delete-allergy-register" onClick={() => removeAllergy(allergy.value)}></i>
                                </li>

                            ))
                        }
                </ul>

                <div className="register-ok-btn">
                    <CustomerButton text="Ok" onClick={closeModal} />
                </div>
                    
                </GeneralModal>

            )}

            {showForgotPassword && (<GeneralModal title="Get New Password" onClose={closeModal2}>

                <div className="forgot-password-inputs-all">
                    <div>
                        <input
                            type="text"
                            value={ForgotPassID || ""}
                            placeholder="Enter ID Number"
                            style={{ width: "80%", border: "1px solid gray" }}
                            minLength="13"
                            maxLength="13"
                            onChange={(e) => setForgotPassID(e.target.value)}
                        />
                        <p className="id-error error-message-forgot"></p>
                    </div>

                    <div className="reset-password-email">
                        <i className="fa-solid fa-envelope forgot-password-icon"></i>
                        <input
                            type="text"
                            value={ForgotPassEmail || ""}
                            placeholder="Enter Email Address"
                            style={{ width: "80%", border: "1px solid gray" }}
                            onChange={(e) => setForgotPassEmail(e.target.value)}
                        />
                        <p className="email-error error-message-forgot"></p>
                        {ShowErrorID && (
                            <p style={{ color: "orangered", fontSize: "1rem" }}>
                            </p>
                        )}

                    </div>

                    <div style={{ width: "80%", textAlign:"center",marginBottom:"0.7rem" }}>
                        <CustomerButton text="Send Password" onClick={ResetPassword} />
                    </div>
                </div>
               
               

            </GeneralModal>
            )}



            {SuccessRegister && (<SuccessModal title="Add Allergies" onClose={closeModal} captionText="You Have successfully registered!">
                <div style={{textAlign:"center"} }>
                    <CustomerButton text="OK" onClick={closeModalRegister} />
                </div>
            </SuccessModal>   )}

            {ForgotSuccess && (<SuccessModal title="Add Allergies" onClose={closeSuccessForgot} captionText="Your new password has been emailed to you!">
                <div style={{ textAlign: "center" }}>
                    <CustomerButton text="OK" onClick={closeSuccessForgot} />
                </div>
            </SuccessModal>)}

            <div className="container" id="container" ref={containerRef}>
                <div className="form-container sign-up">
                    <form>
                        <h1>Create Account</h1> 

                        <div className="control-input">
                            <input type="text" placeholder="Name" style={{ width: '80%' }} ref={NameRef} min="1" maxlength="20" />
                            <span className="register-asterick">*</span> 
                            <div className="valiation" ref={NameValidationRef}></div>
                        </div>

                        <div className="control-input">
                            <input type="text" placeholder="Surname" style={{ width: '80%' }} ref={SurnameRef} min="1" maxlength="20" />
                            <span className="register-asterick">*</span>
                            <div className="valiation" ref={SurnameValidationRef}></div>
                        </div>

                        <div className="control-input">
                            <input type="text" placeholder="ID Number" style={{ width: '80%' }} ref={IDNumberRef} min="13" maxlength="13" /> 
                            <span className="register-asterick">*</span> 
                            <div className="valiation" ref={IdNumberValidationRef}></div>
                        </div>

                        <div className="control-input">
                            <input type="text" placeholder="Phone number" style={{ width: '80%' }} ref={phoneNumberRef} min="10" maxlength="10" /> 
                            <span className="register-asterick">*</span> 
                            <div className="valiation" ref={PhoneNumberValidationRef}></div>
                        </div>

                        <div className="control-input">
                            <input type="text" placeholder="Email" style={{ width: '80%' }} ref={EmailRef} min="1" maxlength="35" />
                            <span className="register-asterick">*</span> 
                            <div className="valiation" ref={EmailValidationRef}></div>
                        </div>

                        <div className="control-input" style={{ position: 'relative' }}>
                            <i className={PasswordIconRegister} id="password-open-eye-login" onClick={PasswordVisibilityRegister}></i>
                            <input type={PasswordVisibleRegister} placeholder="Password" style={{ width: '80%' }} ref={PasswordRef} />
                            <span className="register-asterick">*</span> 
                            <div className="valiation" ref={PasswordValidationRef}></div>
                        </div>

                        <div className="control-input" style={{ position: 'relative' }}>
                            <i className={PasswordIconConfirm} id="password-open-eye-login" onClick={PasswordVisibilityConfirm}></i>
                            <input type={PasswordVisibleConfirm} placeholder="Confirm Password" style={{ width: '80%' }} ref={ConfirmPasswordRef} />
                            <span className="register-asterick">*</span> 
                            <div className="valiation" ref={ConfirmPasswordValidationRef}></div>
                        </div>        

                        <div className="add-allergies-login-customer" onClick={() => setShowModal(true)}>Do you have any allergies? Click here to add them</div>
                        {
                            selectedAllergy.length > 0 && (
                                <div className="display-selected-allergies-register">

                                    {
                                        selectedAllergy.map(allergy => (
                                            <li value={allergy.value}>
                                                {allergy.text}
                                                <i class="fa-solid fa-trash" onClick={() => removeAllergy(allergy.value)}></i>
                                            </li>
                                        ))
                                    }

                                </div>
                            )

                        }
                        
                        <button type="button" className="register-user-button" onClick={RegisterUser}>Sign Up</button>
                    </form>
                </div>
                <div className="form-container sign-in">
                    <form>
                        <h1>LogIn</h1>  
                        <div className="login-input-container">
                            
                            <i className="fa-solid fa-envelope email-icon"></i>
                            <input type="email" placeholder="Username (Email addrress)" ref={EmailLoginRef} style={{ width: '80%' }}  />  
                        </div>

                        <div className="login-input-container">
                            <i className="fa-solid fa-lock password-icon"></i>
                            <i className={PasswordIcon} id="password-open-eye-login" onClick={PasswordVisibility }></i>
                            <input type={PasswordVisible} placeholder="Password" ref={PasswordLoginRef} style={{ width: '80%' }} /> 
                            {IncorrectDetails && (
                                <div className="incorrect-logins">
                                    Incorrect details, please try again.
                                </div>
                            )}

                        </div>
                        <p className="forgot-password" onClick={() => setshowForgotPassword(true) }>Forget Your Password?Click here to recover it</p>
                            <div className="login-button-container">
                                <button type="button" onClick={LoginIn}>Log In</button> 
                            </div>
                        
                    </form>
                </div>
                <div className="toggle-container">
                    <div className="toggle">
                        <div className="toggle-panel toggle-left">
                            <h1>Welcome Back!</h1>
                            <p>Enter your personal details to use all of site features</p>
                            <button className="hidden" onClick={handleLoginClick}>
                                Sign In
                            </button>
                        </div>
                        <div className="toggle-panel toggle-right">
                            <h1>Hello, Friend!</h1>
                            <p>
                                Register with your personal details to use all of site features
                            </p>
                            <button className="hidden" onClick={handleRegisterClick}>
                                Sign Up
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginSection;
