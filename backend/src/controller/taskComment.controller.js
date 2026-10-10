const mongoose = require("mongoose");

const Task = require("../models/task.model");
const TaskComment = require("../models/TaskComment.model");


/*
=========================================================
CHECK TASK ACCESS
=========================================================

Admin:
    Can access any task.

Employee:
    Can access only tasks assigned to them.
=========================================================
*/

const checkTaskAccess = async (taskId, req) => {

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
        return {
            error: {
                statusCode: 400,
                message: "Invalid task ID."
            }
        };
    }


    const task = await Task.findOne({
        _id: taskId,
        isDeleted: false
    });


    if (!task) {
        return {
            error: {
                statusCode: 404,
                message: "Task not found."
            }
        };
    }


    /*
    ADMIN
    */

    if (req.role === "admin") {

        return {
            task
        };
    }


    /*
    EMPLOYEE
    */

    if (req.role === "employee") {

        if (
            task.assignedTo.toString() !==
            req.userId.toString()
        ) {

            return {
                error: {
                    statusCode: 403,
                    message:
                        "You do not have access to this task."
                }
            };
        }


        return {
            task
        };
    }


    return {
        error: {
            statusCode: 403,
            message: "Access denied."
        }
    };
};


/*
=========================================================
GET TASK COMMENTS
=========================================================
*/

const getTaskComments = async (req, res) => {

    try {

        const { taskId } = req.params;


        /*
        CHECK TASK ACCESS
        */

        const access = await checkTaskAccess(
            taskId,
            req
        );


        if (access.error) {

            return res.status(
                access.error.statusCode
            ).json({

                status: "error",

                message:
                    access.error.message

            });
        }


        /*
        GET COMMENTS
        */

        const comments = await TaskComment.find({
            task: taskId
        })
            .populate(
                "user",
                "name email role"
            )
            .sort({
                createdAt: 1
            });


        return res.status(200).json({

            status: "success",

            message:
                "Task comments fetched successfully.",

            data: comments

        });


    } catch (error) {

        console.error(
            "Get task comments error:",
            error
        );


        return res.status(500).json({

            status: "error",

            message:
                "Failed to fetch task comments."

        });
    }
};


/*
=========================================================
ADD TASK COMMENT
=========================================================
*/

const addTaskComment = async (req, res) => {

    try {

        const { taskId } = req.params;

        const { message } = req.body;


        /*
        VALIDATE MESSAGE
        */

        if (
            !message ||
            typeof message !== "string" ||
            !message.trim()
        ) {

            return res.status(400).json({

                status: "error",

                message:
                    "Comment message is required."

            });
        }


        if (message.trim().length > 2000) {

            return res.status(400).json({

                status: "error",

                message:
                    "Comment cannot exceed 2000 characters."

            });
        }


        /*
        CHECK TASK ACCESS
        */

        const access = await checkTaskAccess(
            taskId,
            req
        );


        if (access.error) {

            return res.status(
                access.error.statusCode
            ).json({

                status: "error",

                message:
                    access.error.message

            });
        }


        /*
        CREATE COMMENT
        */

        const comment = new TaskComment({

            task: access.task._id,

            user: req.userId,

            message: message.trim()

        });


        await comment.save();


        /*
        RETURN POPULATED COMMENT
        */

        await comment.populate(
            "user",
            "name email role"
        );


        return res.status(201).json({

            status: "success",

            message:
                "Comment added successfully.",

            data: comment

        });


    } catch (error) {

        console.error(
            "Add task comment error:",
            error
        );


        if (
            error.name ===
            "CastError"
        ) {

            return res.status(400).json({

                status: "error",

                message:
                    "Invalid task ID."

            });
        }


        return res.status(500).json({

            status: "error",

            message:
                "Failed to add comment."

        });
    }
};


module.exports = {

    getTaskComments,

    addTaskComment

};