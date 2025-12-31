import "../CustomerCss/ManageAllergies.css";
import { FaTrash } from 'react-icons/fa';
import React, { useState, useEffect, useRef } from "react"
import CustomerButton from "../Components/CustomerButton";
import Select from 'react-select';
import Loader from "../../SharedComponents/Loader"; 
import SuccessModal from "../../SharedComponents/SuccessModal";
import DeleteModal from "../../SharedComponents/DeleteModal"; 
import { usePageTitle } from "../../SharedComponents/SetPageTitle";


function ManageAllergies() {
    const basePath = process.env.NODE_ENV === 'production' ? '/GRP-04-11' : '';
    const token = localStorage.getItem("jwtToken"); // adjust the key if needed
    // state  variables
    const [CustomerAllergies, setCustomerAllergies] = useState([]);
    const [allergies, setAllergies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [IsOpen, setIsOpen] = useState(false);
    const [IsOpen2, setIsOpen2] = useState(false);
    const [IsDeleteOpen, setIsDeleteOpen] = useState(false);
    const [DeletedAllergy, setDeletedAllergy] = useState(null);
    const { setPageTitle } = usePageTitle();
    //useref variables
    let selectedAllergyManageAllergies = useRef();

    const SetDeleteValue = (value) => {
        setIsDeleteOpen(true);
        setDeletedAllergy(value);
    }
    const AddAllergy = () => { // adding allergy to the database 
        const selectedAllergyManage = selectedAllergyManageAllergies.current?.getValue?.()[0]; 
        let allergy = {
            value: selectedAllergyManage.value,
            text : "none"
        }; 

        const existingAllergy = CustomerAllergies.find(
            a => a.activeIngredientID === allergy.value
        );

        if (existingAllergy) {
            alert("This allergy is already Exists!");
            return;
        }


        fetch(`${basePath}/api/Customer/add-allergies`, {
            method: "POST",
            headers: {
                'Content-Type': "application/json",
                "Authorization": `Bearer ${token}`
            }, 
            body: JSON.stringify(allergy)

        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to fetch allergies");
            }
            return response.json();
        })
            .then(data => {    

                console.log("is open");
                GetAllergiesSaved();
                setIsOpen(true);
            })
            .catch(error => {
            });
    };
     
    const GetAllergiesSaved = () => {
        setLoading(true);
        fetch(`${basePath}/api/Customer/get-saved-Allergies`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Failed to fetch allergies");
                }
                return response.json();
            })
            .then(data => {
                setCustomerAllergies(data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Error fetching allergies:", error);
                setLoading(false);
            });
    }

    useEffect(() => { 
        setPageTitle('Allergies');
        fetch(`${basePath}/api/Customer/getAllergies`)
            .then(response => response.json())
            .then(data => {
                setAllergies(data);
            })
            .catch(error => {
            });

        GetAllergiesSaved();
    }, []); 


    function RemoveAllergy() { //delete user allergy from the server 
        let allergy = {
            value: DeletedAllergy,
            text: "none"
        }; 
        fetch(`${basePath}/api/Customer/remove-customer-allergy`, {
            method: "POST",
            headers: {
                'Content-Type': "application/json" 
            },
            body: JSON.stringify(allergy)

        })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Failed to fetch allergies");
                }
                return response.json();
            })
            .then(data => {
                console.log("Fetched allergies:");
                GetAllergiesSaved();
                setIsDeleteOpen(false);
                setIsOpen2(true);
            })
            .catch(error => {
                console.error("Error fetching allergies:", error);
            });
    }

    return (

        <div className="manage-allergies-container">

            <div className="allergies-selection-container">
              
                <Select
                    ref={selectedAllergyManageAllergies}
                    className="allergies-conbo-box"
                    options={allergies.map(allergy => ({
                        value: allergy.activeIngredientID,
                        label: allergy.ingredient
                    }))}
                    placeholder="Select Allergy"
                    isSearchable
                />
                 
                <CustomerButton text="+Add" onClick={AddAllergy} />
            </div>

            <div className="allergies-main-container">

                <div className="customer-allergies-container">

                    <h2 className="selected-allergies-title">Saved Allergies</h2>

                    <div className="selected-allergies-customer">

                        {
                            CustomerAllergies.map((allergy, index) => (
                                <div className="selected-allergy" key={allergy.customerAllergyID} value={allergy.customerAllergyID}>
                                    <div>
                                        <span>{allergy.ingredient}</span>
                                    </div>
                                    <FaTrash className="delete-selected-allergy" onClick={() => SetDeleteValue(allergy.customerAllergyID)}/>
                                </div>
                            ))
                        }
                      
                    </div> 
                </div>                


            </div>

            {
               IsOpen &&( <SuccessModal captionText="Allergy Has been Added Succefully!">

                    <div style={{ textAlign: "center" }}>
                        <button onClick={() => setIsOpen(false)} className="ok-modal-button">Ok</button>
                    </div>

                </SuccessModal>
                )} 

            {
                IsOpen2 && (<SuccessModal captionText="Allergy Has been Deleted Succefully!">

                    <div style={{ textAlign: "center" }}>
                        <button onClick={() => setIsOpen2(false)} className="ok-modal-button">Ok</button>
                    </div>

                </SuccessModal>
                )} 

            {
                IsDeleteOpen && (<DeleteModal captionText="Are you sure you want to Delete?">

                    <div className="delete-buttons-container">
                        <button onClick={() => setIsDeleteOpen(false)} className="delete-button-modal-no">No</button>
                        <button onClick={RemoveAllergy} className="delete-button-modal-yes">Yes</button>
                    </div>

                </DeleteModal>
                )} 

            
            <Loader isLoading={loading}/>
        </div>
    );

}

export default ManageAllergies