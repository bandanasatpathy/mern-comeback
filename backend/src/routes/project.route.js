const express = require("express");

const router = express.Router();

const {
    createProject,
    getAllProjects,
    getProjectById,
    updateProject,
    addProjectMember,
    removeProjectMember,
    archiveProject
} = require("../controller/project.controller");

const {
    authMiddleware,adminOnly
} = require("../middlewear/auth.middlewear");


// ======================================================
// GET ALL PROJECTS
// ADMIN + EMPLOYEE
// ======================================================

router.get(
    "/getAllProjects",
    authMiddleware,
    getAllProjects
);

// ======================================================
// GET PROJECT BY ID
// ADMIN + PROJECT MEMBER
// ======================================================

router.get(
    "/:id",
    authMiddleware,
    getProjectById
);


// ======================================================
// CREATE PROJECT
// ADMIN ONLY
// ======================================================

router.post(
    "/createProject",
    authMiddleware,
    adminOnly,
    createProject
);

// ======================================================
// UPDATE PROJECT
// ADMIN ONLY
// ======================================================

router.put(
    "/updateProject/:id",
    authMiddleware,
    adminOnly,
    updateProject
);

// ======================================================
// ADD PROJECT MEMBER
// ADMIN ONLY
// ======================================================

router.post(
    "/addProjectMember/:id",
    authMiddleware,
    adminOnly,
    addProjectMember
);

// ======================================================
// REMOVE PROJECT MEMBER
// ADMIN ONLY
// ======================================================

router.delete(
    "/removeProjectMember/:id",
    authMiddleware,
    adminOnly,
    removeProjectMember
);

// ======================================================
// ARCHIVE PROJECT
// ADMIN ONLY
// ======================================================

router.patch(
    "/archiveProject/:id/archive",
    authMiddleware,
    adminOnly,
    archiveProject
);


module.exports = router;