import { Routes, Route } from "react-router-dom";
import DashBoard from "./Pages/DashBoardPage";
import Management from "./Pages/Management";
import NewOrder from "./Pages/NewOrders";
import Medication from "./Pages/Medication_Inventory";
import MedicationOrders from "./Pages/MedicationOrders";
import ManagerLayout from "../SubsystemsLayout/PharmacyManagerLayout"
import InfoPage from "../PharmacyManager/Pages/InfoPage"
import Setting from "../SharedComponents/SettingPage"
import StockTake from "../PharmacyManager/Pages/StockTake"

function PharmacyManagerRoutes() {
    return (
        <Routes>
            <Route element={<ManagerLayout />}>
                <Route index element={<DashBoard />} />
                <Route path="Management" element={<Management />} />
                <Route path="Medication" element={<Medication />} />
                <Route path="StockTake" element={<StockTake />} />
                <Route path="NewOrder" element={<NewOrder />} />
                <Route path="MedicationOrders" element={<MedicationOrders />} />
                <Route path="InfoPage" element={<InfoPage />} />
                <Route path="Settings" element={<Setting />} />
            </Route>
        </Routes>
    );
}
export default PharmacyManagerRoutes;
