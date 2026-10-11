import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";

import { useAuth } from "../../context/AuthContext";
import Loading from "../../components/Loading";

import {
    getAllTasks,
    getTasksByStatus,
    getTaskById,
    updateTask,
    deleteTask
} from "../../services/taskService";

import { getAllEmployees } from "../../services/userService";
import { getAllProjects } from "../../services/projectService";

import "./Tasks.css";

const Tasks = () => {

    const { token } = useAuth();
    const navigate = useNavigate();

    /* =========================
       TASK LIST
    ========================= */

    const [tasks, setTasks] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    /* =========================
       FILTER
    ========================= */

    const [statusFilter, setStatusFilter] = useState("all");

    /* =========================
       PAGINATION
    ========================= */

    const [currentPage, setCurrentPage] = useState(1);

    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        totalTasks: 0,
        totalPages: 0
    });

    /* =========================
       VIEW TASK
    ========================= */

    const [selectedTask, setSelectedTask] = useState(null);

    const [viewLoading, setViewLoading] = useState(false);

    const [viewError, setViewError] = useState("");

    /* =========================
       EDIT TASK
    ========================= */

    const [editTask, setEditTask] = useState(null);

    const [editForm, setEditForm] = useState({
        title: "",
        description: "",
        assignedTo: "",
        project: "",
        priority: "medium",
        dueDate: ""
    });

    const [deleteTaskData, setDeleteTaskData] = useState(null);

    const [deleteLoading, setDeleteLoading] = useState(false);

    const [deleteError, setDeleteError] = useState("");

    const [deleteMessage, setDeleteMessage] = useState("");

    const [employees, setEmployees] = useState([]);
    const [projects, setProjects] = useState([]);

    const [editLoading, setEditLoading] = useState(false);

    const [editSaving, setEditSaving] = useState(false);

    const [editError, setEditError] = useState("");

    const [editMessage, setEditMessage] = useState("");


    /* =========================
       FETCH TASKS
    ========================= */

    const fetchTasks = async () => {

        try {

            setLoading(true);
            setError("");

            let response;

            if (statusFilter === "all") {

                response = await getAllTasks(
                    currentPage,
                    10,
                    token
                );

            } else {

                response = await getTasksByStatus(
                    statusFilter,
                    currentPage,
                    10,
                    token
                );
            }

            setTasks(response.data || []);

            setPagination(
                response.pagination || {
                    page: currentPage,
                    limit: 10,
                    totalTasks: 0,
                    totalPages: 0
                }
            );

        } catch (error) {

            console.error(
                "Failed to fetch tasks:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to load tasks."
            );

        } finally {

            setLoading(false);

        }
    };


    /* =========================
       FETCH ON PAGE/FILTER
    ========================= */

    useEffect(() => {

        if (token) {
            fetchTasks();
            fetchTaskDependencies();
        }

    }, [currentPage, statusFilter, token,fetchTasks,fetchTaskDependencies]);


    /* =========================
       STATUS FILTER
    ========================= */

    const handleStatusFilter = (status) => {

        setStatusFilter(status);

        setCurrentPage(1);

    };


    /* =========================
       PAGINATION
    ========================= */

    const handlePageChange = (page) => {

        if (
            page < 1 ||
            page > pagination.totalPages ||
            page === currentPage
        ) {
            return;
        }

        setCurrentPage(page);

    };


    /* =========================
       FORMAT DATE
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


    /* =========================
       PRIORITY LABEL
    ========================= */

    const getPriorityLabel = (priority) => {

        if (!priority) {
            return "-";
        }

        return (
            priority.charAt(0).toUpperCase() +
            priority.slice(1)
        );
    };


    /* =====================================================
       VIEW TASK
    ===================================================== */

    const handleViewTask = async (taskId) => {

        try {

            setViewLoading(true);

            setViewError("");

            setSelectedTask(null);

            const response = await getTaskById(
                taskId,
                token
            );

            setSelectedTask(response.data);

        } catch (error) {

            console.error(
                "Failed to load task:",
                error
            );

            setViewError(
                error.response?.data?.message ||
                "Failed to load task details."
            );

        } finally {

            setViewLoading(false);

        }
    };


    /* =========================
       CLOSE VIEW MODAL
    ========================= */

    const closeTaskModal = () => {

        setSelectedTask(null);

        setViewError("");

        setViewLoading(false);

    };


    /* =====================================================
       FETCH ACTIVE EMPLOYEES + PROJECTS
    ===================================================== */

    const fetchTaskDependencies = async () => {

        try {

            const [employeeResponse, projectResponse] = await Promise.all([
                getAllEmployees(1, 100, token, true),
                getAllProjects(token)
            ]);

            setEmployees(employeeResponse.data || []);
            setProjects(
                (projectResponse.data || []).filter(
                    (project) => project.status !== "archived"
                )
            );

        } catch (error) {

            console.error(
                "Failed to fetch task dependencies:",
                error
            );

            setEmployees([]);
            setProjects([]);

        }
    };


    const getProjectEmployees = (projectId) => {

        const project = projects.find(
            (item) => item._id === projectId
        );

        if (!project) {
            return [];
        }

        return employees.filter((employee) =>
            project.members?.some(
                (member) =>
                    (member?._id || member)?.toString() ===
                    employee._id.toString()
            )
        );
    };


    /* =====================================================
       OPEN EDIT TASK
    ===================================================== */

    const handleEditTask = async (taskId) => {

        try {

            setEditLoading(true);

            setEditError("");

            setEditMessage("");

            const response = await getTaskById(
                taskId,
                token
            );

            const task = response.data;

            setEditTask(task);

            setEditForm({
                title: task.title || "",

                description:
                    task.description || "",

                assignedTo:
                    task.assignedTo?._id ||
                    task.assignedTo ||
                    "",

                project:
                    task.project?._id ||
                    task.project ||
                    "",

                priority:
                    task.priority || "medium",

                dueDate:
                    task.dueDate
                        ? new Date(task.dueDate)
                            .toISOString()
                            .split("T")[0]
                        : ""
            });

            if (projects.length === 0) {
                await fetchTaskDependencies();
            }

        } catch (error) {

            console.error(
                "Failed to load task for editing:",
                error
            );

            setEditError(
                error.response?.data?.message ||
                "Failed to load task."
            );

        } finally {

            setEditLoading(false);

        }
    };


    /* =====================================================
       EDIT FORM CHANGE
    ===================================================== */

    const handleEditFormChange = (e) => {

        const {
            name,
            value
        } = e.target;

        setEditForm((previous) => ({
            ...previous,
            [name]: value
        }));

    };


    /* =====================================================
       UPDATE TASK
    ===================================================== */

    const handleUpdateTask = async (e) => {

        e.preventDefault();

        if (!editTask) {
            return;
        }

        if (!editForm.title.trim()) {

            setEditError(
                "Task title is required."
            );

            return;
        }

        if (!editForm.description.trim()) {

            setEditError(
                "Task description is required."
            );

            return;
        }

        if (!editForm.project) {

            setEditError(
                "Please select a project."
            );

            return;
        }

        if (!editForm.assignedTo) {

            setEditError(
                "Please select an employee."
            );

            return;
        }

        if (!editForm.dueDate) {

            setEditError(
                "Due date is required."
            );

            return;
        }

        setEditSaving(true);

        setEditError("");

        setEditMessage("");

        try {

            const response = await updateTask(
                editTask._id,
                {
                    title: editForm.title.trim(),

                    description:
                        editForm.description.trim(),

                    assignedTo:
                        editForm.assignedTo,

                    project:
                        editForm.project,

                    priority:
                        editForm.priority,

                    dueDate:
                        editForm.dueDate
                },
                token
            );

            setEditMessage(
                response.message ||
                "Task updated successfully."
            );

            setTimeout(() => {

                setEditTask(null);

                setEditMessage("");

                fetchTasks();

            }, 800);

        } catch (error) {

            console.error(
                "Failed to update task:",
                error
            );

            setEditError(
                error.response?.data?.message ||
                "Failed to update task."
            );

        } finally {

            setEditSaving(false);

        }
    };


    /* =====================================================
       CLOSE EDIT MODAL
    ===================================================== */

    const closeEditModal = () => {

        if (editSaving) {
            return;
        }

        setEditTask(null);

        setEditError("");

        setEditMessage("");

        setEditForm({
            title: "",
            description: "",
            assignedTo: "",
            project: "",
            priority: "medium",
            dueDate: ""
        });

    };

    /* =====================================================
   DELETE TASK
===================================================== */

    const handleDeleteClick = (task) => {

        setDeleteTaskData(task);

        setDeleteError("");

        setDeleteMessage("");

    };


    const handleDeleteTask = async () => {

        if (!deleteTaskData) {
            return;
        }

        try {

            setDeleteLoading(true);

            setDeleteError("");

            setDeleteMessage("");

            const response = await deleteTask(
                deleteTaskData._id,
                token
            );

            setDeleteMessage(
                response.message ||
                "Task deleted successfully."
            );

            setTimeout(() => {

                setDeleteTaskData(null);

                setDeleteMessage("");

                setDeleteLoading(false);

                /*
                 * If the deleted task was the only
                 * task on the current page,
                 * go to the previous page.
                 */

                if (
                    tasks.length === 1 &&
                    currentPage > 1
                ) {

                    setCurrentPage(
                        (previousPage) =>
                            previousPage - 1
                    );

                } else {

                    fetchTasks();

                }

            }, 800);

        } catch (error) {

            console.error(
                "Failed to delete task:",
                error
            );

            setDeleteError(
                error.response?.data?.message ||
                "Failed to delete task."
            );

            setDeleteLoading(false);

        }

    };


    const closeDeleteModal = () => {

        if (deleteLoading) {
            return;
        }

        setDeleteTaskData(null);

        setDeleteError("");

        setDeleteMessage("");

    };


    /* =========================
       INITIAL LOADING
    ========================= */

    if (loading) {
        return <Loading />;
    }


    return (

        <div className="tasks-page">

            {/* =====================================================
                PAGE HEADER
            ===================================================== */}

            <div className="tasks-header">

                <div className="tasks-header-content">

                    <h2>
                        Tasks
                    </h2>

                    <p>
                        Manage and monitor all assigned tasks.
                    </p>

                </div>

                <button
                    type="button"
                    className="tasks-create-btn"
                    onClick={() => navigate("/admin/tasks/create")}
                >
                    <i className="bi bi-plus"></i>
                    <span>Create Task</span>
                </button>

            </div>


            {/* =====================================================
                ERROR
            ===================================================== */}

            {error && (

                <div className="tasks-alert">

                    <i className="bi bi-exclamation-circle-fill"></i>

                    <span>
                        {error}
                    </span>

                </div>

            )}


            {/* =====================================================
                STATUS FILTER
            ===================================================== */}

            <div className="tasks-toolbar">

                <div className="task-filter-group">

                    <button
                        type="button"
                        className={
                            statusFilter === "all"
                                ? "task-filter active"
                                : "task-filter"
                        }
                        onClick={() =>
                            handleStatusFilter("all")
                        }
                    >
                        All
                    </button>

                    <button
                        type="button"
                        className={
                            statusFilter === "pending"
                                ? "task-filter active"
                                : "task-filter"
                        }
                        onClick={() =>
                            handleStatusFilter("pending")
                        }
                    >
                        Pending
                    </button>

                    <button
                        type="button"
                        className={
                            statusFilter === "in-progress"
                                ? "task-filter active"
                                : "task-filter"
                        }
                        onClick={() =>
                            handleStatusFilter("in-progress")
                        }
                    >
                        In Progress
                    </button>

                    <button
                        type="button"
                        className={
                            statusFilter === "completed"
                                ? "task-filter active"
                                : "task-filter"
                        }
                        onClick={() =>
                            handleStatusFilter("completed")
                        }
                    >
                        Completed
                    </button>

                </div>

            </div>


            {/* =====================================================
                SUMMARY
            ===================================================== */}

            <div className="tasks-summary">

                <span>

                    Showing{" "}

                    <strong>
                        {tasks.length}
                    </strong>

                    {" "}

                    task
                    {tasks.length !== 1 ? "s" : ""}

                </span>

                <span>

                    Total:{" "}

                    <strong>
                        {pagination.totalTasks}
                    </strong>

                </span>

            </div>


            {/* =====================================================
                TASK TABLE
            ===================================================== */}

            <div className="tasks-card">

                {tasks.length === 0 ? (

                    <div className="tasks-empty">

                        <div className="tasks-empty-icon">

                            <i className="bi bi-clipboard-x"></i>

                        </div>

                        <h4>
                            No tasks found
                        </h4>

                        <p>
                            There are no tasks matching
                            the selected filter.
                        </p>

                    </div>

                ) : (

                    <div className="table-responsive">

                        <table className="tasks-table">

                            <thead>

                                <tr>

                                    <th>
                                        Task
                                    </th>

                                    <th>
                                        Project
                                    </th>

                                    <th>
                                        Assigned To
                                    </th>

                                    <th>
                                        Priority
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                        Due Date
                                    </th>

                                    <th>
                                        Created
                                    </th>

                                    <th>
                                        Actions
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {tasks.map((task) => (

                                    <tr key={task._id}>

                                        {/* Task */}

                                        <td>

                                            <div className="task-title">
                                                {task.title}
                                            </div>

                                            <div className="task-description">
                                                {task.description}
                                            </div>

                                        </td>


                                        {/* Project */}

                                        <td>

                                            <div className="task-project">

                                                <i className="bi bi-kanban"></i>

                                                <div>
                                                    <div className="project-name">
                                                        {task.project?.name || "-"}
                                                    </div>

                                                    {task.project?.status && (
                                                        <div className="project-status-text">
                                                            {task.project.status.charAt(0).toUpperCase() +
                                                                task.project.status.slice(1)}
                                                        </div>
                                                    )}
                                                </div>

                                            </div>

                                        </td>


                                        {/* Assigned To */}

                                        <td>

                                            <div className="assigned-user">

                                                <div className="user-avatar">

                                                    {task.assignedTo?.name
                                                        ?.charAt(0)
                                                        ?.toUpperCase() ||
                                                        "?"}

                                                </div>

                                                <div>

                                                    <div className="user-name">

                                                        {task.assignedTo?.name ||
                                                            "-"}

                                                    </div>

                                                    <div className="user-email">

                                                        {task.assignedTo?.email ||
                                                            ""}

                                                    </div>

                                                </div>

                                            </div>

                                        </td>


                                        {/* Priority */}

                                        <td>

                                            <span
                                                className={`priority-badge priority-${task.priority}`}
                                            >
                                                {getPriorityLabel(
                                                    task.priority
                                                )}
                                            </span>

                                        </td>


                                        {/* Status */}

                                        <td>

                                            <span
                                                className={`task-status status-${task.status}`}
                                            >
                                                {getStatusLabel(
                                                    task.status
                                                )}
                                            </span>

                                        </td>


                                        {/* Due Date */}

                                        <td>

                                            {formatDate(
                                                task.dueDate
                                            )}

                                        </td>


                                        {/* Created */}

                                        <td>

                                            {formatDate(
                                                task.createdAt
                                            )}

                                        </td>


                                        {/* Actions */}

                                        <td>

                                            <div className="task-actions">

                                                {/* View */}

                                                <button
                                                    type="button"
                                                    className="task-action-btn view"
                                                    title="View Task"
                                                    onClick={() =>
                                                        handleViewTask(
                                                            task._id
                                                        )
                                                    }
                                                >
                                                    <i className="bi bi-eye"></i>
                                                </button>


                                                {/* Edit */}

                                                <button
                                                    type="button"
                                                    className="task-action-btn edit"
                                                    title="Edit Task"
                                                    onClick={() =>
                                                        handleEditTask(
                                                            task._id
                                                        )
                                                    }
                                                >
                                                    <i className="bi bi-pencil"></i>
                                                </button>


                                                {/* Delete */}

                                                <button
                                                    type="button"
                                                    className="task-action-btn delete"
                                                    title="Delete Task"
                                                    onClick={() => handleDeleteClick(task)}
                                                >
                                                    <i className="bi bi-trash"></i>
                                                </button>
                                            </div>

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>


            {/* =====================================================
                PAGINATION
            ===================================================== */}

            {pagination.totalPages > 1 && (

                <div className="tasks-pagination">

                    <button
                        type="button"
                        onClick={() =>
                            handlePageChange(
                                currentPage - 1
                            )
                        }
                        disabled={
                            currentPage === 1
                        }
                        title="Previous page"
                    >
                        <i className="bi bi-chevron-left"></i>
                    </button>


                    {Array.from(
                        {
                            length:
                                pagination.totalPages
                        },
                        (_, index) =>
                            index + 1
                    ).map((page) => (

                        <button
                            type="button"
                            key={page}
                            className={
                                currentPage === page
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                handlePageChange(page)
                            }
                        >
                            {page}
                        </button>

                    ))}


                    <button
                        type="button"
                        onClick={() =>
                            handlePageChange(
                                currentPage + 1
                            )
                        }
                        disabled={
                            currentPage ===
                            pagination.totalPages
                        }
                        title="Next page"
                    >
                        <i className="bi bi-chevron-right"></i>
                    </button>

                </div>

            )}


            {/* =====================================================
                VIEW TASK MODAL
            ===================================================== */}

            {(selectedTask ||
                viewLoading ||
                viewError) && (

                    <div
                        className="task-modal-overlay"
                        onClick={closeTaskModal}
                    >

                        <div
                            className="task-modal"
                            onClick={(e) =>
                                e.stopPropagation()
                            }
                        >

                            {/* Header */}

                            <div className="task-modal-header">

                                <div>

                                    <h3>
                                        Task Details
                                    </h3>

                                    <p>
                                        View complete task information
                                    </p>

                                </div>

                                <button
                                    type="button"
                                    className="task-modal-close"
                                    onClick={closeTaskModal}
                                    title="Close"
                                >
                                    <i className="bi bi-x-lg"></i>
                                </button>

                            </div>


                            {/* Body */}

                            <div className="task-modal-body">

                                {viewLoading && (

                                    <div className="task-modal-loading">

                                        <span
                                            className="spinner-border spinner-border-sm"
                                            role="status"
                                            aria-hidden="true"
                                        ></span>

                                        <span>
                                            Loading task...
                                        </span>

                                    </div>

                                )}


                                {!viewLoading &&
                                    viewError && (

                                        <div className="task-modal-error">

                                            <i className="bi bi-exclamation-circle"></i>

                                            <span>
                                                {viewError}
                                            </span>

                                        </div>

                                    )}


                                {!viewLoading &&
                                    !viewError &&
                                    selectedTask && (

                                        <>

                                            <div className="task-detail-main">

                                                <span className="task-detail-label">
                                                    Task
                                                </span>

                                                <h4>
                                                    {selectedTask.title}
                                                </h4>

                                            </div>


                                            <div className="task-detail-section">

                                                <span className="task-detail-label">
                                                    Description
                                                </span>

                                                <p className="task-detail-description">

                                                    {selectedTask.description ||
                                                        "-"}

                                                </p>

                                            </div>


                                            <div className="task-detail-grid">

                                                <div className="task-detail-item">

                                                    <span className="task-detail-label">
                                                        Project
                                                    </span>

                                                    <strong>
                                                        {selectedTask.project?.name || "-"}
                                                    </strong>

                                                    <small>
                                                        {selectedTask.project?.status || ""}
                                                    </small>

                                                </div>

                                                <div className="task-detail-item">

                                                    <span className="task-detail-label">
                                                        Assigned To
                                                    </span>

                                                    <strong>
                                                        {selectedTask
                                                            .assignedTo
                                                            ?.name || "-"}
                                                    </strong>

                                                    <small>
                                                        {selectedTask
                                                            .assignedTo
                                                            ?.email || ""}
                                                    </small>

                                                </div>


                                                <div className="task-detail-item">

                                                    <span className="task-detail-label">
                                                        Assigned By
                                                    </span>

                                                    <strong>
                                                        {selectedTask
                                                            .assignedBy
                                                            ?.name || "-"}
                                                    </strong>

                                                    <small>
                                                        {selectedTask
                                                            .assignedBy
                                                            ?.email || ""}
                                                    </small>

                                                </div>


                                                <div className="task-detail-item">

                                                    <span className="task-detail-label">
                                                        Priority
                                                    </span>

                                                    <span
                                                        className={`priority-badge priority-${selectedTask.priority}`}
                                                    >
                                                        {getPriorityLabel(
                                                            selectedTask.priority
                                                        )}
                                                    </span>

                                                </div>


                                                <div className="task-detail-item">

                                                    <span className="task-detail-label">
                                                        Status
                                                    </span>

                                                    <span
                                                        className={`task-status status-${selectedTask.status}`}
                                                    >
                                                        {getStatusLabel(
                                                            selectedTask.status
                                                        )}
                                                    </span>

                                                </div>


                                                <div className="task-detail-item">

                                                    <span className="task-detail-label">
                                                        Due Date
                                                    </span>

                                                    <strong>
                                                        {formatDate(
                                                            selectedTask.dueDate
                                                        )}
                                                    </strong>

                                                </div>


                                                <div className="task-detail-item">

                                                    <span className="task-detail-label">
                                                        Created
                                                    </span>

                                                    <strong>
                                                        {formatDate(
                                                            selectedTask.createdAt
                                                        )}
                                                    </strong>

                                                </div>

                                            </div>

                                        </>

                                    )}

                            </div>


                            {/* Footer */}

                            <div className="task-modal-footer">

                                <button
                                    type="button"
                                    className="task-modal-close-btn"
                                    onClick={closeTaskModal}
                                >
                                    Close
                                </button>

                            </div>

                        </div>

                    </div>

                )}


            {/* =====================================================
                EDIT TASK MODAL
            ===================================================== */}

            {(editTask || editLoading) && (

                <div
                    className="task-modal-overlay"
                    onClick={closeEditModal}
                >

                    <div
                        className="task-modal edit-task-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        {/* Header */}

                        <div className="task-modal-header">

                            <div>

                                <h3>
                                    Edit Task
                                </h3>

                                <p>
                                    Update task information
                                </p>

                            </div>

                            <button
                                type="button"
                                className="task-modal-close"
                                onClick={closeEditModal}
                                disabled={editSaving}
                                title="Close"
                            >
                                <i className="bi bi-x-lg"></i>
                            </button>

                        </div>


                        {/* Body */}

                        <div className="task-modal-body">

                            {editLoading ? (

                                <div className="task-modal-loading">

                                    <span
                                        className="spinner-border spinner-border-sm"
                                        role="status"
                                        aria-hidden="true"
                                    ></span>

                                    <span>
                                        Loading task...
                                    </span>

                                </div>

                            ) : (

                                <form
                                    id="edit-task-form"
                                    onSubmit={
                                        handleUpdateTask
                                    }
                                    className="edit-task-form"
                                >

                                    {/* Error */}

                                    {editError && (

                                        <div className="task-modal-error">

                                            <i className="bi bi-exclamation-circle"></i>

                                            <span>
                                                {editError}
                                            </span>

                                        </div>

                                    )}


                                    {/* Success */}

                                    {editMessage && (

                                        <div className="task-edit-success">

                                            <i className="bi bi-check-circle-fill"></i>

                                            <span>
                                                {editMessage}
                                            </span>

                                        </div>

                                    )}


                                    {/* Title */}

                                    <div className="edit-form-group">

                                        <label>
                                            Task Title
                                            <span>*</span>
                                        </label>

                                        <div className="edit-input-wrapper">

                                            <i className="bi bi-card-text"></i>

                                            <input
                                                type="text"
                                                name="title"
                                                value={
                                                    editForm.title
                                                }
                                                onChange={
                                                    handleEditFormChange
                                                }
                                                placeholder="Enter task title"
                                                required
                                                disabled={
                                                    editSaving
                                                }
                                            />

                                        </div>

                                    </div>


                                    {/* Description */}

                                    <div className="edit-form-group">

                                        <label>
                                            Description
                                            <span>*</span>
                                        </label>

                                        <div className="edit-textarea-wrapper">

                                            <i className="bi bi-text-left"></i>

                                            <textarea
                                                name="description"
                                                value={
                                                    editForm.description
                                                }
                                                onChange={
                                                    handleEditFormChange
                                                }
                                                placeholder="Enter task description"
                                                required
                                                disabled={
                                                    editSaving
                                                }
                                            />

                                        </div>

                                    </div>


                                    {/* Project */}

                                    <div className="edit-form-group">

                                        <label>
                                            Project
                                            <span>*</span>
                                        </label>

                                        <div className="edit-input-wrapper">

                                            <i className="bi bi-kanban"></i>

                                            <select
                                                name="project"
                                                value={editForm.project}
                                                onChange={(event) => {
                                                    const { value } = event.target;
                                                    setEditForm((previous) => ({
                                                        ...previous,
                                                        project: value,
                                                        assignedTo: ""
                                                    }));
                                                }}
                                                required
                                                disabled={editSaving}
                                            >
                                                <option value="">
                                                    Select project
                                                </option>

                                                {projects.map((project) => (
                                                    <option
                                                        key={project._id}
                                                        value={project._id}
                                                    >
                                                        {project.name}
                                                    </option>
                                                ))}
                                            </select>

                                        </div>

                                    </div>


                                    {/* Assigned To */}

                                    <div className="edit-form-group">

                                        <label>
                                            Assign To
                                            <span>*</span>
                                        </label>

                                        <div className="edit-input-wrapper">

                                            <i className="bi bi-person"></i>

                                            <select
                                                name="assignedTo"
                                                value={
                                                    editForm.assignedTo
                                                }
                                                onChange={
                                                    handleEditFormChange
                                                }
                                                required
                                                disabled={
                                                    editSaving || !editForm.project
                                                }
                                            >

                                                <option value="">
                                                    {editForm.project
                                                        ? "Select employee"
                                                        : "Select project first"}
                                                </option>

                                                {getProjectEmployees(editForm.project).map(
                                                    (employee) => (

                                                        <option
                                                            key={
                                                                employee._id
                                                            }
                                                            value={
                                                                employee._id
                                                            }
                                                        >
                                                            {
                                                                employee.name
                                                            }
                                                        </option>

                                                    )
                                                )}

                                            </select>

                                        </div>

                                    </div>


                                    {/* Priority */}

                                    <div className="edit-form-row">

                                        <div className="edit-form-group">

                                            <label>
                                                Priority
                                            </label>

                                            <div className="edit-input-wrapper">

                                                <i className="bi bi-flag"></i>

                                                <select
                                                    name="priority"
                                                    value={
                                                        editForm.priority
                                                    }
                                                    onChange={
                                                        handleEditFormChange
                                                    }
                                                    disabled={
                                                        editSaving
                                                    }
                                                >

                                                    <option value="low">
                                                        Low
                                                    </option>

                                                    <option value="medium">
                                                        Medium
                                                    </option>

                                                    <option value="high">
                                                        High
                                                    </option>

                                                </select>

                                            </div>

                                        </div>




                                    </div>


                                    {/* Due Date */}

                                    <div className="edit-form-group">

                                        <label>
                                            Due Date
                                            <span>*</span>
                                        </label>

                                        <div className="edit-input-wrapper">

                                            <i className="bi bi-calendar3"></i>

                                            <input
                                                type="date"
                                                name="dueDate"
                                                value={
                                                    editForm.dueDate
                                                }
                                                onChange={
                                                    handleEditFormChange
                                                }
                                                required
                                                disabled={
                                                    editSaving
                                                }
                                            />

                                        </div>

                                    </div>

                                </form>

                            )}

                        </div>


                        {/* Footer */}

                        {!editLoading && (

                            <div className="task-modal-footer">

                                <button
                                    type="button"
                                    className="task-modal-close-btn"
                                    onClick={closeEditModal}
                                    disabled={editSaving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    form="edit-task-form"
                                    className="edit-task-save-btn"
                                    disabled={editSaving}
                                >

                                    {editSaving ? (

                                        <>
                                            <span
                                                className="spinner-border spinner-border-sm"
                                                role="status"
                                                aria-hidden="true"
                                            ></span>

                                            Updating...
                                        </>

                                    ) : (

                                        <>
                                            <i className="bi bi-check-lg"></i>

                                            Update Task
                                        </>

                                    )}

                                </button>

                            </div>

                        )}

                    </div>

                </div>

            )}

            {/* =====================================================
                DELETE TASK MODAL
            ===================================================== */}

            {deleteTaskData && (

                <div
                    className="task-modal-overlay"
                    onClick={closeDeleteModal}
                >

                    <div
                        className="task-modal delete-task-modal"
                        onClick={(e) => e.stopPropagation()}
                    >

                        {/* Header */}

                        <div className="task-modal-header">

                            <div>

                                <h3>
                                    Delete Task
                                </h3>

                                <p>
                                    Confirm task deletion
                                </p>

                            </div>

                            <button
                                type="button"
                                className="task-modal-close"
                                onClick={closeDeleteModal}
                                disabled={deleteLoading}
                                title="Close"
                            >
                                <i className="bi bi-x-lg"></i>
                            </button>

                        </div>

                        {/* Body */}

                        <div className="task-modal-body">

                            <div className="delete-warning-icon">

                                <i className="bi bi-exclamation-triangle"></i>

                            </div>

                            <h4 className="delete-confirm-title">

                                Are you sure you want to delete this task?

                            </h4>

                            <div className="delete-task-name">

                                {deleteTaskData.title}

                            </div>

                            <p className="delete-confirm-text">

                                This task will be removed from the
                                active task list.

                            </p>

                            {deleteError && (

                                <div className="task-modal-error">

                                    <i className="bi bi-exclamation-circle"></i>

                                    <span>
                                        {deleteError}
                                    </span>

                                </div>

                            )}

                            {deleteMessage && (

                                <div className="task-edit-success">

                                    <i className="bi bi-check-circle-fill"></i>

                                    <span>
                                        {deleteMessage}
                                    </span>

                                </div>

                            )}

                        </div>

                        {/* Footer */}

                        <div className="task-modal-footer">

                            <button
                                type="button"
                                className="task-modal-close-btn"
                                onClick={closeDeleteModal}
                                disabled={deleteLoading}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="delete-task-btn"
                                onClick={handleDeleteTask}
                                disabled={deleteLoading}
                            >

                                {deleteLoading ? (

                                    <>
                                        <span
                                            className="spinner-border spinner-border-sm"
                                            role="status"
                                            aria-hidden="true"
                                        ></span>

                                        Deleting...
                                    </>

                                ) : (

                                    <>
                                        <i className="bi bi-trash"></i>

                                        Delete Task
                                    </>

                                )}

                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
};

export default Tasks;
