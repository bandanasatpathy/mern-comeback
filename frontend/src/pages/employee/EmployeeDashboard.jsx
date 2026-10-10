import React, { useEffect, useState } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";

import { useAuth } from "../../context/AuthContext";
import { getMyTasks } from "../../services/taskService";

import Loading from "../../components/Loading";

import "./EmployeeDashboard.css";


function EmployeeDashboard() {

    const { user, token } = useAuth();

    const [tasks, setTasks] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    /* =========================
       FETCH MY TASKS
    ========================= */

    useEffect(() => {

        const fetchTasks = async () => {

            try {

                setLoading(true);
                setError("");

                const response = await getMyTasks(token);

                setTasks(response.data || []);

            } catch (error) {

                console.error(
                    "Failed to fetch employee tasks:",
                    error
                );

                setError(
                    error.response?.data?.message ||
                    "Failed to load your dashboard."
                );

            } finally {

                setLoading(false);

            }

        };


        if (token) {
            fetchTasks();
        }

    }, [token]);


    /* =========================
       STATISTICS
    ========================= */

    const totalTasks = tasks.length;


    const pendingTasks = tasks.filter(
        (task) => task.status === "pending"
    ).length;


    const inProgressTasks = tasks.filter(
        (task) => task.status === "in-progress"
    ).length;


    const completedTasks = tasks.filter(
        (task) => task.status === "completed"
    ).length;


    /* =========================
       DATE FORMAT
    ========================= */

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


    /* =========================
       STATUS LABEL
    ========================= */

    const getStatusLabel = (status) => {

        if (status === "in-progress") {
            return "In Progress";
        }

        if (status === "completed") {
            return "Completed";
        }

        return "Pending";

    };


    /* =========================
       RECENT TASKS
    ========================= */

    const recentTasks = [...tasks]
        .sort(
            (a, b) =>
                new Date(b.createdAt || 0) -
                new Date(a.createdAt || 0)
        )
        .slice(0, 5);


    /* =========================
       LOADING
    ========================= */

    if (loading) {
        return <Loading />;
    }


    return (

        <div className="employee-dashboard-page">


            {/* =========================
                HEADER
            ========================= */}

            <div className="employee-dashboard-header">

                <div>

                    <h2>
                        Dashboard
                    </h2>

                    <p>
                        Welcome back, {user?.name}
                    </p>

                </div>

            </div>


            {/* =========================
                ERROR
            ========================= */}

            {error && (

                <div className="alert alert-danger">

                    <i className="bi bi-exclamation-circle me-2"></i>

                    {error}

                </div>

            )}


            {/* =========================
                STATISTICS
            ========================= */}

            <div className="employee-dashboard-stats">


                {/* Total */}

                <div className="employee-stat-card">

                    <div className="employee-stat-icon total">

                        <i className="bi bi-list-check"></i>

                    </div>

                    <div>

                        <p>
                            Total Tasks
                        </p>

                        <h3>
                            {totalTasks}
                        </h3>

                    </div>

                </div>


                {/* Pending */}

                <div className="employee-stat-card">

                    <div className="employee-stat-icon pending">

                        <i className="bi bi-hourglass-split"></i>

                    </div>

                    <div>

                        <p>
                            Pending
                        </p>

                        <h3>
                            {pendingTasks}
                        </h3>

                    </div>

                </div>


                {/* In Progress */}

                <div className="employee-stat-card">

                    <div className="employee-stat-icon progress">

                        <i className="bi bi-arrow-repeat"></i>

                    </div>

                    <div>

                        <p>
                            In Progress
                        </p>

                        <h3>
                            {inProgressTasks}
                        </h3>

                    </div>

                </div>


                {/* Completed */}

                <div className="employee-stat-card">

                    <div className="employee-stat-icon completed">

                        <i className="bi bi-check-circle"></i>

                    </div>

                    <div>

                        <p>
                            Completed
                        </p>

                        <h3>
                            {completedTasks}
                        </h3>

                    </div>

                </div>

            </div>


            {/* =========================
                RECENT TASKS
            ========================= */}

            <div className="employee-dashboard-section">

                <div className="employee-section-header">

                    <div>

                        <h4>
                            My Recent Tasks
                        </h4>

                        <p>
                            Your latest assigned tasks
                        </p>

                    </div>

                </div>


                {recentTasks.length === 0 ? (

                    <div className="employee-dashboard-empty">

                        <div className="employee-empty-icon">

                            <i className="bi bi-inbox"></i>

                        </div>

                        <h5>
                            No tasks yet
                        </h5>

                        <p>
                            Your assigned tasks will appear here.
                        </p>

                    </div>

                ) : (

                    <div className="employee-recent-tasks">

                        {recentTasks.map((task) => (

                            <div
                                className="employee-recent-task"
                                key={task._id}
                            >

                                <div className="employee-recent-task-main">

                                    <div className="employee-task-icon">

                                        <i className="bi bi-clipboard-check"></i>

                                    </div>

                                    <div>

                                        <h5>
                                            {task.title}
                                        </h5>

                                        <p>
                                            Due:{" "}
                                            {formatDate(
                                                task.dueDate
                                            )}
                                        </p>

                                    </div>

                                </div>


                                <div className="employee-recent-task-meta">

                                    <span
                                        className={`employee-task-priority priority-${task.priority}`}
                                    >
                                        {task.priority || "medium"}
                                    </span>


                                    <span
                                        className={`employee-task-status status-${task.status}`}
                                    >
                                        {getStatusLabel(
                                            task.status
                                        )}
                                    </span>

                                </div>

                            </div>

                        ))}

                    </div>

                )}

            </div>

        </div>

    );
}

export default EmployeeDashboard;