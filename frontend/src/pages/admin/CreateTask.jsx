import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Loading from "../../components/Loading";
import { getAllEmployees } from "../../services/userService";
import { getAllProjects } from "../../services/projectService";
import { createTask } from "../../services/taskService";
import "./CreateTask.css";

const CreateTask = () => {
    const { token } = useAuth();
    const navigate = useNavigate();

    const [employees, setEmployees] = useState([]);
    const [projects, setProjects] = useState([]);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        priority: "medium",
        assignedTo: "",
        project: "",
        dueDate: ""
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    /* =====================================================
       FETCH ACTIVE EMPLOYEES + PROJECTS
    ===================================================== */

    useEffect(() => {
        if (token) {
            fetchTaskDependencies();
        }
    }, [token, fetchTaskDependencies]);


    const fetchTaskDependencies = async () => {

        try {

            setLoading(true);
            setError("");

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
                "Failed to load task dependencies:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to load employees and projects."
            );

        } finally {

            setLoading(false);

        }
    };


    const selectedProject = projects.find(
        (project) => project._id === formData.project
    );

    const projectEmployees = selectedProject
        ? employees.filter((employee) =>
            selectedProject.members?.some(
                (member) =>
                    (member?._id || member)?.toString() ===
                    employee._id.toString()
            )
        )
        : [];


    /* =====================================================
       HANDLE FORM CHANGE
    ===================================================== */

    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));

    };


    /* =====================================================
       CREATE TASK
    ===================================================== */

    const handleSubmit = async (e) => {

        e.preventDefault();

        setMessage("");
        setError("");


        /* =========================
           VALIDATION
        ========================= */

        if (!formData.title.trim()) {

            setError(
                "Task title is required."
            );

            return;
        }


        if (!formData.description.trim()) {

            setError(
                "Task description is required."
            );

            return;
        }


        if (!formData.project) {

            setError(
                "Please select a project."
            );

            return;
        }


        if (!formData.assignedTo) {

            setError(
                "Please select an employee."
            );

            return;
        }


        if (!formData.dueDate) {

            setError(
                "Due date is required."
            );

            return;
        }


        /* =========================
           API
        ========================= */

        try {

            setSaving(true);

            const response = await createTask(
                {
                    title:
                        formData.title.trim(),

                    description:
                        formData.description.trim(),

                    priority:
                        formData.priority,

                    assignedTo:
                        formData.assignedTo,

                    project:
                        formData.project,

                    dueDate:
                        formData.dueDate
                },
                token
            );


            setMessage(
                response.message ||
                "Task created successfully."
            );


            /* =========================
               RESET FORM
            ========================= */

            setFormData({
                title: "",
                description: "",
                priority: "medium",
                assignedTo: "",
                project: "",
                dueDate: ""
            });


            /* =========================
               REDIRECT
            ========================= */

            setTimeout(() => {

                navigate(
                    "/admin/tasks"
                );

            }, 1000);


        } catch (error) {

            console.error(
                "Failed to create task:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to create task."
            );

        } finally {

            setSaving(false);

        }
    };


    /* =====================================================
       LOADING
    ===================================================== */

    if (loading) {
        return <Loading />;
    }


    return (

        <div className="create-task-page">

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="create-task-header">

                <div>

                    <h2>
                        Create Task
                    </h2>

                    <p>
                        Assign a new task to an active employee.
                    </p>

                </div>

            </div>


            {/* =================================================
                SUCCESS MESSAGE
            ================================================= */}

            {message && (

                <div className="create-task-alert success">

                    <i className="bi bi-check-circle-fill"></i>

                    <span>
                        {message}
                    </span>

                </div>

            )}


            {/* =================================================
                ERROR MESSAGE
            ================================================= */}

            {error && (

                <div className="create-task-alert error">

                    <i className="bi bi-exclamation-circle-fill"></i>

                    <span>
                        {error}
                    </span>

                </div>

            )}


            {/* =================================================
                FORM CARD
            ================================================= */}

            <div className="create-task-card">

                {/* =========================
                    CARD HEADER
                ========================= */}

                <div className="create-task-card-header">

                    <div className="task-header-icon">

                        <i className="bi bi-clipboard-plus"></i>

                    </div>


                    <div>

                        <h4>
                            Create New Task
                        </h4>

                        <p>
                            Fill in the details below to assign a task.
                        </p>

                    </div>

                </div>


                {/* =========================
                    FORM
                ========================= */}

                <form
                    className="create-task-form"
                    onSubmit={handleSubmit}
                >

                    {/* =================================================
                        TITLE + ASSIGN TO
                    ================================================= */}

                    <div className="form-row">

                        {/* Task Title */}

                        <div className="form-group">

                            <label>

                                Task Title

                                <span>
                                    *
                                </span>

                            </label>


                            <div className="input-wrapper">

                                <i className="bi bi-card-heading"></i>

                                <input
                                    type="text"
                                    name="title"
                                    placeholder="Enter task title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    disabled={saving}
                                />

                            </div>

                        </div>


                        {/* Project */}

                        <div className="form-group">

                            <label>
                                Project
                                <span>*</span>
                            </label>

                            <div className="input-wrapper">

                                <i className="bi bi-kanban"></i>

                                <select
                                    name="project"
                                    value={formData.project}
                                    onChange={(event) => {
                                        const { value } = event.target;
                                        setFormData((previous) => ({
                                            ...previous,
                                            project: value,
                                            assignedTo: ""
                                        }));
                                    }}
                                    disabled={saving}
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


                        {/* Assign Employee */}

                        <div className="form-group">

                            <label>

                                Assign To

                                <span>
                                    *
                                </span>

                            </label>


                            <div className="input-wrapper">

                                <i className="bi bi-person"></i>

                                <select
                                    name="assignedTo"
                                    value={formData.assignedTo}
                                    onChange={handleChange}
                                    disabled={saving || !formData.project}
                                >

                                    <option value="">
                                        {formData.project
                                            ? "Select employee"
                                            : "Select project first"}
                                    </option>


                                    {projectEmployees.map(
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
                                                {" — "}
                                                {
                                                    employee.email
                                                }
                                            </option>

                                        )
                                    )}

                                </select>

                            </div>

                        </div>

                    </div>


                    {/* =================================================
                        DESCRIPTION
                    ================================================= */}

                    <div className="form-group">

                        <label>

                            Description

                            <span>
                                *
                            </span>

                        </label>


                        <div className="textarea-wrapper">

                            <i className="bi bi-text-paragraph"></i>

                            <textarea
                                name="description"
                                rows="5"
                                placeholder="Describe what needs to be completed..."
                                value={
                                    formData.description
                                }
                                onChange={handleChange}
                                disabled={saving}
                            ></textarea>

                        </div>

                    </div>


                    {/* =================================================
                        PRIORITY + DUE DATE
                    ================================================= */}

                    <div className="form-row">

                        {/* Priority */}

                        <div className="form-group">

                            <label>
                                Priority
                            </label>


                            <div className="input-wrapper">

                                <i className="bi bi-flag"></i>

                                <select
                                    name="priority"
                                    value={
                                        formData.priority
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    disabled={saving}
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


                        {/* Due Date */}

                        <div className="form-group">

                            <label>

                                Due Date

                                <span>
                                    *
                                </span>

                            </label>


                            <div className="input-wrapper">

                                <i className="bi bi-calendar3"></i>

                                <input
                                    type="date"
                                    name="dueDate"
                                    value={
                                        formData.dueDate
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    disabled={saving}
                                />

                            </div>

                        </div>

                    </div>


                    {/* =================================================
                        ACTIONS
                    ================================================= */}

                    <div className="form-actions">

                        <button
                            type="button"
                            className="cancel-task-btn"
                            onClick={() =>
                                navigate(
                                    "/admin/tasks"
                                )
                            }
                            disabled={saving}
                        >
                            Cancel
                        </button>


                        <button
                            type="submit"
                            className="create-task-btn"
                            disabled={saving}
                        >

                            {saving ? (

                                <>
                                    <span
                                        className="spinner-border spinner-border-sm"
                                        role="status"
                                        aria-hidden="true"
                                    ></span>

                                    Creating...
                                </>

                            ) : (

                                <>
                                    <i className="bi bi-plus-lg"></i>

                                    Create Task
                                </>

                            )}

                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
};

export default CreateTask;