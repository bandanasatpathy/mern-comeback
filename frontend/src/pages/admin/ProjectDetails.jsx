import { useState, useEffect, useCallback } from "react";

import {
    useNavigate,
    useParams
} from "react-router-dom";

import {
    useAuth
} from "../../context/AuthContext";

import Loading from "../../components/Loading";

import {
    getProjectById,
    updateProject,
    archiveProject
} from "../../services/projectService";

import "./ProjectDetails.css";


const ProjectDetails = () => {

    const {
        token
    } = useAuth();

    const {
        id
    } = useParams();

    const navigate =
        useNavigate();


    // ==================================================
    // STATE
    // ==================================================

    const [
        project,
        setProject
    ] = useState(null);


    const [
        loading,
        setLoading
    ] = useState(true);


    const [
        error,
        setError
    ] = useState("");

    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [archiving, setArchiving] = useState(false);
    const [actionMessage, setActionMessage] = useState("");
    const [actionError, setActionError] = useState("");
    const [editForm, setEditForm] = useState({
        name: "",
        description: "",
        status: "active"
    });


    // ==================================================
    // FETCH PROJECT
    // ==================================================

    const fetchProject = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getProjectById(id, token);

            setProject(response.data);

        } catch (error) {
            console.error("Failed to fetch project:", error);

            setError(
                error.response?.data?.message ||
                "Failed to load project."
            );

        } finally {
            setLoading(false);
        }
    }, [id, token]);


    // ==================================================
    // INITIAL LOAD
    // ==================================================

    useEffect(() => {
        if (id && token) {
            fetchProject();
        }
    }, [id, token, fetchProject]);


    // ==================================================
    // FORMAT DATE
    // ==================================================

    const formatDate = (
        date
    ) => {

        if (!date) {
            return "-";
        }


        return new Date(
            date
        ).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    };


    // ==================================================
    // FORMAT DATE + TIME
    // ==================================================

    const formatDateTime = (
        date
    ) => {

        if (!date) {
            return "-";
        }


        return new Date(
            date
        ).toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    };


    // ==================================================
    // STATUS
    // ==================================================

    const getStatusLabel = (
        status
    ) => {

        switch (status) {

            case "active":
                return "Active";

            case "completed":
                return "Completed";

            case "archived":
                return "Archived";

            default:
                return status || "-";

        }

    };


    const getStatusClass = (
        status
    ) => {

        switch (status) {

            case "active":
                return "project-details-status active";

            case "completed":
                return "project-details-status completed";

            case "archived":
                return "project-details-status archived";

            default:
                return "project-details-status";

        }

    };


    // ==================================================
    // MEMBER INITIAL
    // ==================================================

    const getInitial = (
        name
    ) => {

        return (
            name
                ?.charAt(0)
                ?.toUpperCase() ||
            "E"
        );

    };




    const handleOpenEdit = () => {
        setEditForm({
            name: project.name || "",
            description: project.description || "",
            status: project.status || "active"
        });
        setActionError("");
        setActionMessage("");
        setEditing(true);
    };

    const handleEditChange = (event) => {
        const { name, value } = event.target;
        setEditForm(previous => ({ ...previous, [name]: value }));
        setActionError("");
    };

    const handleUpdateProject = async (event) => {
        event.preventDefault();
        setActionError("");
        setActionMessage("");
        if (!editForm.name.trim()) return setActionError("Project name is required.");
        if (!editForm.description.trim()) return setActionError("Project description is required.");
        try {
            setSaving(true);
            const response = await updateProject(id, {
                name: editForm.name.trim(),
                description: editForm.description.trim(),
                status: editForm.status
            }, token);
            setProject(response.data);
            setEditing(false);
            setActionMessage(response.message || "Project updated successfully.");
        } catch (error) {
            console.error("Failed to update project:", error);
            setActionError(error.response?.data?.message || "Failed to update project.");
        } finally {
            setSaving(false);
        }
    };

    const handleArchiveProject = async () => {
        if (!window.confirm("Are you sure you want to archive this project? It will be removed from the Projects list.")) return;
        try {
            setArchiving(true);
            setActionError("");
            setActionMessage("");
            const response = await archiveProject(id, token);
            setActionMessage(response.message || "Project archived successfully.");
            setTimeout(() => navigate("/admin/projects"), 800);
        } catch (error) {
            console.error("Failed to archive project:", error);
            setActionError(error.response?.data?.message || "Failed to archive project.");
        } finally {
            setArchiving(false);
        }
    };


    // ==================================================
    // LOADING
    // ==================================================

    if (loading) {

        return (
            <Loading
                message="Loading project..."
            />
        );

    }


    // ==================================================
    // ERROR
    // ==================================================

    if (error) {

        return (

            <div className="project-details-page">

                <div className="project-details-error">

                    <div className="project-details-error-icon">

                        <i className="bi bi-exclamation-triangle"></i>

                    </div>

                    <h3>
                        Unable to load project
                    </h3>

                    <p>
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/admin/projects"
                            )
                        }
                    >

                        <i className="bi bi-arrow-left"></i>

                        Back to Projects

                    </button>

                </div>

            </div>

        );

    }


    // ==================================================
    // PROJECT NOT FOUND
    // ==================================================

    if (!project) {

        return (

            <div className="project-details-page">

                <div className="project-details-error">

                    <div className="project-details-error-icon">

                        <i className="bi bi-kanban"></i>

                    </div>

                    <h3>
                        Project not found
                    </h3>

                    <p>
                        The project you're looking for
                        could not be found.
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/admin/projects"
                            )
                        }
                    >

                        <i className="bi bi-arrow-left"></i>

                        Back to Projects

                    </button>

                </div>

            </div>

        );

    }


    // ==================================================
    // PAGE
    // ==================================================

    return (

        <div className="project-details-page">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="project-details-header">

                <div className="project-details-header-content">


                    <button
                        type="button"
                        className="project-details-back"
                        onClick={() =>
                            navigate(
                                "/admin/projects"
                            )
                        }
                    >

                        <i className="bi bi-arrow-left"></i>

                        Back to Projects

                    </button>


                    <div className="project-details-title-row">


                        <div className="project-details-main-icon">

                            <i className="bi bi-kanban"></i>

                        </div>


                        <div className="project-details-title">

                            <div className="project-details-title-top">

                                <h2>
                                    {project.name}
                                </h2>


                                <span
                                    className={
                                        getStatusClass(
                                            project.status
                                        )
                                    }
                                >

                                    <span className="project-details-status-dot"></span>

                                    {
                                        getStatusLabel(
                                            project.status
                                        )
                                    }

                                </span>

                            </div>


                            <p>
                                Project details and team members
                            </p>

                        </div>

                        <div className="project-details-actions">
                            <button type="button" className="project-details-edit-btn" onClick={handleOpenEdit}>
                                <i className="bi bi-pencil"></i>
                                Edit
                            </button>
                            <button type="button" className="project-details-archive-btn" onClick={handleArchiveProject} disabled={archiving}>
                                {archiving ? <><i className="bi bi-arrow-repeat spin"></i> Archiving...</> : <><i className="bi bi-trash3"></i> Archive</>}
                            </button>
                        </div>

                    </div>

                </div>

            </div>


            {actionMessage && (
                <div className="project-details-action-message success">
                    <i className="bi bi-check-circle-fill"></i>
                    <span>{actionMessage}</span>
                </div>
            )}

            {actionError && !editing && (
                <div className="project-details-action-message error">
                    <i className="bi bi-exclamation-circle-fill"></i>
                    <span>{actionError}</span>
                </div>
            )}

            {/* =================================================
                CONTENT
            ================================================= */}

            <div className="project-details-content">


                {/* =================================================
                    SUMMARY CARDS
                ================================================= */}

                <div className="project-details-summary">


                    {/* Members */}

                    <div className="project-details-summary-card">

                        <div className="project-details-summary-icon members">

                            <i className="bi bi-people"></i>

                        </div>

                        <div>

                            <span>
                                Team Members
                            </span>

                            <strong>
                                {
                                    project.members?.length ||
                                    0
                                }
                            </strong>

                        </div>

                    </div>


                    {/* Status */}

                    <div className="project-details-summary-card">

                        <div className="project-details-summary-icon status">

                            <i className="bi bi-activity"></i>

                        </div>

                        <div>

                            <span>
                                Current Status
                            </span>

                            <strong>
                                {
                                    getStatusLabel(
                                        project.status
                                    )
                                }
                            </strong>

                        </div>

                    </div>


                    {/* Created */}

                    <div className="project-details-summary-card">

                        <div className="project-details-summary-icon date">

                            <i className="bi bi-calendar3"></i>

                        </div>

                        <div>

                            <span>
                                Created
                            </span>

                            <strong>
                                {
                                    formatDate(
                                        project.createdAt
                                    )
                                }
                            </strong>

                        </div>

                    </div>


                </div>


                {/* =================================================
                    MAIN GRID
                ================================================= */}

                <div className="project-details-grid">


                    {/* =================================================
                        PROJECT INFORMATION
                    ================================================= */}

                    <div className="project-details-card project-information-card">


                        <div className="project-details-card-header">

                            <div className="project-details-card-icon">

                                <i className="bi bi-info-circle"></i>

                            </div>


                            <div>

                                <h3>
                                    Project Information
                                </h3>

                                <p>
                                    Basic information about this project.
                                </p>

                            </div>

                        </div>


                        <div className="project-information-body">


                            <div className="project-information-item">

                                <span className="project-information-label">
                                    Project Name
                                </span>

                                <strong>
                                    {project.name}
                                </strong>

                            </div>


                            <div className="project-information-item">

                                <span className="project-information-label">
                                    Description
                                </span>

                                <p className="project-description">

                                    {
                                        project.description ||
                                        "No description provided."
                                    }

                                </p>

                            </div>


                            <div className="project-information-divider"></div>


                            <div className="project-information-meta-grid">


                                <div className="project-information-meta">

                                    <span>
                                        <i className="bi bi-person"></i>
                                        Created By
                                    </span>

                                    <strong>
                                        {
                                            project.createdBy?.name ||
                                            "-"
                                        }
                                    </strong>

                                    {project.createdBy?.email && (

                                        <small>
                                            {
                                                project.createdBy.email
                                            }
                                        </small>

                                    )}

                                </div>


                                <div className="project-information-meta">

                                    <span>
                                        <i className="bi bi-calendar-event"></i>
                                        Created On
                                    </span>

                                    <strong>
                                        {
                                            formatDate(
                                                project.createdAt
                                            )
                                        }
                                    </strong>

                                    <small>
                                        {
                                            formatDateTime(
                                                project.createdAt
                                            )
                                        }
                                    </small>

                                </div>


                                <div className="project-information-meta">

                                    <span>
                                        <i className="bi bi-arrow-clockwise"></i>
                                        Last Updated
                                    </span>

                                    <strong>
                                        {
                                            formatDate(
                                                project.updatedAt
                                            )
                                        }
                                    </strong>

                                    <small>
                                        {
                                            formatDateTime(
                                                project.updatedAt
                                            )
                                        }
                                    </small>

                                </div>


                                <div className="project-information-meta">

                                    <span>
                                        <i className="bi bi-people"></i>
                                        Members
                                    </span>

                                    <strong>
                                        {
                                            project.members?.length ||
                                            0
                                        }
                                    </strong>

                                    <small>
                                        Assigned employees
                                    </small>

                                </div>


                            </div>

                        </div>

                    </div>


                    {/* =================================================
                        MEMBERS
                    ================================================= */}

                    <div className="project-details-card project-members-card">


                        <div className="project-details-card-header">

                            <div className="project-details-card-icon members">

                                <i className="bi bi-people"></i>

                            </div>


                            <div>

                                <h3>
                                    Project Members
                                </h3>

                                <p>
                                    Employees assigned to this project.
                                </p>

                            </div>


                            <span className="project-member-count">

                                {
                                    project.members?.length ||
                                    0
                                }

                            </span>

                        </div>


                        <div className="project-members-list">


                            {project.members?.length > 0 ? (

                                project.members.map(
                                    (member) => (

                                        <div
                                            className="project-member-row"
                                            key={member._id}
                                        >


                                            <div className="project-member-avatar">

                                                {
                                                    getInitial(
                                                        member.name
                                                    )
                                                }

                                            </div>


                                            <div className="project-member-information">

                                                <strong>
                                                    {
                                                        member.name
                                                    }
                                                </strong>

                                                <span>
                                                    {
                                                        member.email
                                                    }
                                                </span>

                                            </div>


                                            <span className="project-member-role">

                                                {
                                                    member.role ||
                                                    "Employee"
                                                }

                                            </span>

                                        </div>

                                    )
                                )

                            ) : (

                                <div className="project-no-members">

                                    <div>

                                        <i className="bi bi-person-plus"></i>

                                    </div>

                                    <h4>
                                        No members assigned
                                    </h4>

                                    <p>
                                        No employees have been added
                                        to this project yet.
                                    </p>

                                </div>

                            )}

                        </div>

                    </div>


                </div>


            </div>


            {editing && (
                <div className="project-edit-modal-overlay" onMouseDown={(event) => {
                    if (event.target === event.currentTarget) setEditing(false);
                }}>
                    <div className="project-edit-modal">
                        <div className="project-edit-modal-header">
                            <div className="project-edit-modal-icon"><i className="bi bi-pencil-square"></i></div>
                            <div>
                                <h3>Edit Project</h3>
                                <p>Update project information.</p>
                            </div>
                            <button type="button" className="project-edit-modal-close" onClick={() => setEditing(false)} disabled={saving}>
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>
                        <form className="project-edit-form" onSubmit={handleUpdateProject}>
                            {actionError && <div className="project-edit-error"><i className="bi bi-exclamation-circle-fill"></i><span>{actionError}</span></div>}
                            <div className="project-edit-field">
                                <label>Project Name <span>*</span></label>
                                <div className="project-edit-input"><i className="bi bi-folder2-open"></i><input type="text" name="name" value={editForm.name} onChange={handleEditChange} placeholder="Enter project name" maxLength={100} /></div>
                            </div>
                            <div className="project-edit-field">
                                <label>Description <span>*</span></label>
                                <div className="project-edit-textarea"><i className="bi bi-card-text"></i><textarea name="description" value={editForm.description} onChange={handleEditChange} placeholder="Enter project description" rows="5" maxLength={500} /></div>
                            </div>
                            <div className="project-edit-field">
                                <label>Status</label>
                                <div className="project-edit-select"><i className="bi bi-activity"></i><select name="status" value={editForm.status} onChange={handleEditChange}><option value="active">Active</option><option value="completed">Completed</option></select></div>
                            </div>
                            <div className="project-edit-actions">
                                <button type="button" className="project-edit-cancel" onClick={() => setEditing(false)} disabled={saving}>Cancel</button>
                                <button type="submit" className="project-edit-save" disabled={saving}>
                                    {saving ? <><i className="bi bi-arrow-repeat spin"></i> Saving...</> : <><i className="bi bi-check-lg"></i> Save Changes</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>

    );

};


export default ProjectDetails;