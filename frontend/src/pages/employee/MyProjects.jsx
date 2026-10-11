import React, {
    useEffect,
    useState
} from "react";

import "bootstrap-icons/font/bootstrap-icons.css";

import {
    useAuth
} from "../../context/AuthContext";

import {
    getAllProjects
} from "../../services/projectService";

import Loading from "../../components/Loading";

import "./MyProjects.css";


const MyProjects = () => {

    const {
        token
    } = useAuth();


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


    /* ==================================================
       FETCH MY PROJECTS
    ================================================== */

    const fetchProjects = async () => {

        try {

            setLoading(true);
            setError("");

            const response =
                await getAllProjects(token);


            /*
             * IMPORTANT:
             *
             * Backend already filters employee projects
             * using Project.members.
             *
             * Therefore we DO NOT filter based on tasks.
             */

            setProjects(
                (response.data || []).filter(
                    project =>
                        project.status !== "archived"
                )
            );


        } catch (error) {

            console.error(
                "Failed to fetch projects:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to load your projects."
            );


        } finally {

            setLoading(false);

        }
    };


    /* ==================================================
       INITIAL LOAD
    ================================================== */

    useEffect(() => {

        if (token) {
            fetchProjects();
        }

    }, [token,fetchProjects]);


    /* ==================================================
       FORMAT DATE
    ================================================== */

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


    /* ==================================================
       STATUS LABEL
    ================================================== */

    const getStatusLabel = (status) => {

        switch (status) {

            case "active":
                return "Active";

            case "completed":
                return "Completed";

            default:
                return status || "-";
        }
    };


    /* ==================================================
       STATUS CLASS
    ================================================== */

    const getStatusClass = (status) => {

        switch (status) {

            case "active":
                return "my-project-status active";

            case "completed":
                return "my-project-status completed";

            default:
                return "my-project-status";
        }
    };


    /* ==================================================
       LOADING
    ================================================== */

    if (loading) {

        return (
            <Loading />
        );
    }


    /* ==================================================
       PAGE
    ================================================== */

    return (

        <div className="my-projects-page">

            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="my-projects-header">

                <div className="my-projects-header-content">

                    <div className="my-projects-title-icon">
                        <i className="bi bi-kanban"></i>
                    </div>

                    <div>

                        <h2>
                            My Projects
                        </h2>

                        <p>
                            Projects you are currently assigned to
                        </p>

                    </div>

                </div>


                <div className="my-projects-count">

                    <span>
                        {projects.length}
                    </span>

                    <small>
                        {projects.length === 1
                            ? "Project"
                            : "Projects"}
                    </small>

                </div>

            </div>


            {/* ==================================================
                ERROR
            ================================================== */}

            {error && (

                <div className="my-projects-alert">

                    <i className="bi bi-exclamation-circle"></i>

                    <span>
                        {error}
                    </span>

                </div>

            )}


            {/* ==================================================
                EMPTY STATE
            ================================================== */}

            {!error && projects.length === 0 && (

                <div className="my-projects-empty">

                    <div className="my-projects-empty-icon">

                        <i className="bi bi-kanban"></i>

                    </div>

                    <h3>
                        No projects assigned
                    </h3>

                    <p>
                        You have not been assigned to any project yet.
                    </p>

                </div>

            )}


            {/* ==================================================
                PROJECT LIST
            ================================================== */}

            {!error && projects.length > 0 && (

                <div className="my-projects-card">

                    <div className="my-projects-card-header">

                        <div>
                            <h3>
                                Assigned Projects
                            </h3>

                            <p>
                                All projects where you are a member
                            </p>
                        </div>

                    </div>


                    <div className="my-projects-table-wrapper">

                        <table className="my-projects-table">

                            <thead>

                                <tr>

                                    <th>
                                        Project
                                    </th>

                                    <th>
                                        Description
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

                                </tr>

                            </thead>


                            <tbody>

                                {projects.map(
                                    project => (

                                        <tr
                                            key={project._id}
                                        >

                                            {/* PROJECT */}

                                            <td>

                                                <div className="my-project-name">

                                                    <div className="my-project-icon">

                                                        <i className="bi bi-folder2-open"></i>

                                                    </div>

                                                    <div>

                                                        <strong>
                                                            {project.name}
                                                        </strong>

                                                    </div>

                                                </div>

                                            </td>


                                            {/* DESCRIPTION */}

                                            <td>

                                                <div className="my-project-description">

                                                    {project.description || "-"}

                                                </div>

                                            </td>


                                            {/* MEMBERS */}

                                            <td>

                                                <div className="my-project-members">

                                                    <i className="bi bi-people"></i>

                                                    <span>
                                                        {project.members?.length || 0}
                                                    </span>

                                                </div>

                                            </td>


                                            {/* STATUS */}

                                            <td>

                                                <span
                                                    className={getStatusClass(
                                                        project.status
                                                    )}
                                                >

                                                    <span className="my-project-status-dot"></span>

                                                    {getStatusLabel(
                                                        project.status
                                                    )}

                                                </span>

                                            </td>


                                            {/* CREATED */}

                                            <td>

                                                <span className="my-project-date">

                                                    <i className="bi bi-calendar3"></i>

                                                    {formatDate(
                                                        project.createdAt
                                                    )}

                                                </span>

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                </div>

            )}

        </div>
    );
};


export default MyProjects;