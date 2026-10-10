const mongoose = require("mongoose");

const Task = require("../models/task.model");
const User = require("../models/user.model");
const Project = require("../models/project.model");


// ======================================================
// HELPER
// CHECK WHETHER EMPLOYEE IS A PROJECT MEMBER
// ======================================================

const isProjectMember = (project, employeeId) => {

    if (!project || !Array.isArray(project.members)) {
        return false;
    }

    return project.members.some(
        (memberId) =>
            memberId.toString() === employeeId.toString()
    );

};


// ======================================================
// CREATE TASK
// ADMIN ONLY
// ======================================================

const createTaskByAdmin = async (req, res) => {

    try {

        const {
            title,
            description,
            priority,
            assignedTo,
            dueDate,
            project
        } = req.body;


        // ==============================================
        // VALIDATION
        // ==============================================

        if (!title || !title.trim()) {

            return res.status(400).json({
                status: "error",
                message: "Task title is required."
            });

        }


        if (!description || !description.trim()) {

            return res.status(400).json({
                status: "error",
                message: "Task description is required."
            });

        }


        if (!assignedTo) {

            return res.status(400).json({
                status: "error",
                message: "Employee assignment is required."
            });

        }


        if (!project) {

            return res.status(400).json({
                status: "error",
                message: "Project is required."
            });

        }


        if (!dueDate) {

            return res.status(400).json({
                status: "error",
                message: "Due date is required."
            });

        }


        // ==============================================
        // VALIDATE EMPLOYEE ID
        // ==============================================

        if (!mongoose.Types.ObjectId.isValid(assignedTo)) {

            return res.status(400).json({
                status: "error",
                message: "Invalid employee ID."
            });

        }


        // ==============================================
        // VALIDATE PROJECT ID
        // ==============================================

        if (!mongoose.Types.ObjectId.isValid(project)) {

            return res.status(400).json({
                status: "error",
                message: "Invalid project ID."
            });

        }


        // ==============================================
        // CHECK ACTIVE EMPLOYEE
        // ==============================================

        const employee = await User.findOne({

            _id: assignedTo,

            role: "employee",

            isActive: true

        });


        if (!employee) {

            return res.status(400).json({

                status: "error",

                message:
                    "Task can only be assigned to an active employee."

            });

        }


        // ==============================================
        // CHECK PROJECT
        // ==============================================

        const projectData = await Project.findOne({

            _id: project,

            status: {
                $ne: "archived"
            }

        });


        if (!projectData) {

            return res.status(404).json({

                status: "error",

                message:
                    "Project not found or archived."

            });

        }


        // ==============================================
        // CHECK EMPLOYEE PROJECT MEMBERSHIP
        // ==============================================

        if (
            !isProjectMember(
                projectData,
                employee._id
            )
        ) {

            return res.status(400).json({

                status: "error",

                message:
                    "The assigned employee is not a member of this project."

            });

        }


        // ==============================================
        // VALIDATE DUE DATE
        // ==============================================

        const parsedDate = new Date(dueDate);

        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {

            return res.status(400).json({

                status: "error",

                message: "Invalid due date."

            });

        }


        // ==============================================
        // CREATE TASK
        // ==============================================

        const task = new Task({

            title: title.trim(),

            description: description.trim(),

            status: "pending",

            priority: priority || "medium",

            assignedTo: employee._id,

            assignedBy: req.userId,

            project: projectData._id,

            dueDate: parsedDate

        });


        await task.save();


        return res.status(201).json({

            status: "success",

            message: "Task created successfully.",

            data: task

        });


    } catch (error) {

        console.error(
            "Create task error:",
            error
        );


        return res.status(500).json({

            status: "error",

            message: error.message

        });

    }

};


// ======================================================
// GET ALL TASKS
// ADMIN ONLY
// ======================================================

