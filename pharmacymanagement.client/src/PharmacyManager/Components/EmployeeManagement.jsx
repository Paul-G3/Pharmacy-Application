import EmployeeCard from "../Components/EmployeeCard";
import empoyeestyle from "../CSS_for_components/EmployeeStyle.module.css"
import React, { useState } from 'react';

function EmployeeManagement({ userDataList,update,disable ,refresh}) {

    if (!userDataList || userDataList.length === 0) return <p>No data available.</p>;
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6; // Change to 6 for 2 rows (3 items per row)

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = userDataList.slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(userDataList.length / itemsPerPage);
    
    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };
    const Update = (id) => {
        update(id)
    }
    const Disable = (id) => {
        disable(id)
    }
    return (
        <div>
            <div className={empoyeestyle["employee-list"]}>
                {currentItems.map((user, idx) => {
                  const keyId = user.pharmacistID ?? user.pharmacistId ?? user.id ?? user.hcrn ?? idx;

                  const statusKey = (user.status || 'active').toString().trim().toLowerCase();
                    const statusClass = empoyeestyle[statusKey] || '';
                  return (
                    <div className={`${empoyeestyle["employee-card"]} ${statusClass}`} key={keyId}>
                      <EmployeeCard user={user} updatemethod={Update} disableMethod={Disable} refresh={refresh} />
                    </div>
                  );
                })}
            </div>

            <div className={empoyeestyle["pagination"]}>
                <button
                    onClick={handlePreviousPage}
                    className={currentPage === 1 ? empoyeestyle.disabled : ''}
                >
                    Previous
                </button>
                <span>{currentPage} / {totalPages}</span>
                <button
                    onClick={handleNextPage}
                    className={currentPage === totalPages ? empoyeestyle.disabled : ''}
                >
                    Next
                </button>
            </div>
        </div>
    );
}

export default EmployeeManagement;
