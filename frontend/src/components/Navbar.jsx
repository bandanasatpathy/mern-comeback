import React from "react";
import { useNavigate } from "react-router-dom";

import "bootstrap-icons/font/bootstrap-icons.css";

import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

import "./Navbar.css";

const Navbar = () => {
    const { user, logout } = useAuth();

    const { theme, toggleTheme } = useTheme();

    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <header className="app-navbar">

            {/* ====================================================
                BRAND
            ==================================================== */}

            <div className="app-navbar-brand">

                <div className="app-navbar-brand-icon">
                    <i className="bi bi-kanban"></i>
                </div>

                <div className="app-navbar-brand-text">
                    <span className="app-navbar-title">
                        Task Management
                    </span>

                    <span className="app-navbar-subtitle">
                        Manage your work efficiently
                    </span>
                </div>

            </div>


            {/* ====================================================
                RIGHT SECTION
            ==================================================== */}

            <div className="app-navbar-right">

                {/* =================================================
                    THEME TOGGLE
                ================================================= */}

                <button
                    type="button"
                    className="app-navbar-theme-toggle"
                    onClick={toggleTheme}
                    title={
                        theme === "light"
                            ? "Switch to dark mode"
                            : "Switch to light mode"
                    }
                    aria-label={
                        theme === "light"
                            ? "Switch to dark mode"
                            : "Switch to light mode"
                    }
                >
                    <span className="theme-toggle-icon">
                        <i
                            className={
                                theme === "light"
                                    ? "bi bi-moon-stars-fill"
                                    : "bi bi-sun-fill"
                            }
                        ></i>
                    </span>

                    <span className="theme-toggle-label">
                        {theme === "light" ? "Dark" : "Light"}
                    </span>
                </button>


                {/* =================================================
                    USER
                ================================================= */}

                <div className="app-navbar-user">

                    <div className="app-navbar-user-info">

                        <div className="app-navbar-user-icon">
                            <i className="bi bi-person"></i>
                        </div>

                        <div className="app-navbar-user-details">

                            <strong>
                                {user?.name || "User"}
                            </strong>

                            <span>
                                {user?.role
                                    ? user.role.charAt(0).toUpperCase() +
                                      user.role.slice(1)
                                    : ""}
                            </span>

                        </div>

                    </div>


                    {/* =================================================
                        LOGOUT
                    ================================================= */}

                    <button
                        type="button"
                        className="app-navbar-logout"
                        onClick={handleLogout}
                        title="Logout"
                    >
                        <i className="bi bi-box-arrow-right"></i>

                        <span>
                            Logout
                        </span>
                    </button>

                </div>

            </div>

        </header>
    );
};

export default Navbar;
