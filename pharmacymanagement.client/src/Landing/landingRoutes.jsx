import HomePage from "./homePage"
import {Routes,Route} from "react-router-dom";

function homePage() {
    return (
        <Routes>
            <Route path="/" element={<HomePage/>} />
        </Routes>
    )
}

export default homePage;