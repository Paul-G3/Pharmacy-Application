import React, { useState } from 'react';
import dynamictable from "../SharedComponentsStyles/DynamicTableStyle.module.css";

function DynamicTable({
    data,
    rowsPerPage = 10,
    showActions = true,
    statusToHighlight = null,
    renderActions = null,
    actions = [],
    disable,
    update,
    keyField="id"
}) {
    const [currentPage, setCurrentPage] = useState(1);
    
    if (!data || data.length === 0) return <p>No data available.</p>;

    const Allheader =Object.keys(data[0])
    const headers = Object.keys(data[0]).slice(1);
    const totalPages = Math.ceil(data.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const currentData = data.slice(startIndex, startIndex + rowsPerPage);
    

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const renderDefaultActions = (row) => (
        <>
            <span
                onClick={() => { update(row[keyField]) }}
                style={{ marginRight: '10px', cursor: 'pointer' }}
                title="Edit"
            >
                ✏️
            </span>
            {row.status?.toLowerCase() === 'active' ? (
                <span
                    onClick={() => { disable(row[keyField]) } }
                    style={{ cursor: 'pointer' }}
                    title="Disable"
                >
                    🚫
                </span>
            ) : (
                <span
                    onClick={() => { disable(row[keyField]) }}
                    style={{ cursor: 'pointer' }}
                    title="Enable"
                >
                    ✅
                </span>
            )}
        </>
    );

    const renderConfiguredActions = (row) => (
        actions.map((action, index) => (
            <button
                key={index}
                className={action.className}
                onClick={() => action.onClick(row)}
                style={{ marginRight: '8px', ...action.style }}
                title={action.title}
            >
                {action.icon && <span style={{ marginRight: action.label ? '4px' : '0' }}>{action.icon}</span>}
                {action.label}
            </button>
        ))
    );

    return (
        <div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        {headers.map((header, idx) => (
                            <th key={idx} style={{ padding: '8px', textAlign: 'left' }}>
                                {header.toUpperCase()}
                            </th>
                        ))}
                        {showActions && <th style={{ padding: '8px' }}></th>}
                    </tr>
                </thead>
                <tbody>
                    {currentData.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {headers.map((key, colIndex) => {
                                const isStatusColumn = key.toLowerCase() === 'status';
                                const shouldHighlight =
                                    isStatusColumn &&
                                    statusToHighlight &&
                                    row[key]?.toLowerCase() === statusToHighlight.toLowerCase();

                                return (
                                    <td
                                        key={colIndex}
                                        style={{
                                            padding: '8px',
                                            color: shouldHighlight ? 'red' : 'inherit',
                                            fontWeight: shouldHighlight ? 'bold' : 'normal',
                                        }}
                                    >
                                        {row[key]}
                                    </td>
                                );
                            })}
                            {showActions && (
                                <td className={dynamictable["action-column"]}>
                                    {renderActions
                                        ? renderActions(row)
                                        : actions.length > 0
                                            ? renderConfiguredActions(row)
                                            : renderDefaultActions(row)}
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
                <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                    <button
                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        style={{
                            margin: '0 5px',
                            padding: '5px 10px',
                            backgroundColor: '#f0f0f0',
                            border: 'none',
                            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                        }}
                    >
                        &lt;
                    </button>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
                        let pageNum;
                        if (totalPages <= 5) {
                            pageNum = index + 1;
                        } else if (currentPage <= 3) {
                            pageNum = index + 1;
                        } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + index;
                        } else {
                            pageNum = currentPage - 2 + index;
                        }

                        return (
                            <button
                                key={pageNum}
                                style={{
                                    margin: '0 5px',
                                    padding: '5px 10px',
                                    backgroundColor: currentPage === pageNum ? '#90c3d4' : '#f0f0f0',
                                    border: 'none',
                                    cursor: 'pointer',
                                }}
                                onClick={() => handlePageChange(pageNum)}
                            >
                                {pageNum}
                            </button>
                        );
                    })}

                    <button
                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        style={{
                            margin: '0 5px',
                            padding: '5px 10px',
                            backgroundColor: '#f0f0f0',
                            border: 'none',
                            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                        }}
                    >
                        &gt;
                    </button>
                </div>
            )}
        </div>
    );
}

export default DynamicTable;