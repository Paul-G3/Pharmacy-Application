import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingRoutes from "./Landing/landingRoutes";
import CustomerRoutes from "./Customer/CustomerRoutes";
import PharmacistRoutes from "./Pharmacist/PharmacistRoutes";
import PharmacyManagerRoutes from "./PharmacyManager/PharmacyManagerRoutes"
import { PageTitleProvider } from "./SharedComponents/SetPageTitle"
import React, { useEffect, useState } from "react";
import { LoaderProvider } from "../src/LoaderContext"




function App() {
    return (
        <>
            <LoaderProvider>
            <PageTitleProvider>
                <BrowserRouter basename="/GRP-04-11">
                    <Routes>
                        <Route path="*" element={<LandingRoutes />} />
                        <Route path="/Customer/*" element={<CustomerRoutes />} />
                        <Route path="/Pharmacist/*" element={<PharmacistRoutes />} />
                        <Route path="/PharmacyManager/*" element={<PharmacyManagerRoutes />} />
                    </Routes>
                </BrowserRouter>
                </PageTitleProvider>
            </LoaderProvider>
        </>
    );
}


export default App;