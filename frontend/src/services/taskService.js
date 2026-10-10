import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

const createTask = async (taskData, token) => {
    const response = await axios.post(
        `${API_URL}/auth/tasks/createTaskByAdmin`,
        taskData,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};

const getAllTasks = async (page = 1, limit = 10, token) => {
    const response = await axios.get(
        `${API_URL}/auth/tasks/getAllTasksByAdmin`,
        {
            params: {
                page,
                limit
            },
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};

const getTasksByStatus = async (
    status,
    page = 1,
    limit = 10,
    token
) => {
    const response = await axios.get(
        `${API_URL}/auth/tasks/getAllTasksByStatus/${status}`,
        {
            params: {
                page,
                limit
            },
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};

const getTaskById = async (id, token) => {
    const response = await axios.get(
        `${API_URL}/auth/tasks/getTaskById/${id}`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};

const updateTask = async (id, taskData, token) => {
    const response = await axios.put(
        `${API_URL}/auth/tasks/updateTask/${id}`,
        taskData,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};

const deleteTask = async (id, token) => {
  const response = await axios.delete(
    `${API_URL}/auth/tasks/deleteTask/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  return response.data;
};

const getMyTasks = async (
    token,
    page = 1,
    limit = 10
) => {

    try {

        if (!token) {
            throw new Error(
                "Authentication token is missing."
            );
        }

        const response = await axios.get(
            `${API_URL}/auth/tasks/myTasks`,
            {
                params: {
                    page,
                    limit
                },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        return response.data;

    } catch (error) {

        console.error(
            "getMyTasks API error:",
            error.response?.data || error.message
        );

        throw error;
    }
};

const completeTask = async (taskId, token) => {
    const response = await axios.patch(
        `${API_URL}/auth/tasks/completeTask/${taskId}`,
        {},
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};


/* =========================================================
   GET TASK COMMENTS
========================================================= */

export const getTaskComments = async (
    taskId,
    token
) => {

    if (!token) {

        throw new Error(
            "Authentication token is missing."
        );
    }


    const response = await fetch(

        `${API_URL}/auth/taskComments/getTaskComments/${taskId}`,

        {
            method: "GET",

            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );


    const result =
        await response.json();


    if (!response.ok) {

        throw new Error(
            result.message ||
            "Failed to fetch task comments."
        );
    }


    return result;
};


/* =========================================================
   ADD TASK COMMENT
========================================================= */

export const addTaskComment = async (
    taskId,
    message,
    token
) => {

    if (!token) {

        throw new Error(
            "Authentication token is missing."
        );
    }


    const response = await fetch(

        `${API_URL}/auth/taskComments/addTask/${taskId}`,

        {
            method: "POST",

            headers: {

                "Content-Type":
                    "application/json",

                Authorization:
                    `Bearer ${token}`
            },

            body: JSON.stringify({
                message
            })
        }
    );


    const result =
        await response.json();


    if (!response.ok) {

        throw new Error(
            result.message ||
            "Failed to add comment."
        );
    }


    return result;
};

export {
    createTask,
    getAllTasks,
    getTasksByStatus,
    getTaskById,
    updateTask,
    deleteTask,
    getMyTasks,
    completeTask
};
