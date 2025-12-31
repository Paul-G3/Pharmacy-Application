import MedicationCard from "../Components/IngredientCard"
import React, { useState } from 'react';


function IngredientManagement({ ingredient }) {
    const itemsPerPage = 8;
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(ingredient.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentData = ingredient.slice(startIndex, startIndex + itemsPerPage);

    return (
        <>
            <div className="ingredient-grid">
                {currentData.map((med, index) => (
                    <MedicationCard
                        key={index}
                        imageSrc={med.imageSrc}
                        name={med.name}
                        status={med.status}
                        
                    />
                ))}
                
            </div>
            <div className="pagination-controls">
                {Array.from({ length: totalPages }, (_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={currentPage === i + 1 ? 'active' : ''}
                    >
                        {i + 1}
                    </button>
                ))}
            </div>
        </>
    );
}

export default IngredientManagement;