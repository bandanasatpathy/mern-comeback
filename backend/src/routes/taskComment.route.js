const taskCommentRoutes = require("express").Router();

const {
    authMiddleware
} = require("../middlewear/auth.middlewear");

const {
    getTaskComments,
    addTaskComment
} = require("../controller/taskComment.controller");


/*
=========================================================
GET COMMENTS FOR A TASK
=========================================================
*/

taskCommentRoutes.get(
    "/getTaskComments/:taskId",
    authMiddleware,
    getTaskComments
);


/*
=========================================================
ADD COMMENT TO A TASK
=========================================================
*/

taskCommentRoutes.post(
    "/addTask/:taskId",
    authMiddleware,
    addTaskComment
);


module.exports = taskCommentRoutes;