const getAllTasksByAdmin = async (req, res) => {

    try {

        const page = Math.max(
            Number(req.query.page) || 1,
            1
        );


        const limit = Math.min(
            Math.max(
                Number(req.query.limit) || 10,
                1
            ),
            100
        );


        const skip =
            (page - 1) * limit;


        const filter = {
            isDeleted: false
        };


        const [
            tasks,
            totalTasks
        ] = await Promise.all([

            Task.find(filter)

                .populate(
                    "assignedTo",
                    "name email"
                )

                .populate(
                    "assignedBy",
                    "name email"
                )

                .populate(
                    "project",
                    "name description status"
                )

                .skip(skip)

                .limit(limit)

                .sort({
                    createdAt: -1
                }),

            Task.countDocuments(filter)

        ]);


        return res.status(200).json({

            status: "success",

            message:
                "Tasks fetched successfully.",

            data: tasks,

            pagination: {

                page,

                limit,

                totalTasks,

                totalPages:
                    Math.ceil(
                        totalTasks / limit
                    )

            }

        });


    } catch (error) {

        console.error(
            "Get all tasks error:",
            error
        );


        return res.status(500).json({

            status: "error",

            message: error.message

        });

    }

};


// ======================================================
// GET TASK BY ID
// ADMIN OR PROJECT MEMBER
// ======================================================

const getTaskById = async (req, res) => {

    try {

        const taskId =
            req.params.id;


        // ==============================================
        // VALIDATE TASK ID
        // ==============================================

        if (
            !mongoose.Types.ObjectId.isValid(taskId)
        ) {

            return res.status(400).json({

                status: "error",

                message:
                    "Invalid task ID."

            });

        }


        // ==============================================
        // FIND TASK
        // ==============================================

        const task =
            await Task.findOne({

                _id: taskId,

                isDeleted: false

            })

                .populate(
                    "assignedTo",
                    "name email"
                )

                .populate(
                    "assignedBy",
                    "name email"
                )

                .populate(
                    "project",
                    "name description status"
                );


        if (!task) {

            return res.status(404).json({

                status: "error",

                message:
                    "Task not found."

            });

        }


        // ==============================================
        // ADMIN CAN VIEW EVERYTHING
        // ==============================================

        if (req.role === "admin") {

            return res.status(200).json({

                status: "success",

                message:
                    "Task fetched successfully.",

                data: task

            });

        }


        // ==============================================
        // PROJECT CHECK
        // ==============================================

        if (!task.project) {

            return res.status(403).json({

                status: "error",

                message:
                    "This task is not associated with a project."

            });

        }


        // ==============================================
        // GET PROJECT MEMBERS
        // ==============================================

        const projectData =
            await Project.findById(
                task.project._id
            ).select("members");


        if (!projectData) {

            return res.status(404).json({

                status: "error",

                message:
                    "Project not found."

            });

        }


        // ==============================================
        // EMPLOYEE PROJECT MEMBERSHIP CHECK
        // ==============================================

        if (
            !isProjectMember(
                projectData,
                req.userId
            )
        ) {

            return res.status(403).json({

                status: "error",

                message:
                    "You are not a member of this project."

            });

        }


        return res.status(200).json({

            status: "success",

            message:
                "Task fetched successfully.",

            data: task

        });


    } catch (error) {

        console.error(
            "Get task by ID error:",
            error
        );


        return res.status(500).json({

            status: "error",

            message: error.message

        });

    }

};


// ======================================================
// UPDATE TASK
// ADMIN ONLY
// ======================================================
//
// Admin can update:
// - title
// - description
// - priority
// - assignedTo
// - project
// - dueDate
//
// Admin CANNOT update:
// - status
// - assignedBy
// - isDeleted
//
// ======================================================

