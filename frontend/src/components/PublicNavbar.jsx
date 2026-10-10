import React from "react";
import { useTheme } from "../context/ThemeContext";
import "./PublicNavbar.css";

const PublicNavbar = () => {
    const { theme, toggleTheme } = useTheme();

    const handleAboutClick = () => {
        document.getElementById("about")?.scrollIntoView({
            behavior: "smooth",
        });
    };

    return (
        <nav className="public-navbar">
            <div className="public-navbar-brand">
                <div className="public-navbar-logo">
                    <i className="bi bi-check2-square"></i>
                </div>

                <span>Task Management</span>
            </div>

            <div className="public-navbar-actions">
                <button
                    type="button"
                    className="public-navbar-link"
                    onClick={handleAboutClick}
                >
                    About
                </button>

                <button
                    type="button"
                    className="public-navbar-theme"
                    onClick={toggleTheme}
                    title={
                        theme === "light"
                            ? "Switch to dark mode"
                            : "Switch to light mode"
                    }
                >
                    <i
                        className={
                            theme === "light"
                                ? "bi bi-moon-stars-fill"
                                : "bi bi-sun-fill"
                        }
                    ></i>
                </button>
            </div>
        </nav>
    );
};

export default PublicNavbar;