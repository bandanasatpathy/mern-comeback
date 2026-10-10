import React, { useEffect, useState } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";

import { useAuth } from "../../context/AuthContext";
import Loading from "../../components/Loading";

import {
    getMyTasks,
    completeTask,
    getTaskComments,
    addTaskComment
} from "../../services/taskService";

import "./MyTasks.css";


const MyTasks = () => {

    const { token } = useAuth();


    /* =====================================================
       TASK DATA
    ===================================================== */

    const [tasks, setTasks] = useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [message, setMessage] =
        useState("");


    /* =====================================================
       FILTER
    ===================================================== */

    const [statusFilter, setStatusFilter] =
        useState("all");


    /* =====================================================
       PAGINATION
    ===================================================== */

    const [currentPage, setCurrentPage] =
        useState(1);

    const [pagination, setPagination] =
        useState({
            page: 1,
            limit: 10,
            totalTasks: 0,
            totalPages: 0
        });

    const [pageSize, setPageSize] = useState(10);

    const [searchQuery, setSearchQuery] = useState("");


    /* =====================================================
       TASK ACTION
    ===================================================== */

    const [actionLoading, setActionLoading] =
        useState(null);


    /* =====================================================
       VIEW TASK
    ===================================================== */

    const [selectedTask, setSelectedTask] =
        useState(null);

    const [viewLoading, setViewLoading] =
        useState(false);


    /* =====================================================
       COMMENTS
    ===================================================== */

    const [comments, setComments] =
        useState([]);

    const [commentText, setCommentText] =
        useState("");

    const [commentsLoading, setCommentsLoading] =
        useState(false);

    const [commentSubmitting, setCommentSubmitting] =
        useState(false);

    const [commentError, setCommentError] =
        useState("");

    const [commentMessage, setCommentMessage] =
        useState("");


    /* =====================================================
       FETCH MY TASKS
    ===================================================== */

    const fetchTasks = async () => {

        if (!token) {

            setError(
                "Authentication token is missing."
            );

            setLoading(false);

            return;
        }


        try {

            setLoading(true);

            setError("");

            const response =
                await getMyTasks(
                    token,
                    currentPage,
                    pageSize
                );


            setTasks(
                response.data || []
            );


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
                "Failed to fetch my tasks:",
                error
            );


            setError(
                error.response?.data?.message ||
                error.message ||
                "Failed to load your tasks."
            );


        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {

        fetchTasks();

    }, [currentPage, token, pageSize]);


    /* =====================================================
       FILTER
    ===================================================== */

    const filteredTasks = tasks
        .filter((task) =>
            statusFilter === "all"
                ? true
                : task.status === statusFilter
        )
        .filter((task) => {
            const query = searchQuery.trim().toLowerCase();

            if (!query) {
                return true;
            }

            return [
                task.title,
                task.description,
                task.priority,
                task.status,
                task.dueDate,
                task.createdAt
            ]
                .filter(Boolean)
                .some((value) =>
                    String(value).toLowerCase().includes(query)
                );
        });


    const handleStatusFilter = (status) => {

        setStatusFilter(status);

        setCurrentPage(1);

    };

    const handlePageSizeChange = (event) => {

        const nextSize = Number(event.target.value);

        setPageSize(nextSize);
        setCurrentPage(1);

    };


    /* =====================================================
       STATUS
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


    const getStatusIcon = (status) => {

        switch (status) {

            case "pending":
                return "bi-clock";

            case "in-progress":
                return "bi-arrow-repeat";

            case "completed":
                return "bi-check-circle";

            default:
                return "bi-circle";

        }
    };


    /* =====================================================
       PRIORITY
    ===================================================== */

    const getPriorityLabel = (priority) => {

        if (!priority) {
            return "-";
        }

        const value = String(priority).toLowerCase();

        switch (value) {
            case "low":
                return "Low";

            case "medium":
                return "Medium";

            case "high":
                return "High";

            case "urgent":
                return "Urgent";

            default:
                return priority.charAt(0).toUpperCase() + priority.slice(1);
        }
    };

    const formatDate = (date) => {
        if (!date) return "-";

        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    const isOverdue = (task) => {
        if (!task?.dueDate || task.status === "completed") {
            return false;
        }

        return new Date(task.dueDate) < new Date();
    };

    const totalCount = tasks.length;
    const pendingCount = tasks.filter((task) => task.status === "pending").length;
    const inProgressCount = tasks.filter((task) => task.status === "in-progress").length;
    const completedCount = tasks.filter((task) => task.status === "completed").length;

    const handlePageChange = (page) => {
        if (page < 1 || page > pagination.totalPages) {
            return;
        }

        setCurrentPage(page);
    };

    const handleViewTask = async (task) => {
        if (!task || !token) return;

        setSelectedTask(task);
        setViewLoading(true);
        setCommentError("");
        setCommentMessage("");
        setComments([]);
        setCommentText("");

        try {
            const response = await getTaskComments(task._id, token);
            setComments(response.data || []);
        } catch (error) {
            console.error("Failed to load task comments:", error);
            setCommentError(
                error.response?.data?.message ||
                error.message ||
                "Failed to load task comments."
            );
        } finally {
            setViewLoading(false);
        }
    };

    const closeTaskModal = () => {
        setSelectedTask(null);
        setComments([]);
        setCommentText("");
        setCommentError("");
        setCommentMessage("");
        setViewLoading(false);
    };

    const handleAddComment = async (event) => {
        event.preventDefault();

        if (!selectedTask || !commentText.trim()) {
            return;
        }

        setCommentSubmitting(true);
        setCommentError("");
        setCommentMessage("");

        try {
            const response = await addTaskComment(
                selectedTask._id,
                commentText.trim(),
                token
            );

            setComments((previousComments) => [response.data, ...previousComments]);
            setCommentText("");
            setCommentMessage("Update posted successfully.");
        } catch (error) {
            setCommentError(
                error.response?.data?.message ||
                error.message ||
                "Failed to post update."
            );
        } finally {
            setCommentSubmitting(false);
        }
    };

    const handleTaskAction = async (task) => {
    if (!task || !token) {
        return;
    }

    setActionLoading(task._id);

    try {
        const response = await completeTask(
            task._id,
            token
        );

        const updatedTask =
            response?.data ||
            response?.task ||
            task;

        setTasks((previousTasks) =>
            previousTasks.map((item) =>
                item._id === task._id
                    ? {
                        ...item,
                        ...updatedTask
                    }
                    : item
            )
        );

        if (
            selectedTask &&
            selectedTask._id === task._id
        ) {
            setSelectedTask((previousTask) => ({
                ...previousTask,
                ...updatedTask
            }));
        }

        setMessage(
            task.status === "pending"
                ? "Task started successfully."
                : "Task completed successfully."
        );

        await fetchTasks();

    } catch (error) {

        console.error(
            "Failed to update task:",
            error
        );

        setMessage(
            error.response?.data?.message ||
            error.message ||
            "Failed to update task."
        );

    } finally {

        setActionLoading(null);

    }
};

        return (

        <div className="my-tasks-page">

            <div className="my-tasks-header">

                <div className="my-tasks-title-wrap">

                    <div className="my-tasks-title-icon">
                        <i className="bi bi-list-check"></i>
                    </div>

                    <div>
                        <h2>My Tasks</h2>
                        <p>View your assigned work and update its progress.</p>
                    </div>

                </div>

                <div className="my-tasks-total">
                    <span>Total Tasks</span>
                    <strong>{totalCount}</strong>
                </div>

            </div>


            {error && (
                <div className="my-tasks-alert error">
                    <i className="bi bi-exclamation-circle-fill"></i>
                    <span>{error}</span>
                </div>
            )}

            {message && (
                <div className="my-tasks-alert success">
                    <i className="bi bi-check-circle-fill"></i>
                    <span>{message}</span>
                    <button
                        type="button"
                        aria-label="Dismiss message"
                        onClick={() => setMessage("")}
                    >
                        <i className="bi bi-x"></i>
                    </button>
                </div>
            )}


            <div className="my-task-stats">

                <button
                    type="button"
                    className={statusFilter === "all" ? "my-task-stat active all" : "my-task-stat all"}
                    onClick={() => handleStatusFilter("all")}
                >
                    <span className="my-task-stat-icon all">
                        <i className="bi bi-collection"></i>
                    </span>
                    <span>
                        <strong>{totalCount}</strong>
                        <small>All Tasks</small>
                    </span>
                </button>

                <button
                    type="button"
                    className={statusFilter === "pending" ? "my-task-stat active pending" : "my-task-stat pending"}
                    onClick={() => handleStatusFilter("pending")}
                >
                    <span className="my-task-stat-icon pending">
                        <i className="bi bi-clock"></i>
                    </span>
                    <span>
                        <strong>{pendingCount}</strong>
                        <small>Pending</small>
                    </span>
                </button>

                <button
                    type="button"
                    className={statusFilter === "in-progress" ? "my-task-stat active progress" : "my-task-stat progress"}
                    onClick={() => handleStatusFilter("in-progress")}
                >
                    <span className="my-task-stat-icon progress">
                        <i className="bi bi-arrow-repeat"></i>
                    </span>
                    <span>
                        <strong>{inProgressCount}</strong>
                        <small>In Progress</small>
                    </span>
                </button>

                <button
                    type="button"
                    className={statusFilter === "completed" ? "my-task-stat active completed" : "my-task-stat completed"}
                    onClick={() => handleStatusFilter("completed")}
                >
                    <span className="my-task-stat-icon completed">
                        <i className="bi bi-check-circle"></i>
                    </span>
                    <span>
                        <strong>{completedCount}</strong>
                        <small>Completed</small>
                    </span>
                </button>

            </div>


            <div className="my-tasks-workspace">

                <div className="my-tasks-toolbar">

                    <div className="my-tasks-show">
                        <span>Show</span>

                        <select
                            value={pageSize}
                            onChange={handlePageSizeChange}
                            aria-label="Number of tasks per page"
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                        </select>

                        <span>entries</span>
                    </div>

                    <div className="my-tasks-search">
                        <i className="bi bi-search"></i>

                        <input
                            type="search"
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            placeholder="Search tasks..."
                            aria-label="Search tasks"
                        />

                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery("")}
                                aria-label="Clear search"
                            >
                                <i className="bi bi-x"></i>
                            </button>
                        )}
                    </div>

                </div>


                {filteredTasks.length === 0 ? (

                    <div className="my-tasks-empty">

                        <div className="my-tasks-empty-icon">
                            <i className="bi bi-clipboard-x"></i>
                        </div>

                        <h3>No tasks found</h3>

                        <p>
                            {searchQuery
                                ? "No tasks match your search."
                                : statusFilter === "all"
                                    ? "You currently have no assigned tasks."
                                    : `You have no ${getStatusLabel(statusFilter).toLowerCase()} tasks.`}
                        </p>

                    </div>

                ) : (

                    <div className="my-tasks-table-wrap">

                        <table className="my-tasks-table">

                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Task</th>
                                    <th>Priority</th>
                                    <th>Status</th>
                                    <th>Due Date</th>
                                    <th>Created</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>

                                {filteredTasks.map((task, index) => (

                                    <tr
                                        key={task._id}
                                        className={isOverdue(task) ? "is-overdue" : ""}
                                    >

                                        <td className="my-task-number">
                                            {(currentPage - 1) * pageSize + index + 1}
                                        </td>

                                        <td className="my-task-title-cell">

                                            <div className="my-task-title-row">
                                                <span className="my-task-title-dot"></span>

                                                <div>
                                                    <strong>{task.title}</strong>

                                                    <span className="my-task-description">
                                                        {task.description || "No description provided."}
                                                    </span>
                                                </div>
                                            </div>

                                        </td>

                                        <td>
                                            <span className={`my-task-priority priority-${task.priority}`}>
                                                <i className="bi bi-dot"></i>
                                                {getPriorityLabel(task.priority)}
                                            </span>
                                        </td>

                                        <td>
                                            <span className={`my-task-status status-${task.status}`}>
                                                <i className={`bi ${getStatusIcon(task.status)}`}></i>
                                                {getStatusLabel(task.status)}
                                            </span>
                                        </td>

                                        <td className="my-task-date-cell">

                                            <span className={isOverdue(task) ? "overdue-label" : ""}>
                                                <i className="bi bi-calendar3"></i>
                                                {formatDate(task.dueDate)}
                                            </span>

                                            {isOverdue(task) && (
                                                <small>Overdue</small>
                                            )}

                                        </td>

                                        <td className="my-task-created-cell">
                                            <i className="bi bi-calendar3"></i>
                                            {formatDate(task.createdAt)}
                                        </td>

                                        <td>

                                            <div className="my-task-actions">

                                                <button
                                                    type="button"
                                                    className="my-task-icon-btn view"
                                                    onClick={() => handleViewTask(task)}
                                                    title="View task"
                                                    aria-label={`View ${task.title}`}
                                                >
                                                    <i className="bi bi-eye"></i>
                                                </button>

                                                {task.status !== "completed" && (
                                                    <button
                                                        type="button"
                                                        className="my-task-icon-btn action"
                                                        onClick={() => handleTaskAction(task)}
                                                        disabled={actionLoading === task._id}
                                                        title={task.status === "pending" ? "Start task" : "Complete task"}
                                                        aria-label={task.status === "pending" ? `Start ${task.title}` : `Complete ${task.title}`}
                                                    >
                                                        {actionLoading === task._id ? (
                                                            <span
                                                                className="spinner-border spinner-border-sm"
                                                                role="status"
                                                                aria-hidden="true"
                                                            ></span>
                                                        ) : (
                                                            <i
                                                                className={task.status === "pending" ? "bi bi-play-fill" : "bi bi-check-lg"}
                                                            ></i>
                                                        )}
                                                    </button>
                                                )}

                                            </div>

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                )}


                <div className="my-tasks-table-footer">

                    <span>
                        Showing <strong>{filteredTasks.length}</strong> of{" "}
                        <strong>{pagination.totalTasks}</strong> tasks
                    </span>

                    {pagination.totalPages > 1 && (
                        <div className="my-tasks-pagination">

                            <button
                                type="button"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                aria-label="Previous page"
                            >
                                <i className="bi bi-chevron-left"></i>
                            </button>

                            {Array.from(
                                { length: pagination.totalPages },
                                (_, index) => index + 1
                            ).map((page) => (
                                <button
                                    type="button"
                                    key={page}
                                    className={currentPage === page ? "active" : ""}
                                    onClick={() => handlePageChange(page)}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                type="button"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === pagination.totalPages}
                                aria-label="Next page"
                            >
                                <i className="bi bi-chevron-right"></i>
                            </button>

                        </div>
                    )}

                </div>

            </div>


            {selectedTask && (

                <div
                    className="my-task-modal-overlay"
                    onClick={closeTaskModal}
                >

                    <div
                        className="my-task-modal"
                        onClick={(event) => event.stopPropagation()}
                    >

                        <div className="my-task-modal-header">

                            <div className="my-task-modal-heading">

                                <div className="my-task-modal-icon">
                                    <i className="bi bi-list-check"></i>
                                </div>

                                <div>
                                    <span>Task Details</span>
                                    <h3>{selectedTask.title}</h3>
                                </div>

                            </div>

                            <button
                                type="button"
                                onClick={closeTaskModal}
                                disabled={commentSubmitting}
                                aria-label="Close task details"
                            >
                                <i className="bi bi-x-lg"></i>
                            </button>

                        </div>


                        {viewLoading ? (

                            <div className="my-task-modal-loading">
                                <span
                                    className="spinner-border spinner-border-sm"
                                    role="status"
                                    aria-hidden="true"
                                ></span>
                                Loading task...
                            </div>

                        ) : (

                            <div className="my-task-modal-panels">

                                <div className="my-task-modal-details">

                                    <div className="my-task-modal-status-row">

                                        <span className={`my-task-status status-${selectedTask.status}`}>
                                            <i className={`bi ${getStatusIcon(selectedTask.status)}`}></i>
                                            {getStatusLabel(selectedTask.status)}
                                        </span>

                                        <span className={`my-task-priority priority-${selectedTask.priority}`}>
                                            <i className="bi bi-dot"></i>
                                            {getPriorityLabel(selectedTask.priority)}
                                        </span>

                                    </div>


                                    <section className="my-task-detail-section description">
                                        <label>Description</label>
                                        <p>
                                            {selectedTask.description || "No description provided."}
                                        </p>
                                    </section>


                                    <section className="my-task-detail-grid">

                                        <div>
                                            <label>Assigned By</label>
                                            <strong>{selectedTask.assignedBy?.name || "-"}</strong>
                                            <small>{selectedTask.assignedBy?.email || ""}</small>
                                        </div>

                                        <div>
                                            <label>Due Date</label>
                                            <strong>{formatDate(selectedTask.dueDate)}</strong>
                                        </div>

                                        <div>
                                            <label>Created</label>
                                            <strong>{formatDate(selectedTask.createdAt)}</strong>
                                        </div>

                                    </section>

                                </div>


                                <div className="my-task-comments">

                                    <div className="my-task-comments-header">

                                        <div>
                                            <h4>
                                                <i className="bi bi-chat-left-text"></i>
                                                Progress & Comments
                                            </h4>
                                            <p>Share updates about your progress on this task.</p>
                                        </div>

                                        <span className="my-task-comments-count">
                                            {comments.length}
                                        </span>

                                    </div>


                                    {commentError && (
                                        <div className="my-task-comment-alert error">
                                            <i className="bi bi-exclamation-circle"></i>
                                            <span>{commentError}</span>
                                        </div>
                                    )}

                                    {commentMessage && (
                                        <div className="my-task-comment-alert success">
                                            <i className="bi bi-check-circle"></i>
                                            <span>{commentMessage}</span>
                                        </div>
                                    )}


                                    <div className="my-task-comments-list">

                                        {commentsLoading ? (

                                            <div className="my-task-comments-loading">
                                                <span
                                                    className="spinner-border spinner-border-sm"
                                                    role="status"
                                                    aria-hidden="true"
                                                ></span>
                                                Loading comments...
                                            </div>

                                        ) : comments.length === 0 ? (

                                            <div className="my-task-comments-empty">
                                                <div className="my-task-comments-empty-icon">
                                                    <i className="bi bi-chat"></i>
                                                </div>
                                                <strong>No comments yet</strong>
                                                <span>Add an update about your progress.</span>
                                            </div>

                                        ) : (

                                            comments.map((comment) => (

                                                <div className="my-task-comment" key={comment._id}>

                                                    <div className="my-task-comment-avatar">
                                                        {comment.user?.name?.charAt(0)?.toUpperCase() || "U"}
                                                    </div>

                                                    <div className="my-task-comment-content">

                                                        <div className="my-task-comment-top">
                                                            <strong>{comment.user?.name || "User"}</strong>
                                                            <span>
                                                                {comment.user?.role === "admin" ? "Admin" : "Employee"}
                                                            </span>
                                                        </div>

                                                        <p>{comment.message}</p>

                                                        <small>
                                                            {comment.createdAt
                                                                ? new Date(comment.createdAt).toLocaleString(
                                                                    "en-IN",
                                                                    {
                                                                        day: "2-digit",
                                                                        month: "short",
                                                                        year: "numeric",
                                                                        hour: "2-digit",
                                                                        minute: "2-digit"
                                                                    }
                                                                )
                                                                : "-"}
                                                        </small>

                                                    </div>

                                                </div>

                                            ))

                                        )}

                                    </div>


                                    <form
                                        className="my-task-comment-form"
                                        onSubmit={handleAddComment}
                                    >

                                        <div className="my-task-comment-input">

                                            <textarea
                                                value={commentText}
                                                onChange={(event) => {

                                                    setCommentText(event.target.value);

                                                    if (commentError) {
                                                        setCommentError("");
                                                    }

                                                    if (commentMessage) {
                                                        setCommentMessage("");
                                                    }

                                                }}
                                                placeholder="Write an update about your progress..."
                                                maxLength={2000}
                                                rows={3}
                                                disabled={commentSubmitting}
                                            ></textarea>

                                            <span>{commentText.length}/2000</span>

                                        </div>

                                        <button
                                            type="submit"
                                            className="my-task-comment-submit"
                                            disabled={commentSubmitting || !commentText.trim()}
                                        >
                                            {commentSubmitting ? (
                                                <>
                                                    <span
                                                        className="spinner-border spinner-border-sm"
                                                        role="status"
                                                        aria-hidden="true"
                                                    ></span>
                                                    Posting...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="bi bi-send"></i>
                                                    Post Update
                                                </>
                                            )}
                                        </button>

                                    </form>

                                </div>

                            </div>

                        )}


                        <div className="my-task-modal-footer">

                            <button
                                type="button"
                                className="my-task-close-btn"
                                onClick={closeTaskModal}
                                disabled={commentSubmitting}
                            >
                                Close
                            </button>

                            {selectedTask.status !== "completed" && (
                                <button
                                    type="button"
                                    className="my-task-action-btn"
                                    onClick={() => handleTaskAction(selectedTask)}
                                    disabled={actionLoading === selectedTask._id}
                                >
                                    <i
                                        className={
                                            selectedTask.status === "pending"
                                                ? "bi bi-play-fill"
                                                : "bi bi-check-lg"
                                        }
                                    ></i>
                                    {selectedTask.status === "pending"
                                        ? "Start Task"
                                        : "Complete Task"}
                                </button>
                            )}

                        </div>

                    </div>

                </div>

            )}

        </div>

    );
    
};


export default MyTasks;