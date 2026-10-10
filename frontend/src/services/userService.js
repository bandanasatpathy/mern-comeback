import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;
// console.log("API_URL:", API_URL);

export const getAllEmployees = async (
    page = 1,
    limit = 10,
    token,
    isActive = true
) => {
    const response = await axios.get(
        `${API_URL}/auth/users/getAllEmployees`,
        {
            params: {
                page,
                limit,
                isActive,
            },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
};

export const createEmployee = async (employeeData, token) => {
    const response = await axios.post(
        `${API_URL}/auth/createUserByAdmin`,
        employeeData,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
};


export const getUserById = async (id, token) => {
    const response = await axios.get(
        `${API_URL}/auth/users/getUserById/${id}`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};


export const updateUserRole = async (id, userData, token) => {
    const response = await axios.put(
        `${API_URL}/auth/users/updateUser/${id}`,
        userData ,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
};

export const deactivateUser = async (id, token) => {
    const response = await axios.patch(
        `${API_URL}/auth/users/deactivateUser/${id}`,
        {},
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
};

export const activateUser = async (id, token) => {
    const response = await axios.patch(
        `${API_URL}/auth/users/activateUser/${id}`,
        {},
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
};

// ========================================
// REQUEST PROFILE UPDATE
// ========================================

export const requestProfileUpdate = async (
    data,
    token
) => {

    const response = await fetch(
        `${API_URL}/auth/users/requestProfileUpdate`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },

            body: JSON.stringify(data)
        }
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            result.message ||
            "Failed to submit profile update request."
        );
    }

    return result;
};

// ========================================
// GET PROFILE UPDATE REQUESTS
// ADMIN ONLY
// ========================================

export const getProfileUpdateRequests = async (token) => {

    const response = await fetch(
        `${process.env.REACT_APP_API_URL}/auth/users/profileUpdateRequests`,
        {
            method: "GET",

            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            result.message ||
            "Failed to fetch profile update requests."
        );
    }

    return result;
};


// ========================================
// UPDATE PROFILE REQUEST STATUS
// ADMIN ONLY
// ========================================

export const updateProfileUpdateRequestStatus = async (
    userId,
    status,
    token
) => {

    const response = await fetch(
        `${process.env.REACT_APP_API_URL}/auth/users/profileUpdateRequests/${userId}/status`,
        {
            method: "PATCH",

            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },

            body: JSON.stringify({
                status
            })
        }
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            result.message ||
            "Failed to update profile request."
        );
    }

    return result;
};

