import React from "react";
import "bootstrap-icons/font/bootstrap-icons.css";

function Pagination({
    currentPage,
    totalPages,
    onPageChange
}) {

    if (totalPages <= 1) {
        return null;
    }

    const pages = [];

    for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
    }

    return (
        <div className="pagination-container">

            <button
                className="pagination-button"
                disabled={currentPage === 1}
                onClick={() =>
                    onPageChange(currentPage - 1)
                }
            >
                <i className="bi bi-chevron-left"></i>
            </button>


            {pages.map((page) => (

                <button
                    key={page}
                    className={`pagination-button ${
                        currentPage === page
                            ? "active"
                            : ""
                    }`}
                    onClick={() =>
                        onPageChange(page)
                    }
                >
                    {page}
                </button>

            ))}


            <button
                className="pagination-button"
                disabled={currentPage === totalPages}
                onClick={() =>
                    onPageChange(currentPage + 1)
                }
            >
                <i className="bi bi-chevron-right"></i>
            </button>

        </div>
    );
}

export default Pagination;