const jwt = require("jsonwebtoken");

const Auth = require("../models/auth.model");
const User = require("../models/user.model");


/* =========================================================
   AUTHENTICATION MIDDLEWARE
========================================================= */

const authMiddleware = async (req, res, next) => {

    try {

        /* =====================================================
           1. GET AUTHORIZATION HEADER
        ===================================================== */

        const authHeader = req.headers.authorization;

        if (!authHeader) {

            return res.status(401).json({
                status: "error",
                message: "Authorization header missing."
            });
        }


        /* =====================================================
           2. CHECK BEARER FORMAT
        ===================================================== */

        if (!authHeader.startsWith("Bearer ")) {

            return res.status(401).json({
                status: "error",
                message: "Invalid authorization format."
            });
        }


        /* =====================================================
           3. EXTRACT TOKEN
        ===================================================== */

        const token = authHeader.substring(7).trim();

        if (!token) {

            return res.status(401).json({
                status: "error",
                message: "Authentication token missing."
            });
        }


        /* =====================================================
           4. VERIFY JWT
        ===================================================== */

        let decoded;

        try {

            decoded = jwt.verify(
                token,
                process.env.JWT_SECRET
            );

        } catch (jwtError) {

            if (jwtError.name === "TokenExpiredError") {

                return res.status(401).json({
                    status: "error",
                    message: "Authentication token has expired."
                });
            }

            return res.status(401).json({
                status: "error",
                message: "Invalid authentication token."
            });
        }


        /* =====================================================
           5. CHECK TOKEN IN AUTH COLLECTION
        ===================================================== */

        const authRecord = await Auth.findOne({
            token: token
        });

        if (!authRecord) {

            return res.status(401).json({
                status: "error",
                message: "Invalid or expired token."
            });
        }


        /* =====================================================
           6. GET USER
        ===================================================== */

        const user = await User.findById(
            authRecord.userId
        );

        if (!user) {

            return res.status(401).json({
                status: "error",
                message: "User account not found."
            });
        }


        /* =====================================================
           7. CHECK USER ACCOUNT STATUS
        ===================================================== */

        if (!user.isActive) {

            return res.status(403).json({
                status: "error",
                message: "Your account is inactive."
            });
        }


        /* =====================================================
           8. STORE AUTHENTICATED USER
        ===================================================== */

        req.user = user;

        req.userId = user._id;

        req.role = user.role;

        req.token = token;


        /* =====================================================
           9. CONTINUE
        ===================================================== */

        next();

    } catch (error) {

        console.error(
            "Authentication middleware error:",
            error
        );

        return res.status(500).json({
            status: "error",
            message: "Authentication failed."
        });
    }
};


/* =========================================================
   ADMIN ONLY
========================================================= */

const adminOnly = (req, res, next) => {

    if (!req.user) {

        return res.status(401).json({
            status: "error",
            message: "Authentication required."
        });
    }


    if (req.role !== "admin") {

        return res.status(403).json({
            status: "error",
            message: "Admin access required."
        });
    }


    next();
};


/* =========================================================
   EMPLOYEE ONLY
========================================================= */

const employeeOnly = (req, res, next) => {

    if (!req.user) {

        return res.status(401).json({
            status: "error",
            message: "Authentication required."
        });
    }


    if (req.role !== "employee") {

        return res.status(403).json({
            status: "error",
            message: "Employee access required."
        });
    }


    next();
};


module.exports = {
    authMiddleware,
    adminOnly,
    employeeOnly
};