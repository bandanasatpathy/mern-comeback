import React, {
    useEffect,
    useState,
    useCallback
} from "react";

import {
    useNavigate
} from "react-router-dom";

import {
    useAuth
} from "../../context/AuthContext";

import Loading from "../../components/Loading";

import {
    createProject
} from "../../services/projectService";

import {
    getAllEmployees
} from "../../services/userService";

import "./CreateProject.css";


const CreateProject = () => {

    const {
        token
    } = useAuth();

    const navigate =
        useNavigate();


    // ==================================================
    // STATE
    // ==================================================

    const [
        formData,
        setFormData
    ] = useState({
        name: "",
        description: ""
    });


    const [
        employees,
        setEmployees
    ] = useState([]);


    const [
        selectedMembers,
        setSelectedMembers
    ] = useState([]);


    const [
        memberSearch,
        setMemberSearch
    ] = useState("");


    const [
        membersDropdownOpen,
        setMembersDropdownOpen
    ] = useState(false);


    const [
        loadingEmployees,
        setLoadingEmployees
    ] = useState(true);


    const [
        submitting,
        setSubmitting
    ] = useState(false);


    const [
        error,
        setError
    ] = useState("");


    const [
        success,
        setSuccess
    ] = useState("");


    // ==================================================
    // FETCH EMPLOYEES
    // ==================================================

    const fetchEmployees = useCallback(async () => {
        try {
            setLoadingEmployees(true);
            setError("");

            const response = await getAllEmployees(
                1,
                100,
                token,
                true
            );

            setEmployees(response.data || []);

        } catch (error) {
            console.error("Failed to fetch employees:", error);

            setError(
                error.response?.data?.message ||
                "Failed to load employees."
            );

        } finally {
            setLoadingEmployees(false);
        }
    }, [token]);


    // ==================================================
    // INITIAL LOAD
    // ==================================================

    useEffect(() => {
        if (token) {
            fetchEmployees();
        }
    }, [token, fetchEmployees]);


    // ==================================================
    // INPUT CHANGE
    // ==================================================

    const handleChange = (event) => {

        const {
            name,
            value
        } = event.target;

        setFormData(
            previous => ({
                ...previous,
                [name]: value
            })
        );

        setError("");
        setSuccess("");
    };


    // ==================================================
    // MEMBER SELECTION
    // ==================================================

    const handleMemberToggle = (
        employeeId
    ) => {

        setSelectedMembers(
            previous => {

                if (
                    previous.includes(employeeId)
                ) {

                    return previous.filter(
                        id => id !== employeeId
                    );

                }

                return [
                    ...previous,
                    employeeId
                ];

            }
        );

        setError("");
    };


    // ==================================================
    // CREATE PROJECT
    // ==================================================

    const handleSubmit = async (
        event
    ) => {

        event.preventDefault();

        setError("");
        setSuccess("");


        // ------------------------------
        // VALIDATION
        // ------------------------------

        if (!formData.name.trim()) {

            setError(
                "Project name is required."
            );

            return;
        }


        if (!formData.description.trim()) {

            setError(
                "Project description is required."
            );

            return;
        }


        try {

            setSubmitting(true);


            const projectData = {
                name:
                    formData.name.trim(),

                description:
                    formData.description.trim(),

                members:
                    selectedMembers
            };


            const response =
                await createProject(
                    projectData,
                    token
                );


            setSuccess(
                response.message ||
                "Project created successfully."
            );


            setTimeout(() => {

                navigate(
                    "/admin/projects"
                );

            }, 800);


        } catch (error) {

            console.error(
                "Failed to create project:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to create project."
            );

        } finally {

            setSubmitting(false);

        }
    };


    // ==================================================
    // LOADING EMPLOYEES
    // ==================================================

    if (loadingEmployees) {

        return (
            <Loading
                message="Loading employees..."
            />
        );

    }


    // ==================================================
    // PAGE
    // ==================================================

    return (

        <div className="create-project-page">


            {/* ==========================================
                HEADER
            ========================================== */}

            <div className="create-project-header">

                <div>

                    <button
                        type="button"
                        className="create-project-back"
                        onClick={() =>
                            navigate(
                                "/admin/projects"
                            )
                        }
                    >

                        <i className="bi bi-arrow-left"></i>

                        Back to Projects

                    </button>


                    <h2>
                        Create Project
                    </h2>

                    <p>
                        Create a new project and assign
                        employees to it.
                    </p>

                </div>

            </div>


            {/* ==========================================
                ALERTS
            ========================================== */}

            {error && (

                <div className="create-project-alert error">

                    <i className="bi bi-exclamation-circle-fill"></i>

                    <span>
                        {error}
                    </span>

                </div>

            )}


            {success && (

                <div className="create-project-alert success">

                    <i className="bi bi-check-circle-fill"></i>

                    <span>
                        {success}
                    </span>

                </div>

            )}


            {/* ==========================================
                FORM CARD
            ========================================== */}

            <form
                className="create-project-card"
                onSubmit={handleSubmit}
            >


                {/* ======================================
                    PROJECT INFORMATION
                ====================================== */}

                <div className="create-project-section">

                    <div className="create-project-section-header">

                        <div className="create-project-section-icon">

                            <i className="bi bi-kanban"></i>

                        </div>

                        <div>

                            <h3>
                                Project Information
                            </h3>

                            <p>
                                Add the basic details of your project.
                            </p>

                        </div>

                    </div>


                    <div className="create-project-fields">


                        {/* Project Name */}

                        <div className="create-project-field">

                            <label htmlFor="project-name">
                                Project Name
                                <span>*</span>
                            </label>

                            <div className="create-project-input-wrapper">

                                <i className="bi bi-folder2-open"></i>

                                <input
                                    id="project-name"
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter project name"
                                    maxLength={100}
                                />

                            </div>

                            <small>
                                Give your project a clear and recognizable name.
                            </small>

                        </div>


                        {/* Description */}

                        <div className="create-project-field">

                            <label htmlFor="project-description">
                                Description
                                <span>*</span>
                            </label>

                            <div className="create-project-textarea-wrapper">

                                <i className="bi bi-card-text"></i>

                                <textarea
                                    id="project-description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Describe what this project is about..."
                                    rows="5"
                                    maxLength={500}
                                />

                            </div>

                            <small>
                                Add a short description so employees understand the project.
                            </small>

                        </div>

                    </div>

                </div>


                {/* ======================================
                    PROJECT MEMBERS
                ====================================== */}

                <div className="create-project-section">

                    <div className="create-project-section-header">

                        <div className="create-project-section-icon members">

                            <i className="bi bi-people"></i>

                        </div>

                        <div>

                            <h3>
                                Project Members
                            </h3>

                            <p>
                                Select the employees who will work on this project.
                            </p>

                        </div>

                    </div>


                    <div className="create-project-members-container">

                        <button
                            type="button"
                            className={`create-project-members-select ${membersDropdownOpen ? "open" : ""
                                }`}
                            onClick={() =>
                                setMembersDropdownOpen(
                                    previous => !previous
                                )
                            }
                        >
                            <span className="members-select-left">
                                <i className="bi bi-people"></i>

                                <span>
                                    {selectedMembers.length === 0
                                        ? "Select project members"
                                        : `${selectedMembers.length} employee${selectedMembers.length > 1 ? "s" : ""
                                        } selected`}
                                </span>
                            </span>

                            <i
                                className={`bi ${membersDropdownOpen
                                    ? "bi-chevron-up"
                                    : "bi-chevron-down"
                                    }`}
                            ></i>
                        </button>


                        {selectedMembers.length > 0 && (
                            <div className="create-project-selected-members">
                                {employees
                                    .filter(employee =>
                                        selectedMembers.includes(employee._id)
                                    )
                                    .map(employee => (
                                        <span
                                            className="selected-member-chip"
                                            key={employee._id}
                                        >
                                            <span className="selected-member-avatar">
                                                {employee.name
                                                    ?.charAt(0)
                                                    ?.toUpperCase() || "E"}
                                            </span>

                                            <span>{employee.name}</span>

                                            <button
                                                type="button"
                                                aria-label={`Remove ${employee.name}`}
                                                onClick={() =>
                                                    handleMemberToggle(
                                                        employee._id
                                                    )
                                                }
                                            >
                                                <i className="bi bi-x"></i>
                                            </button>
                                        </span>
                                    ))}
                            </div>
                        )}


                        {membersDropdownOpen && (
                            <div className="create-project-members-dropdown">

                                <div className="create-project-members-dropdown-search">
                                    <i className="bi bi-search"></i>

                                    <input
                                        type="text"
                                        value={memberSearch}
                                        onChange={event =>
                                            setMemberSearch(event.target.value)
                                        }
                                        placeholder="Search employees by name or email..."
                                        autoFocus
                                    />

                                    {memberSearch && (
                                        <button
                                            type="button"
                                            onClick={() => setMemberSearch("")}
                                            aria-label="Clear employee search"
                                        >
                                            <i className="bi bi-x-circle-fill"></i>
                                        </button>
                                    )}
                                </div>


                                <div className="create-project-members-dropdown-header">
                                    <span>Available Employees</span>

                                    <span className="selected-count">
                                        {selectedMembers.length} selected
                                    </span>
                                </div>


                                {employees.length === 0 ? (

                                    <div className="create-project-no-employees">
                                        <i className="bi bi-person-x"></i>
                                        <p>No active employees available.</p>
                                    </div>

                                ) : (

                                    <div className="create-project-members-list">

                                        {employees
                                            .filter(employee => {
                                                const query =
                                                    memberSearch.trim().toLowerCase();

                                                if (!query) {
                                                    return true;
                                                }

                                                return (
                                                    employee.name
                                                        ?.toLowerCase()
                                                        .includes(query) ||
                                                    employee.email
                                                        ?.toLowerCase()
                                                        .includes(query)
                                                );
                                            })
                                            .map(employee => {

                                                const isSelected =
                                                    selectedMembers.includes(
                                                        employee._id
                                                    );

                                                return (
                                                    <label
                                                        key={employee._id}
                                                        className={`create-project-member ${isSelected
                                                            ? "selected"
                                                            : ""
                                                            }`}
                                                    >

                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() =>
                                                                handleMemberToggle(
                                                                    employee._id
                                                                )
                                                            }
                                                        />

                                                        <span className="member-checkbox">
                                                            {isSelected && (
                                                                <i className="bi bi-check"></i>
                                                            )}
                                                        </span>

                                                        <span className="member-avatar">
                                                            {employee.name
                                                                ?.charAt(0)
                                                                ?.toUpperCase() || "E"}
                                                        </span>

                                                        <span className="member-information">
                                                            <strong>
                                                                {employee.name}
                                                            </strong>

                                                            <small>
                                                                {employee.email}
                                                            </small>
                                                        </span>

                                                        <span className="member-role">
                                                            Employee
                                                        </span>

                                                    </label>
                                                );
                                            })}

                                        {employees.filter(employee => {
                                            const query =
                                                memberSearch.trim().toLowerCase();

                                            if (!query) {
                                                return true;
                                            }

                                            return (
                                                employee.name
                                                    ?.toLowerCase()
                                                    .includes(query) ||
                                                employee.email
                                                    ?.toLowerCase()
                                                    .includes(query)
                                            );
                                        }).length === 0 && (
                                                <div className="create-project-no-search-results">
                                                    <i className="bi bi-search"></i>
                                                    <p>No employees found.</p>
                                                </div>
                                            )}

                                    </div>
                                )}

                            </div>
                        )}

                    </div>


                </div>


                {/* ======================================
                    FORM ACTIONS
                ====================================== */}

                <div className="create-project-actions">

                    <button
                        type="button"
                        className="create-project-cancel"
                        onClick={() =>
                            navigate(
                                "/admin/projects"
                            )
                        }
                        disabled={submitting}
                    >
                        Cancel
                    </button>


                    <button
                        type="submit"
                        className="create-project-submit"
                        disabled={submitting}
                    >

                        {submitting ? (

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

                                Create Project
                            </>

                        )}

                    </button>

                </div>

            </form>

        </div>

    );

};


export default CreateProject;