const updateTask = async (req, res) => {

    try {

        const taskId =
            req.params.id;


        // ==============================================
        // VALIDATE TASK ID
        // ==============================================

        if (
            !mongoose.Types.ObjectId.isValid(taskId)
        ) {

            return res.status(400).json({

                status: "error",

                message:
                    "Invalid task ID."

            });

        }


        const {
            title,
            description,
            priority,
            assignedTo,
            project,
            dueDate
        } = req.body;


        // ==============================================
        // FIND TASK
        // ==============================================

        const task =
            await Task.findOne({

                _id: taskId,

                isDeleted: false

            });


        if (!task) {

            return res.status(404).json({

                status: "error",

                message:
                    "Task not found."

            });

        }


        // ==============================================
        // VALIDATE TITLE
        // ==============================================

        if (
            title !== undefined &&
            !title.trim()
        ) {

            return res.status(400).json({

                status: "error",

                message:
                    "Task title cannot be empty."

            });

        }


        // ==============================================
        // VALIDATE DESCRIPTION
        // ==============================================

        if (
            description !== undefined &&
            !description.trim()
        ) {

            return res.status(400).json({

                status: "error",

                message:
                    "Task description cannot be empty."

            });

        }


        // ==============================================
        // VALIDATE PRIORITY
        // ==============================================

        if (
            priority !== undefined &&
            ![
                "low",
                "medium",
                "high"
            ].includes(priority)
        ) {

            return res.status(400).json({

                status: "error",

                message:
                    "Invalid task priority."

            });

        }


        // ==============================================
        // DETERMINE FINAL PROJECT
        // ==============================================

        const finalProjectId =
            project !== undefined
                ? project
                : task.project;


        // ==============================================
        // VALIDATE PROJECT
        // ==============================================

        if (
            !finalProjectId ||
            !mongoose.Types.ObjectId.isValid(
                finalProjectId
            )
        ) {

            return res.status(400).json({

                status: "error",

                message:
                    "Valid project is required."

            });

        }


        // ==============================================
        // FIND PROJECT
        // ==============================================

        const projectData =
            await Project.findOne({

                _id: finalProjectId,

                status: {
                    $ne: "archived"
                }

            });


        if (!projectData) {

            return res.status(404).json({

                status: "error",

                message:
                    "Project not found or archived."

            });

        }


        // ==============================================
        // DETERMINE FINAL EMPLOYEE
        // ==============================================

        const finalAssignedTo =
            assignedTo !== undefined
                ? assignedTo
                : task.assignedTo;


        // ==============================================
        // VALIDATE EMPLOYEE ID
        // ==============================================

        if (
            !finalAssignedTo ||
            !mongoose.Types.ObjectId.isValid(
                finalAssignedTo
            )
        ) {

            return res.status(400).json({

                status: "error",

                message:
                    "Valid employee is required."

            });

        }


        // ==============================================
        // VALIDATE ACTIVE EMPLOYEE
        // ==============================================

        const employee =
            await User.findOne({

                _id: finalAssignedTo,

                role: "employee",

                isActive: true

            });


        if (!employee) {

            return res.status(400).json({

                status: "error",

                message:
                    "Task can only be assigned to an active employee."

            });

        }


        // ==============================================
        // VALIDATE PROJECT MEMBERSHIP
        // ==============================================

        if (
            !isProjectMember(
                projectData,
                employee._id
            )
        ) {

            return res.status(400).json({

                status: "error",

                message:
                    "The assigned employee is not a member of this project."

            });

        }


        // ==============================================
        // APPLY CHANGES
        // ==============================================

        if (title !== undefined) {

            task.title =
                title.trim();

        }


        if (description !== undefined) {

            task.description =
                description.trim();

        }


        if (priority !== undefined) {

            task.priority =
                priority;

        }


        if (assignedTo !== undefined) {

            task.assignedTo =
                employee._id;

        }


        if (project !== undefined) {

            task.project =
                projectData._id;

        }


        if (dueDate !== undefined) {

            const parsedDate =
                new Date(dueDate);


            if (
                Number.isNaN(
                    parsedDate.getTime()
                )
            ) {

                return res.status(400).json({

                    status: "error",

                    message:
                        "Invalid due date."

                });

            }


            task.dueDate =
                parsedDate;

        }


        await task.save();


        return res.status(200).json({

            status: "success",

            message:
                "Task updated successfully.",

            data: task

        });


    } catch (error) {

        console.error(
            "Update task error:",
            error
        );


        return res.status(500).json({

            status: "error",

            message: error.message

        });

    }

};


// ======================================================
// DELETE TASK
// ADMIN ONLY
// ======================================================

