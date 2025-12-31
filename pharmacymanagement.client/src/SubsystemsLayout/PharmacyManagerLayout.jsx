import SideNav from "../SharedComponents/SideNav";
import Header from "../SharedComponents/HeaderLayout";
import FooterLayout from "../SharedComponents/footerLayout";
import { Outlet } from "react-router-dom";

function PharmacyLayout() {
    return (
        <div className="layout">
            <SideNav role="manager" />
            <div className="right-main">
                <Header />
                <div className="main-content">
                    <Outlet />
                </div>
            </div>
            <FooterLayout />
        </div>
    );
}

export default PharmacyLayout;
