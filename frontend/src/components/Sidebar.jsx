import React from "react";
import { NavLink } from "react-router-dom";

import "bootstrap-icons/font/bootstrap-icons.css";

import { useAuth } from "../context/AuthContext";

import "./Sidebar.css";

const Sidebar = () => {
    const { user } = useAuth();

    const isAdmin = user?.role === "admin";

    const navLinkClass = ({ isActive }) =>
        `app-sidebar-link ${isActive ? "active" : ""}`;

    return (
        <aside className="app-sidebar">

            {/* =========================
                SECTION HEADER
            ========================= */}

            <div className="app-sidebar-header">
                <span>
                    {isAdmin ? "Administration" : "Employee Portal"}
                </span>
            </div>


            {/* =========================
                NAVIGATION
            ========================= */}

            <nav className="app-sidebar-nav">

                {/* =========================
                    ADMIN MENU
                ========================= */}

                {isAdmin && (
                    <>
                        <NavLink
                            to="/admin"
                            end
                            className={navLinkClass}
                        >
                            <i className="bi bi-grid-1x2" />
                            <span>Dashboard</span>

                            <span className="app-sidebar-arrow">
                                <i className="bi bi-chevron-right" />
                            </span>
                        </NavLink>

                        <NavLink
                            to="/admin/employees"
                            end
                            className={navLinkClass}
                        >
                            <i className="bi bi-people" />
                            <span>Employees</span>

                            <span className="app-sidebar-arrow">
                                <i className="bi bi-chevron-right" />
                            </span>
                        </NavLink>

                        <NavLink
                            to="/admin/projects"
                            className={navLinkClass}
                        >
                            <i className="bi bi-kanban" />

                            <span>
                                Projects
                            </span>

                            <span className="app-sidebar-arrow">
                                <i className="bi bi-chevron-right" />
                            </span>
                        </NavLink>

                        <NavLink
                            to="/admin/tasks"
                            className={navLinkClass}
                        >
                            <i className="bi bi-list-check" />
                            <span>Tasks</span>

                            <span className="app-sidebar-arrow">
                                <i className="bi bi-chevron-right" />
                            </span>
                        </NavLink>

                        <NavLink
                            to="/admin/profile-requests"
                            end
                            className={navLinkClass}
                        >
                            <i className="bi bi-person-lines-fill" />
                            <span>Profile Requests</span>

                            <span className="app-sidebar-arrow">
                                <i className="bi bi-chevron-right" />
                            </span>
                        </NavLink>

                    </>
                )}


                {/* =========================
                    EMPLOYEE MENU
                ========================= */}

                {!isAdmin && (
                    <>
                        <NavLink
                            to="/employee"
                            end
                            className={navLinkClass}
                        >
                            <i className="bi bi-grid-1x2" />
                            <span>Dashboard</span>

                            <span className="app-sidebar-arrow">
                                <i className="bi bi-chevron-right" />
                            </span>
                        </NavLink>

                        <NavLink
                            to="/employee/tasks"
                            className={navLinkClass}
                        >
                            <i className="bi bi-list-check" />
                            <span>My Tasks</span>

                            <span className="app-sidebar-arrow">
                                <i className="bi bi-chevron-right" />
                            </span>
                        </NavLink>

                        <NavLink
                            to="/employee/projects"
                            className={navLinkClass}
                        >
                            <i className="bi bi-kanban" />
                            <span>My Projects</span>

                            <span className="app-sidebar-arrow">
                                <i className="bi bi-chevron-right" />
                            </span>
                        </NavLink>


                        <NavLink
                            to="/employee/profile"
                            className={navLinkClass}
                        >
                            <i className="bi bi-person" />
                            <span>Profile</span>

                            <span className="app-sidebar-arrow">
                                <i className="bi bi-chevron-right" />
                            </span>
                        </NavLink>
                    </>
                )}

            </nav>

        </aside>
    );
};

export default Sidebar;
