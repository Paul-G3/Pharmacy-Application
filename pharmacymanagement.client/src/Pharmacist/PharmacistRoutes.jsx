import { Routes, Route } from "react-router-dom";
import Dashboard from "./Pages/DashBoardPage";
import DispenseMedication from "./Pages/DispenseMedicationPage";
import Prescription from "./Pages/LoadPrescriptionPage"
import PrescriptionList from "./Pages/PrescriptionList"
import ProcessedScripts from "./Pages/ProcessedSpriptsPage"
import PharmacistOrdersPage from "./Pages/PharmacistOrdersPage"
import PharmacistLayout from "../SubsystemsLayout/PharmacistLayout";
import PharmacistReports from "./Pages/PharmacistReports"
import Setting from "../SharedComponents/SettingPage"



function Pharmacist() {
    return (

        <Routes>
            <Route element={<PharmacistLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="DispenseMedication" element={<DispenseMedication />} />
                <Route path="Prescription" element={<Prescription />} />
                <Route path="PrescriptionList" element={<PrescriptionList />} />
                <Route path="ProcessedScripts" element={<ProcessedScripts />} />
                <Route path="PharmacistOrdersPage" element={<PharmacistOrdersPage />} />
                <Route path="PharmacistReports" element={<PharmacistReports />} />
                <Route path="Settings" element={<Setting />} />

            </Route>
        </Routes>
    );
}

export default Pharmacist;
