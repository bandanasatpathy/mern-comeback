import React from "react";
import { Outlet } from "react-router-dom";

import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

import "./AppLayout.css";

const AppLayout = () => {
    return (
        <div className="app-layout">

            {/* Top Navbar */}
            <Navbar />

            {/* Sidebar + Page Content */}
            <div className="app-layout-body">

                <Sidebar />

                <main className="app-layout-content">
                    <Outlet />
                </main>

            </div>

        </div>
    );
};

export default AppLayout;