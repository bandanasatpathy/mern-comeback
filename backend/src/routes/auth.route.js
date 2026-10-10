const authRoutes = require('express').Router();

const {
    authMiddleware,
    adminOnly
} = require('../middlewear/auth.middlewear');

const {
    validateUser
} = require('../middlewear/user.middlewear');

const {
    bootstrapAdmin,
    createUserByAdmin,
    loginUser,
    forgotPassword,
    resetPassword
} = require('../controller/user.controller');


// ===============================
// PUBLIC
// ===============================

authRoutes.post(
    "/bootstrapAdmin",
    bootstrapAdmin
);

// Login
authRoutes.post(
    '/loginUser',
    loginUser
);

// ===============================
// FORGOT PASSWORD
// ===============================

authRoutes.post(
    "/forgotPassword",
    forgotPassword
);


// ===============================
// RESET PASSWORD
// ===============================

authRoutes.post(
    "/resetPassword",
    resetPassword
);


// ===============================
// ADMIN ONLY
// ===============================

// Admin creates a user/employee
authRoutes.post(
    '/createUserByAdmin',
    authMiddleware,
    adminOnly,
    validateUser,
    createUserByAdmin
);


module.exports = authRoutes;