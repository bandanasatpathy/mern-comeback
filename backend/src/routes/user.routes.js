const userRoutes = require('express').Router();

const {
    authMiddleware,
    adminOnly,
    employeeOnly
} = require('../middlewear/auth.middlewear');

const {
    getAllEmployees,
    getUserById,
    updateUser,
    deactivateUser,
    activateUser,
    changePassword,
    requestProfileUpdate,
    getProfileUpdateRequests,
    updateProfileUpdateRequestStatus
} = require('../controller/user.controller');


// ===============================
// LOGGED-IN USER
// ===============================

userRoutes.patch(
    "/changePassword",
    authMiddleware,
    changePassword
);

// Request admin to update profile information
userRoutes.post(
    '/requestProfileUpdate',
    authMiddleware,
    employeeOnly,
    requestProfileUpdate
);

// ===============================
// ADMIN ONLY
// ===============================

// Get all users/employees
userRoutes.get(
    '/getAllEmployees',
    authMiddleware,
    adminOnly,
    getAllEmployees
);


// Get a particular user
userRoutes.get(
    '/getUserById/:id',
    authMiddleware,
    adminOnly,
    getUserById
);


// Update a user
userRoutes.put(
    '/updateUser/:id',
    authMiddleware,
    updateUser
);


// Deactivate a user
userRoutes.patch(
    '/deactivateUser/:id',
    authMiddleware,
    adminOnly,
    deactivateUser
);

// Activate a user
userRoutes.patch(
    '/activateUser/:id',
    authMiddleware,
    adminOnly,
    activateUser
);

userRoutes.get(
    "/profileUpdateRequests",
    authMiddleware,
    adminOnly,
    getProfileUpdateRequests
);


userRoutes.patch(
    "/profileUpdateRequests/:userId/status",
    authMiddleware,
    adminOnly,
    updateProfileUpdateRequestStatus
);


module.exports = userRoutes;