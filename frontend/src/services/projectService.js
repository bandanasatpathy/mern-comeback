import axios from "axios";


const API_URL = process.env.REACT_APP_API_URL;


// ======================================================
// GET ALL PROJECTS
// ADMIN + EMPLOYEE
// ======================================================

export const getAllProjects = async (token) => {

    const response = await axios.get(
        `${API_URL}/auth/projects/getAllProjects`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};


// ======================================================
// GET PROJECT BY ID
// ADMIN + PROJECT MEMBER
// ======================================================

export const getProjectById = async (
    id,
    token
) => {

    const response = await axios.get(
        `${API_URL}/auth/projects/${id}`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};


// ======================================================
// CREATE PROJECT
// ADMIN ONLY
// ======================================================

export const createProject = async (
    projectData,
    token
) => {

    const response = await axios.post(
        `${API_URL}/auth/projects/createProject`,
        projectData,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};


// ======================================================
// UPDATE PROJECT
// ADMIN ONLY
// ======================================================

export const updateProject = async (
    id,
    projectData,
    token
) => {

    const response = await axios.put(
        `${API_URL}/auth/projects/updateProject/${id}`,
        projectData,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};


// ======================================================
// ADD PROJECT MEMBER
// ADMIN ONLY
// ======================================================

export const addProjectMember = async (
    id,
    employeeId,
    token
) => {

    const response = await axios.post(
        `${API_URL}/auth/projects/addProjectMember/${id}`,
        {
            employeeId
        },
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};


// ======================================================
// REMOVE PROJECT MEMBER
// ADMIN ONLY
// ======================================================

export const removeProjectMember = async (
    id,
    employeeId,
    token
) => {

    const response = await axios.delete(
        `${API_URL}/auth/projects/removeProjectMember/${id}`,
        {
            data: {
                employeeId
            },
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};


// ======================================================
// ARCHIVE PROJECT
// ADMIN ONLY
// ======================================================

export const archiveProject = async (
    id,
    token
) => {

    const response = await axios.patch(
        `${API_URL}/auth/projects/archiveProject/${id}/archive`,
        {},
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};