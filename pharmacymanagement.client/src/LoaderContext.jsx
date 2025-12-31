import React, { createContext, useState, useContext, useEffect } from "react";
import Loader from "../src/SharedComponents/Loader"


const LoaderContext = createContext();

export const useLoader = () => useContext(LoaderContext);

export const LoaderProvider = ({ children }) => {
    const [loading, setLoading] = useState(false);
    const showLoader = () => setLoading(true);
    const hideLoader = () => setLoading(false);

    return (
        <LoaderContext.Provider value={{ loading, showLoader, hideLoader }}>
            {loading && <Loader />}
            {children}
        </LoaderContext.Provider>
    );
};
