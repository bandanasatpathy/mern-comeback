const taskRoutes = require("express").Router();


const {
    authMiddleware,
    adminOnly,
    employeeOnly
} = require("../middlewear/auth.middlewear");


const {
    validateTask
} = require("../middlewear/task.middlewear");


const {

    createTaskByAdmin,

    getAllTasksByAdmin,

    getAnEmployeeTasks,

    getMyTasks,

    getTaskById,

    updateTask,

    deleteTask,

    completeTask,

    getAllTasksByStatus

} = require("../controller/task.controller");


// ======================================================
// ADMIN ONLY
// ======================================================


// ------------------------------------------------------
// CREATE TASK
// ------------------------------------------------------

taskRoutes.post(

    "/createTaskByAdmin",

    authMiddleware,

    adminOnly,

    validateTask,

    createTaskByAdmin

);


// ------------------------------------------------------
// GET ALL TASKS
// ------------------------------------------------------

taskRoutes.get(

    "/getAllTasksByAdmin",

    authMiddleware,

    adminOnly,

    getAllTasksByAdmin

);


// ------------------------------------------------------
// GET TASKS OF ONE EMPLOYEE
// ------------------------------------------------------

taskRoutes.get(

    "/getAnEmployeeTasks/:id",

    authMiddleware,

    adminOnly,

    getAnEmployeeTasks

);


// ------------------------------------------------------
// GET TASKS BY STATUS
// ------------------------------------------------------

taskRoutes.get(

    "/getAllTasksByStatus/:status",

    authMiddleware,

    adminOnly,

    getAllTasksByStatus

);


// ------------------------------------------------------
// UPDATE TASK
// ------------------------------------------------------
// Admin can update task details.
// Status is NOT changed here.

taskRoutes.put(

    "/updateTask/:id",

    authMiddleware,

    adminOnly,

    updateTask

);


// ------------------------------------------------------
// DELETE TASK
// ------------------------------------------------------

taskRoutes.delete(

    "/deleteTask/:id",

    authMiddleware,

    adminOnly,

    deleteTask

);


// ======================================================
// ADMIN + EMPLOYEE
// ======================================================


// ------------------------------------------------------
// GET ONE TASK
// ------------------------------------------------------
// Admin can view any task.
// Employee can view only their own task.
// Ownership is checked inside controller.

taskRoutes.get(

    "/getTaskById/:id",

    authMiddleware,

    getTaskById

);


// ======================================================
// EMPLOYEE ONLY
// ======================================================


// ------------------------------------------------------
// GET MY TASKS
// ------------------------------------------------------

taskRoutes.get(

    "/myTasks",

    authMiddleware,

    employeeOnly,

    getMyTasks

);


// ------------------------------------------------------
// UPDATE MY TASK STATUS
// ------------------------------------------------------
//
// pending → in-progress
// in-progress → completed
//
// Employee can ONLY update their own task.
// Controller verifies assignedTo === req.userId.

taskRoutes.patch(

    "/completeTask/:id",

    authMiddleware,

    employeeOnly,

    completeTask

);


module.exports = taskRoutes;