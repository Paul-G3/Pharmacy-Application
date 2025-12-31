import React from "react";
import { FaEllipsisV } from "react-icons/fa";
import "../CSS_for_components/IngredientCardcss.css";

const IngredientManagement = ({ imageSrc, name, status }) => {
    return (
        <div className="ingredient-card">
            <div className="card-header">
                <img src={imageSrc} alt={name} className="med-image" />
                <div className="card-options" onClick={() => console.log('Options clicked')}>⋮</div>
            </div>
            <div className="card-body">
                <div className="med-name">{name}</div>
                <div className="med-strength">{status}</div>
            </div>
        </div>
    );
};

export default IngredientManagement;