const deleteTask = async (req, res) => {

    try {

        const taskId =
            req.params.id;


        // ==============================================
        // VALIDATE ID
        // ==============================================

        if (
            !mongoose.Types.ObjectId.isValid(taskId)
        ) {

            return res.status(400).json({

                status: "error",

                message:
                    "Invalid task ID."

            });

        }


        // ==============================================
        // FIND TASK
        // ==============================================

        const task =
            await Task.findOne({

                _id: taskId,

                isDeleted: false

            });


        if (!task) {

            return res.status(404).json({

                status: "error",

                message:
                    "Task not found."

            });

        }


        // ==============================================
        // SOFT DELETE
        // ==============================================

        task.isDeleted = true;


        await task.save();


        return res.status(200).json({

            status: "success",

            message:
                "Task deleted successfully.",

            data: task

        });


    } catch (error) {

        console.error(
            "Delete task error:",
            error
        );


        return res.status(500).json({

            status: "error",

            message: error.message

        });

    }

};


// ======================================================
// COMPLETE / UPDATE TASK STATUS
// EMPLOYEE ONLY
// ======================================================

const completeTask = async (req, res) => {

    try {

        const taskId =
            req.params.id;


        // ==============================================
        // VALIDATE ID
        // ==============================================

        if (
            !mongoose.Types.ObjectId.isValid(taskId)
        ) {

            return res.status(400).json({

                status: "error",

                message:
                    "Invalid task ID."

            });

        }


        // ==============================================
        // FIND ASSIGNED TASK
        // ==============================================

        const task =
            await Task.findOne({

                _id: taskId,

                assignedTo: req.userId,

                isDeleted: false

            });


        if (!task) {

            return res.status(404).json({

                status: "error",

                message:
                    "Task not found or task is not assigned to you."

            });

        }


        // ==============================================
        // STATUS FLOW
        // ==============================================

        if (
            task.status === "pending"
        ) {

            task.status =
                "in-progress";

        }

        else if (
            task.status === "in-progress"
        ) {

            task.status =
                "completed";

        }

        else if (
            task.status === "completed"
        ) {

            return res.status(400).json({

                status: "error",

                message:
                    "Completed task cannot be changed."

            });

        }

        else {

            return res.status(400).json({

                status: "error",

                message:
                    "Invalid current task status."

            });

        }


        await task.save();


        return res.status(200).json({

            status: "success",

            message:
                task.status === "in-progress"
                    ? "Task started successfully."
                    : "Task completed successfully.",

            data: task

        });


    } catch (error) {

        console.error(
            "Complete task error:",
            error
        );


        return res.status(500).json({

            status: "error",

            message: error.message

        });

    }

};


// ======================================================
// GET TASKS BY STATUS
// ADMIN ONLY
// ======================================================

const getAllTasksByStatus = async (req, res) => {

    try {

        const {
            status
        } = req.params;


        // ==============================================
        // VALID STATUSES
        // ==============================================

        const validStatuses = [

            "pending",

            "in-progress",

            "completed"

        ];


        if (
            !validStatuses.includes(status)
        ) {

            return res.status(400).json({

                status: "error",

                message:
                    "Invalid task status."

            });

        }


        // ==============================================
        // PAGINATION
        // ==============================================

        const page = Math.max(
            Number(req.query.page) || 1,
            1
        );


        const limit = Math.min(
            Math.max(
                Number(req.query.limit) || 10,
                1
            ),
            100
        );


        const skip =
            (page - 1) * limit;


        // ==============================================
        // FILTER
        // ==============================================

        const filter = {

            status,

            isDeleted: false

        };


        const [
            tasks,
            totalTasks
        ] = await Promise.all([

            Task.find(filter)

                .populate(
                    "assignedTo",
                    "name email"
                )

                .populate(
                    "assignedBy",
                    "name email"
                )

                .populate(
                    "project",
                    "name description status"
                )

                .skip(skip)

                .limit(limit)

                .sort({
                    createdAt: -1
                }),

            Task.countDocuments(filter)

        ]);


        return res.status(200).json({

            status: "success",

            message:
                "Tasks fetched successfully.",

            data: tasks,

            pagination: {

                page,

                limit,

                totalTasks,

                totalPages:
                    Math.ceil(
                        totalTasks / limit
                    )

            }

        });


    } catch (error) {

        console.error(
            "Get tasks by status error:",
            error
        );


        return res.status(500).json({

            status: "error",

            message: error.message

        });

    }

};


