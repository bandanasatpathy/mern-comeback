import React, { useEffect, useState , useCallback  } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";

import { useAuth } from "../../context/AuthContext";
import Loading from "../../components/Loading";

import {
    getAllEmployees
} from "../../services/userService";

import {
    getAllTasks,
    getTasksByStatus
} from "../../services/taskService";

import "./AdminDashboard.css";


function AdminDashboard() {

    const { user, token } = useAuth();


    /* =====================================================
       DASHBOARD DATA
    ===================================================== */

    const [totalEmployees, setTotalEmployees] =
        useState(0);

    const [totalTasks, setTotalTasks] =
        useState(0);

    const [pendingTasks, setPendingTasks] =
        useState(0);

    const [completedTasks, setCompletedTasks] =
        useState(0);

    const [recentTasks, setRecentTasks] =
        useState([]);


    /* =====================================================
       LOADING
    ===================================================== */

    const [loading, setLoading] =
        useState(true);


    /* =====================================================
       ERROR
    ===================================================== */

    const [error, setError] =
        useState("");


    /* =====================================================
       FETCH DASHBOARD DATA
    ===================================================== */

    const fetchDashboardData = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const [
                employeesResponse,
                tasksResponse,
                pendingResponse,
                completedResponse
            ] = await Promise.all([
                getAllEmployees(1, 100, token, true),
                getAllTasks(1, 5, token),
                getTasksByStatus("pending", 1, 1, token),
                getTasksByStatus("completed", 1, 1, token)
            ]);

            setTotalEmployees(
                employeesResponse.pagination?.totalEmployees ??
                employeesResponse.data?.length ??
                0
            );

            setTotalTasks(
                tasksResponse.pagination?.totalTasks ?? 0
            );

            setPendingTasks(
                pendingResponse.pagination?.totalTasks ?? 0
            );

            setCompletedTasks(
                completedResponse.pagination?.totalTasks ?? 0
            );

            setRecentTasks(tasksResponse.data || []);

        } catch (error) {
            console.error("Failed to load admin dashboard:", error);

            setError(
                error.response?.data?.message ||
                "Failed to load dashboard data."
            );
        } finally {
            setLoading(false);
        }
    }, [token]);


    /* =====================================================
       LOAD DASHBOARD
    ===================================================== */

    useEffect(() => {
        if (token) {
            fetchDashboardData();
        }
    }, [token, fetchDashboardData]);


    /* =====================================================
       FORMAT DATE
    ===================================================== */

    const formatDate = (date) => {

        if (!date) {
            return "-";
        }

        return new Date(date).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    };


    const todayLabel = new Date().toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );


    /* =====================================================
       STATUS LABEL
    ===================================================== */

    const getStatusLabel = (status) => {

        switch (status) {

            case "pending":
                return "Pending";

            case "in-progress":
                return "In Progress";

            case "completed":
                return "Completed";

            default:
                return status || "-";
        }

    };


    /* =====================================================
       LOADING
    ===================================================== */

    if (loading) {
        return <Loading />;
    }


    return (

        <div className="dashboard-page">

            <main className="dashboard-content">


                {/* =================================================
                    GRADIENT HEADER
                ================================================= */}

                <section className="dashboard-hero">

                    <div className="dashboard-hero-content">

                        <div>

                            <h2>
                                Dashboard
                            </h2>

                            <p>
                                Welcome back, {user?.name}
                            </p>

                        </div>


                        <div className="dashboard-date-card">

                            <span className="dashboard-date-icon">
                                <i className="bi bi-calendar3"></i>
                            </span>

                            <span className="dashboard-date-content">

                                <small>
                                    Today
                                </small>

                                <strong>
                                    {todayLabel}
                                </strong>

                            </span>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (

                    <div className="dashboard-error">

                        <i className="bi bi-exclamation-circle"></i>

                        <span>
                            {error}
                        </span>

                    </div>

                )}


                {/* =================================================
                    STATISTICS
                ================================================= */}

                <div className="dashboard-stats">


                    <div className="stat-card employees">

                        <div className="stat-icon">
                            <i className="bi bi-people"></i>
                        </div>

                        <div className="stat-content">

                            <p>
                                Total Employees
                            </p>

                            <h3>
                                {totalEmployees}
                            </h3>

                            <span>
                                Active team members
                            </span>

                        </div>

                    </div>


                    <div className="stat-card tasks">

                        <div className="stat-icon">
                            <i className="bi bi-list-check"></i>
                        </div>

                        <div className="stat-content">

                            <p>
                                Total Tasks
                            </p>

                            <h3>
                                {totalTasks}
                            </h3>

                            <span>
                                All assigned tasks
                            </span>

                        </div>

                    </div>


                    <div className="stat-card pending">

                        <div className="stat-icon">
                            <i className="bi bi-hourglass-split"></i>
                        </div>

                        <div className="stat-content">

                            <p>
                                Pending Tasks
                            </p>

                            <h3>
                                {pendingTasks}
                            </h3>

                            <span>
                                Awaiting completion
                            </span>

                        </div>

                    </div>


                    <div className="stat-card completed">

                        <div className="stat-icon">
                            <i className="bi bi-check-circle"></i>
                        </div>

                        <div className="stat-content">

                            <p>
                                Completed Tasks
                            </p>

                            <h3>
                                {completedTasks}
                            </h3>

                            <span>
                                Successfully finished
                            </span>

                        </div>

                    </div>

                </div>


                {/* =================================================
                    RECENT TASKS
                ================================================= */}

                <section className="dashboard-section">

                    <div className="section-header">

                        <div>

                            <h4>
                                Recent Tasks
                            </h4>

                            <p>
                                Latest tasks created in the system
                            </p>

                        </div>


                        <button
                            type="button"
                            className="view-all-button"
                            onClick={() => {
                                window.location.href = "/admin/tasks";
                            }}
                        >
                            View All
                            <i className="bi bi-arrow-right"></i>
                        </button>

                    </div>


                    {recentTasks.length === 0 ? (

                        <div className="empty-state">

                            <i className="bi bi-inbox"></i>

                            <p>
                                No tasks found.
                            </p>

                            <span>
                                Create a task to see it here.
                            </span>

                        </div>

                    ) : (

                        <div className="recent-task-list">

                            {recentTasks.map((task) => (

                                <div
                                    className="recent-task-item"
                                    key={task._id}
                                >

                                    <div className="recent-task-icon">

                                        <i className="bi bi-list-task"></i>

                                    </div>


                                    <div className="recent-task-info">

                                        <h5>
                                            {task.title}
                                        </h5>

                                        <p>
                                            Assigned to{" "}
                                            <strong>
                                                {
                                                    task.assignedTo?.name ||
                                                    "Unknown employee"
                                                }
                                            </strong>
                                        </p>

                                    </div>


                                    <div className="recent-task-status">

                                        <span
                                            className={`task-status ${task.status}`}
                                        >
                                            {getStatusLabel(task.status)}
                                        </span>

                                    </div>


                                    <div className="recent-task-date">

                                        <span>
                                            Due
                                        </span>

                                        <strong>
                                            {formatDate(task.dueDate)}
                                        </strong>

                                    </div>

                                </div>

                            ))}

                        </div>

                    )}

                </section>

            </main>

        </div>
    );
}


export default AdminDashboard;
