import React from "react";
import "../SharedComponentsStyles/LoaderStyle.css";

const Loader = ({ isLoading }) => {
    if (!isLoading) return null;

    return (
        <div className="loader-overlay">
            <div className="loader"></div>
        </div>
    );
};

export default Loader;
