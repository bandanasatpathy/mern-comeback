import { useState, useEffect, useCallback } from "react";

import {
    useNavigate
} from "react-router-dom";

import {
    useAuth
} from "../../context/AuthContext";

import Loading from "../../components/Loading";

import {
    getAllProjects
} from "../../services/projectService";

import "./Projects.css";


const Projects = () => {

    const {
        token
    } = useAuth();

    const navigate =
        useNavigate();


    // ==================================================
    // STATE
    // ==================================================

    const [
        projects,
        setProjects
    ] = useState([]);


    const [
        loading,
        setLoading
    ] = useState(true);


    const [
        error,
        setError
    ] = useState("");


    // ==================================================
    // FETCH PROJECTS
    // ==================================================

    const fetchProjects = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getAllProjects(token);

            setProjects(response.data || []);

        } catch (error) {
            console.error("Failed to fetch projects:", error);

            setError(
                error.response?.data?.message ||
                "Failed to load projects."
            );

        } finally {
            setLoading(false);
        }
    }, [token]);


    // ==================================================
    // INITIAL LOAD
    // ==================================================

    useEffect(() => {
        if (token) {
            fetchProjects();
        }
    }, [token, fetchProjects]);


    // ==================================================
    // FORMAT DATE
    // ==================================================

    const formatDate = (date) => {

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
    // STATUS LABEL
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


    // ==================================================
    // STATUS CLASS
    // ==================================================

    const getStatusClass = (
        status
    ) => {

        switch (status) {

            case "active":
                return "project-status active";

            case "completed":
                return "project-status completed";

            case "archived":
                return "project-status archived";

            default:
                return "project-status";

        }

    };


    // ==================================================
    // VIEW PROJECT
    // ==================================================

    const handleViewProject = (
        projectId
    ) => {

        navigate(
            `/admin/projects/${projectId}`
        );

    };


    // ==================================================
    // LOADING
    // ==================================================

    if (loading) {

        return (
            <Loading
                message="Loading projects..."
            />
        );

    }


    // ==================================================
    // PAGE
    // ==================================================

    return (

        <div className="projects-page">


            {/* ==========================================
                PAGE HEADER
            ========================================== */}

            <div className="projects-header">

                <div>

                    <h2>
                        Projects
                    </h2>

                    <p>
                        Manage and organize your projects.
                    </p>

                </div>


                <button
                    type="button"
                    className="projects-create-btn"
                    onClick={() =>
                        navigate(
                            "/admin/projects/create"
                        )
                    }
                >

                    <i className="bi bi-plus-lg"></i>

                    Create Project

                </button>

            </div>


            {/* ==========================================
                ERROR
            ========================================== */}

            {error && (

                <div className="projects-alert error">

                    <i className="bi bi-exclamation-circle-fill"></i>

                    <span>
                        {error}
                    </span>

                </div>

            )}


            {/* ==========================================
                PROJECT SUMMARY
            ========================================== */}

            <div className="projects-summary">

                <div className="projects-summary-card">

                    <div className="projects-summary-icon">

                        <i className="bi bi-kanban"></i>

                    </div>

                    <div>

                        <span>
                            Total Projects
                        </span>

                        <strong>
                            {projects.length}
                        </strong>

                    </div>

                </div>


                <div className="projects-summary-card">

                    <div className="projects-summary-icon active">

                        <i className="bi bi-play-circle"></i>

                    </div>

                    <div>

                        <span>
                            Active
                        </span>

                        <strong>
                            {
                                projects.filter(
                                    project =>
                                        project.status ===
                                        "active"
                                ).length
                            }
                        </strong>

                    </div>

                </div>


                <div className="projects-summary-card">

                    <div className="projects-summary-icon completed">

                        <i className="bi bi-check-circle"></i>

                    </div>

                    <div>

                        <span>
                            Completed
                        </span>

                        <strong>
                            {
                                projects.filter(
                                    project =>
                                        project.status ===
                                        "completed"
                                ).length
                            }
                        </strong>

                    </div>

                </div>

            </div>


            {/* ==========================================
                PROJECT LIST
            ========================================== */}

            <div className="projects-card">


                <div className="projects-card-header">

                    <div>

                        <h4>
                            All Projects
                        </h4>

                        <p>
                            View and manage your projects.
                        </p>

                    </div>

                </div>


                {projects.length === 0 ? (

                    <div className="projects-empty">

                        <div className="projects-empty-icon">

                            <i className="bi bi-kanban"></i>

                        </div>

                        <h4>
                            No projects found
                        </h4>

                        <p>
                            Create your first project
                            to get started.
                        </p>

                    </div>

                ) : (

                    <div className="projects-table-wrapper">

                        <table className="projects-table">

                            <thead>

                                <tr>

                                    <th>
                                        Project
                                    </th>

                                    <th>
                                        Members
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                        Created
                                    </th>

                                    <th>
                                        Action
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {projects.map(
                                    (project) => (

                                        <tr
                                            key={
                                                project._id
                                            }
                                        >

                                            <td>

                                                <div className="project-name-cell">

                                                    <div className="project-icon">

                                                        <i className="bi bi-kanban"></i>

                                                    </div>


                                                    <div>

                                                        <strong>
                                                            {
                                                                project.name
                                                            }
                                                        </strong>

                                                        <span>
                                                            {
                                                                project.description
                                                            }
                                                        </span>

                                                    </div>

                                                </div>

                                            </td>


                                            <td>

                                                <div className="project-members">

                                                    <i className="bi bi-people"></i>

                                                    <span>
                                                        {
                                                            project.members?.length ||
                                                            0
                                                        }
                                                    </span>

                                                </div>

                                            </td>


                                            <td>

                                                <span
                                                    className={
                                                        getStatusClass(
                                                            project.status
                                                        )
                                                    }
                                                >

                                                    <span className="project-status-dot"></span>

                                                    {
                                                        getStatusLabel(
                                                            project.status
                                                        )
                                                    }

                                                </span>

                                            </td>


                                            <td>

                                                <span className="project-date">

                                                    {
                                                        formatDate(
                                                            project.createdAt
                                                        )
                                                    }

                                                </span>

                                            </td>


                                            <td>

                                                <button
                                                    type="button"
                                                    className="project-view-btn"
                                                    onClick={() =>
                                                        handleViewProject(
                                                            project._id
                                                        )
                                                    }
                                                >

                                                    <i className="bi bi-eye"></i>

                                                    View

                                                </button>

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

        </div>

    );

};


export default Projects;