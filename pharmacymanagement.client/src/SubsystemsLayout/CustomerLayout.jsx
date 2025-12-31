import SideNav from "../SharedComponents/SideNav";
import Header from "../SharedComponents/HeaderLayout";
import FooterLayout from "../SharedComponents/footerLayout";
import CustomerFooter from "../SharedComponents/CustomerFooter";
import { Outlet } from "react-router-dom";

function CustomerLayout() {
    return (
        <div className="layout">
            <SideNav role="customer" />
            <div className="right-main">
                <Header />
                <div className="main-content">
                    <Outlet />
                </div>
            </div>
            <FooterLayout  />
        </div>
    );
}

export default CustomerLayout;
