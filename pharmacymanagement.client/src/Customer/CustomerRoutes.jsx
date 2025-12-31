import { Routes, Route } from "react-router-dom";
import DashBoard from "./Pages/DashBoardPage";
import CustomerLayout from "../SubsystemsLayout/CustomerLayout"
import ManageAllergies from "../Customer/Pages/ManageAllergies"
import ViewPrescriptions from "../Customer/Pages/ViewPrescriptions"
import AddPrescription from "../Customer/Pages/AddPrescription"
import ManageRepeats from "../Customer/Pages/ManageRepeats"
import CustomerOrdersPage from "../Customer/Pages/CustomerOrdersPage"
import Setting from "../SharedComponents/SettingPage"
import ReportsPage from "../Customer/Pages/ReportsPage"
import OrdersHistory from "../Customer/Pages/OrdersHistory"

function PharmacyManagerRoutes() {
    return (
        <Routes>
            <Route element={<CustomerLayout />}>
                <Route index element={<DashBoard />} />
                <Route path="ViewPrescriptions" element={<ViewPrescriptions />} />
                <Route path="ManageAllergies" element={<ManageAllergies />} />
                <Route path="AddPrescription" element={<AddPrescription />} /> 
                <Route path="ManageRepeats" element={<ManageRepeats />} /> 
                <Route path="CustomerOrdersPage" element={<CustomerOrdersPage />} /> 
                <Route path="ReportsPage" element={<ReportsPage />} /> 
                <Route path="Settings" element={<Setting />} />
                <Route path="OrdersHistory" element={<OrdersHistory />} />
            </Route>
        </Routes>
    );
}
export default PharmacyManagerRoutes;