// ======================================================
// GET AN EMPLOYEE'S TASKS
// ADMIN ONLY
// ======================================================

const getAnEmployeeTasks = async (req, res) => {

    try {

        const employeeId =
            req.params.id;


        // ==============================================
        // VALIDATE EMPLOYEE ID
        // ==============================================

        if (
            !mongoose.Types.ObjectId.isValid(
                employeeId
            )
        ) {

            return res.status(400).json({

                status: "error",

                message:
                    "Invalid employee ID."

            });

        }


        // ==============================================
        // CHECK EMPLOYEE
        // ==============================================

        const employee =
            await User.findOne({

                _id: employeeId,

                role: "employee"

            });


        if (!employee) {

            return res.status(404).json({

                status: "error",

                message:
                    "Employee not found."

            });

        }


        // ==============================================
        // PAGINATION
        // ==============================================

        const page = Math.max(
            Number(req.query.page) || 1,
            1
        );


        const limit = Math.min(
            Math.max(
                Number(req.query.limit) || 10,
                1
            ),
            100
        );


        const skip =
            (page - 1) * limit;


        // ==============================================
        // FILTER
        // ==============================================

        const filter = {

            assignedTo: employeeId,

            isDeleted: false

        };


        const [
            tasks,
            totalTasks
        ] = await Promise.all([

            Task.find(filter)

                .populate(
                    "assignedTo",
                    "name email"
                )

                .populate(
                    "assignedBy",
                    "name email"
                )

                .populate(
                    "project",
                    "name description status"
                )

                .skip(skip)

                .limit(limit)

                .sort({
                    createdAt: -1
                }),

            Task.countDocuments(filter)

        ]);


        return res.status(200).json({

            status: "success",

            message:
                "Employee tasks fetched successfully.",

            data: tasks,

            pagination: {

                page,

                limit,

                totalTasks,

                totalPages:
                    Math.ceil(
                        totalTasks / limit
                    )

            }

        });


    } catch (error) {

        console.error(
            "Get employee tasks error:",
            error
        );


        return res.status(500).json({

            status: "error",

            message: error.message

        });

    }

};


// ======================================================
// GET MY TASKS
// EMPLOYEE ONLY
// ======================================================

const getMyTasks = async (req, res) => {

    try {

        const page = Math.max(
            Number(req.query.page) || 1,
            1
        );


        const limit = Math.min(
            Math.max(
                Number(req.query.limit) || 10,
                1
            ),
            100
        );


        const skip =
            (page - 1) * limit;


        // ==============================================
        // EMPLOYEE'S TASKS
        // ==============================================

        const filter = {

            assignedTo: req.userId,

            isDeleted: false

        };


        const [
            tasks,
            totalTasks
        ] = await Promise.all([

            Task.find(filter)

                .populate(
                    "assignedTo",
                    "name email"
                )

                .populate(
                    "assignedBy",
                    "name email"
                )

                .populate(
                    "project",
                    "name description status"
                )

                .skip(skip)

                .limit(limit)

                .sort({
                    createdAt: -1
                }),

            Task.countDocuments(filter)

        ]);


        return res.status(200).json({

            status: "success",

            message:
                "Your tasks fetched successfully.",

            data: tasks,

            pagination: {

                page,

                limit,

                totalTasks,

                totalPages:
                    Math.ceil(
                        totalTasks / limit
                    )

            }

        });


    } catch (error) {

        console.error(
            "Get my tasks error:",
            error
        );


        return res.status(500).json({

            status: "error",

            message: error.message

        });

    }

};


// ======================================================
// EXPORTS
// ======================================================

module.exports = {

    createTaskByAdmin,

    getAllTasksByAdmin,

    getTaskById,

    updateTask,

    deleteTask,

    completeTask,

    getAllTasksByStatus,

    getAnEmployeeTasks,

    getMyTasks

};