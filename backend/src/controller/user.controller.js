const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const Auth = require('../models/auth.model');
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const PasswordReset = require("../models/passwordReset.model");
const nodemailer = require("nodemailer");

const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const bootstrapAdmin = async (req, res) => {

    try {

        // ========================================
        // CHECK WHETHER ADMIN ALREADY EXISTS
        // ========================================

        const existingAdmin = await User.findOne({
            role: "admin"
        });

        if (existingAdmin) {

            return res.status(403).json({
                status: "error",
                message: "Admin already exists. Bootstrap is disabled."
            });

        }


        // ========================================
        // GET ADMIN DETAILS
        // ========================================

        const {
            name,
            email,
            password
        } = req.body;


        if (!name || !email || !password) {

            return res.status(400).json({
                status: "error",
                message: "Name, email and password are required."
            });

        }


        if (password.length < 8) {

            return res.status(400).json({
                status: "error",
                message: "Password must be at least 8 characters long."
            });

        }


        // ========================================
        // CHECK EMAIL
        // ========================================

        const existingUser = await User.findOne({
            email: email.toLowerCase().trim()
        });

        if (existingUser) {

            return res.status(409).json({
                status: "error",
                message: "A user with this email already exists."
            });

        }


        // ========================================
        // CREATE ADMIN
        // ========================================

        const admin = new User({

            name: name.trim(),

            email: email.toLowerCase().trim(),

            password,

            role: "admin"

        });


        await admin.save();


        // ========================================
        // SAFE RESPONSE
        // ========================================

        return res.status(201).json({

            status: "success",

            message: "Initial admin created successfully.",

            data: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role
            }

        });

    } catch (error) {

        console.error(
            "Bootstrap admin error:",
            error
        );

        return res.status(500).json({
            status: "error",
            message: "Failed to create initial admin."
        });

    }
};

// Create a new user
const createUserByAdmin = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ status: 'error', message: 'User already exists' });
    }
    const user = new User({ name, email, password, role });
    const userData = await user.save();
    const safeUser = {
      id: userData._id,
      name: userData.name,
      email: userData.email,
      role: userData.role
    };
    res.status(201).json({ status: 'success', data: safeUser, message: 'User created successfully' });
  }
  catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
}

const getAllEmployees = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const isActive =
      req.query.isActive === undefined
        ? true
        : req.query.isActive === "true";

    const skip = (page - 1) * limit;

    const users = await User.find({
      role: "employee",
      isActive: isActive
    })
      .select("-password")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalUsers = await User.countDocuments({
      role: "employee",
      isActive: isActive
    });

    res.status(200).json({
      status: "success",
      data: users,
      pagination: {
        page,
        limit,
        totalUsers,
        totalPages: Math.ceil(totalUsers / limit)
      }
    });

  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }
    res.status(200).json({ status: 'success', data: user });
  }
  catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
}

const updateUser = async (req, res) => {

    try {

        const {
            name,
            email,
            role
        } = req.body;


        const user = await User.findById(
            req.params.id
        );

        if (!user) {

            return res.status(404).json({
                status: "error",
                message: "User not found"
            });

        }


        // ========================================
        // UPDATE ORGANIZATIONAL INFORMATION ONLY
        // ========================================

        if (name !== undefined) {
            user.name = name.trim();
        }

        if (email !== undefined) {
            user.email = email.toLowerCase().trim();
        }

        if (role !== undefined) {

            if (!["employee", "admin"].includes(role)) {

                return res.status(400).json({
                    status: "error",
                    message: "Invalid role value"
                });

            }

            user.role = role;
        }


        await user.save();


        return res.status(200).json({
            status: "success",
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            message: "User updated successfully"
        });

    } catch (error) {

        if (error.code === 11000) {

            return res.status(400).json({
                status: "error",
                message: "Email is already in use."
            });

        }

        return res.status(500).json({
            status: "error",
            message: error.message
        });

    }
};


const deactivateUser = async (req, res) => {
  try {
    if (req.params.id === req.userId.toString()) {
      return res.status(400).json({
        status: "error",
        message: "You cannot deactivate your own account."
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found."
      });
    }

    res.status(200).json({
      status: "success",
      data: user,
      message: "Employee deactivated successfully."
    });

  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message
    });
  }
};

const activateUser = async (req, res) => {
  try {
    if (req.params.id === req.userId.toString()) {
      return res.status(400).json({
        status: "error",
        message: "You cannot activate your own account."
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: true },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found."
      });
    }

    res.status(200).json({
      status: "success",
      data: user,
      message: "Employee activated successfully."
    });

  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message
    });
  }
};

const loginUser = async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;

        const user = await User.findOne({
            email: email.toLowerCase().trim()
        });

        if (!user) {

            return res.status(401).json({
                status: "error",
                message: "Invalid credentials"
            });

        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {

            return res.status(401).json({
                status: "error",
                message: "Invalid credentials"
            });

        }

        const token = jwt.sign(
            {
                id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "12h"
            }
        );

        const existingAuthRecord =
            await Auth.findOne({
                userId: user._id
            });

        if (existingAuthRecord) {

            await Auth.findByIdAndUpdate(
                existingAuthRecord._id,
                {
                    token,
                    createdAt: new Date()
                }
            );

        } else {

            const authRecord = new Auth({
                userId: user._id,
                token
            });

            await authRecord.save();
        }

        return res.status(200).json({
            status: "success",
            data: {
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            }
        });

    } catch (error) {

        return res.status(500).json({
            status: "error",
            message: error.message
        });

    }
};

const changePassword = async (req, res) => {

    try {

        const {
            currentPassword,
            newPassword,
            confirmPassword
        } = req.body;


        // ========================================
        // VALIDATION
        // ========================================

        if (
            !currentPassword ||
            !newPassword ||
            !confirmPassword
        ) {

            return res.status(400).json({
                status: "error",
                message: "All password fields are required."
            });

        }


        if (newPassword !== confirmPassword) {

            return res.status(400).json({
                status: "error",
                message: "New password and confirm password do not match."
            });

        }


        if (newPassword.length < 8) {

            return res.status(400).json({
                status: "error",
                message: "New password must be at least 8 characters long."
            });

        }


        if (currentPassword === newPassword) {

            return res.status(400).json({
                status: "error",
                message: "New password must be different from the current password."
            });

        }


        // ========================================
        // GET LOGGED-IN USER
        // ========================================

        const user = await User.findById(
            req.userId
        );

        if (!user) {

            return res.status(404).json({
                status: "error",
                message: "User not found."
            });

        }


        // ========================================
        // CHECK CURRENT PASSWORD
        // ========================================

        const isCurrentPasswordValid =
            await bcrypt.compare(
                currentPassword,
                user.password
            );

        if (!isCurrentPasswordValid) {

            return res.status(401).json({
                status: "error",
                message: "Current password is incorrect."
            });

        }


        // ========================================
        // SAVE NEW PASSWORD
        // ========================================

        user.password = newPassword;

        await user.save();


        // ========================================
        // RESPONSE
        // ========================================

        return res.status(200).json({
            status: "success",
            message: "Password changed successfully."
        });

    } catch (error) {

        return res.status(500).json({
            status: "error",
            message: error.message
        });

    }
};

const forgotPassword = async (req, res) => {

    try {

        const {
            email
        } = req.body;


        if (!email) {

            return res.status(400).json({
                status: "error",
                message: "Email is required."
            });

        }


        const normalizedEmail =
            email.toLowerCase().trim();


        const user = await User.findOne({
            email: normalizedEmail
        });


        // ========================================
        // DON'T REVEAL WHETHER EMAIL EXISTS
        // ========================================

        if (!user) {

            return res.status(200).json({
                status: "success",
                message:
                    "If an account exists with this email, a password reset link has been sent."
            });

        }


        // ========================================
        // INVALIDATE OLD RESET TOKENS
        // ========================================

        await PasswordReset.updateMany(
            {
                userId: user._id,
                used: false
            },
            {
                used: true
            }
        );


        // ========================================
        // GENERATE RESET TOKEN
        // ========================================

        const resetToken =
            crypto.randomBytes(32).toString("hex");


        const tokenHash =
            crypto
                .createHash("sha256")
                .update(resetToken)
                .digest("hex");


        const expiresAt =
            new Date(
                Date.now() + 15 * 60 * 1000
            );


        await PasswordReset.create({

            userId: user._id,

            tokenHash,

            expiresAt

        });


        // ========================================
        // RESET URL
        // ========================================

        const resetUrl =
            `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;


        // ========================================
        // SEND EMAIL
        // ========================================

const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: [user.email],
    subject: "Reset your Task Management password",

    text:
        `You requested a password reset.\n\n` +
        `Click the following link to reset your password:\n\n` +
        `${resetUrl}\n\n` +
        `This link will expire in 15 minutes.\n\n` +
        `If you did not request this, you can safely ignore this email.`,

    html: `
        <div style="
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 0 auto;
            padding: 30px;
            color: #172033;
        ">

            <h2>Password Reset</h2>

            <p>
                You requested a password reset
                for your Task Management account.
            </p>

            <p>
                Click the button below to create
                a new password.
            </p>

            <p>
                <a
                    href="${resetUrl}"
                    style="
                        display: inline-block;
                        padding: 12px 20px;
                        background: #2563eb;
                        color: #ffffff;
                        text-decoration: none;
                        border-radius: 6px;
                        font-weight: 600;
                    "
                >
                    Reset Password
                </a>
            </p>

            <p>
                This link expires in
                <strong>15 minutes</strong>.
            </p>

            <p>
                If you did not request this,
                you can safely ignore this email.
            </p>

        </div>
    `
});

if (error) {
    console.error("Resend email error:", error);
    throw new Error("Unable to send password reset email.");
}

console.log("Password reset email sent:", data);


        return res.status(200).json({

            status: "success",

            message:
                "If an account exists with this email, a password reset link has been sent."

        });

    } catch (error) {

        console.error(
            "Forgot password error:",
            error.message
        );

        return res.status(500).json({
            status: "error",
            message: "Unable to process password reset request."
        });

    }
};

const resetPassword = async (req, res) => {

    try {

        const {
            token,
            newPassword,
            confirmPassword
        } = req.body;


        // ========================================
        // VALIDATION
        // ========================================

        if (
            !token ||
            !newPassword ||
            !confirmPassword
        ) {

            return res.status(400).json({
                status: "error",
                message: "All fields are required."
            });

        }


        if (newPassword !== confirmPassword) {

            return res.status(400).json({
                status: "error",
                message:
                    "New password and confirm password do not match."
            });

        }


        if (newPassword.length < 8) {

            return res.status(400).json({
                status: "error",
                message:
                    "Password must be at least 8 characters long."
            });

        }


        // ========================================
        // HASH TOKEN
        // ========================================

        const tokenHash =
            crypto
                .createHash("sha256")
                .update(token)
                .digest("hex");


        // ========================================
        // FIND VALID RESET TOKEN
        // ========================================

        const passwordReset =
            await PasswordReset.findOne({

                tokenHash,

                used: false,

                expiresAt: {
                    $gt: new Date()
                }

            });


        if (!passwordReset) {

            return res.status(400).json({
                status: "error",
                message:
                    "Password reset link is invalid or has expired."
            });

        }


        // ========================================
        // FIND USER
        // ========================================

        const user =
            await User.findById(
                passwordReset.userId
            );


        if (!user) {

            return res.status(404).json({
                status: "error",
                message: "User not found."
            });

        }


        // ========================================
        // UPDATE PASSWORD
        // ========================================

        user.password = newPassword;

        await user.save();


        // ========================================
        // MARK TOKEN AS USED
        // ========================================

        passwordReset.used = true;

        await passwordReset.save();


        // ========================================
        // INVALIDATE ACTIVE AUTH TOKENS
        // ========================================

        await Auth.deleteMany({
            userId: user._id
        });


        return res.status(200).json({

            status: "success",

            message:
                "Password reset successfully. Please login with your new password."

        });

    } catch (error) {

        console.error(
            "Reset password error:",
            error.message
        );

        return res.status(500).json({
            status: "error",
            message:
                "Unable to reset password."
        });

    }
};

const requestProfileUpdate = async (req, res) => {
    try {

        const {
            requestedName,
            reason
        } = req.body;

        // =========================
        // Validation
        // =========================

        if (!requestedName) {
            return res.status(400).json({
                status: "error",
                message: "Please provide the name you want to update."
            });
        }

        if (!reason || !reason.trim()) {
            return res.status(400).json({
                status: "error",
                message: "Please provide a reason for the update request."
            });
        }

        // =========================
        // Get logged-in user
        // =========================

        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                status: "error",
                message: "User not found."
            });
        }

        // =========================
        // Only employee can request
        // =========================

        if (user.role !== "employee") {
            return res.status(403).json({
                status: "error",
                message: "Only employees can submit profile update requests."
            });
        }

        // =========================
        // Check existing request
        // =========================

        if (
            user.profileUpdateRequest &&
            user.profileUpdateRequest.status === "pending"
        ) {
            return res.status(400).json({
                status: "error",
                message: "You already have a pending profile update request."
            });
        }

        // =========================
        // Prepare requested data
        // =========================

        const updateRequest = {
            requestedName: requestedName.trim(),
            reason: reason.trim(),
            status: "pending",
            requestedAt: new Date(),
            reviewedAt: null,
            reviewedBy: null
        };

        // =========================
        // Save request
        // =========================

        user.profileUpdateRequest = updateRequest;

        await user.save();

        return res.status(201).json({
            status: "success",
            message: "Profile update request submitted to admin successfully.",
            data: {
                status: user.profileUpdateRequest.status,
                requestedName:
                    user.profileUpdateRequest.requestedName,
                reason:
                    user.profileUpdateRequest.reason,
                requestedAt:
                    user.profileUpdateRequest.requestedAt
            }
        });

    } catch (error) {

        console.error(
            "Profile update request error:",
            error
        );

        return res.status(500).json({
            status: "error",
            message: "Failed to submit profile update request."
        });
    }
};

// ========================================
// GET PROFILE UPDATE REQUESTS
// ADMIN ONLY
// ========================================

const getProfileUpdateRequests = async (req, res) => {
    try {

        const users = await User.find({
            "profileUpdateRequest.status": "pending"
        })
            .select(
                "name email role profileUpdateRequest"
            )
            .sort({
                "profileUpdateRequest.requestedAt": -1
            });


        return res.status(200).json({
            status: "success",
            message: "Profile update requests fetched successfully.",
            data: users
        });

    } catch (error) {

        console.error(
            "Get profile update requests error:",
            error
        );

        return res.status(500).json({
            status: "error",
            message: "Failed to fetch profile update requests."
        });
    }
};

// ========================================
// CHANGE PROFILE UPDATE REQUEST STATUS
// ADMIN ONLY
// ========================================

const updateProfileUpdateRequestStatus = async (req, res) => {
  try {

    const { userId } = req.params;
    const { status } = req.body;


    // ==========================================
    // VALIDATE STATUS
    // ==========================================

    if (!["approved", "rejected"].includes(status)) {

      return res.status(400).json({
        status: "error",
        message: "Status must be either approved or rejected."
      });

    }


    // ==========================================
    // FIND USER
    // ==========================================

    const user = await User.findById(userId);

    if (!user) {

      return res.status(404).json({
        status: "error",
        message: "User not found."
      });

    }


    // ==========================================
    // CHECK PENDING REQUEST
    // ==========================================

    if (
      !user.profileUpdateRequest ||
      user.profileUpdateRequest.status !== "pending"
    ) {

      return res.status(400).json({
        status: "error",
        message: "No pending profile update request found for this user."
      });

    }


    // ==========================================
    // APPROVE
    // ==========================================

    if (status === "approved") {

      const requestedName =
        user.profileUpdateRequest.requestedName?.trim();


      if (!requestedName) {

        return res.status(400).json({
          status: "error",
          message: "Requested name is missing."
        });

      }


      // Update employee's actual name
      user.name = requestedName;


      // Update request status
      user.profileUpdateRequest.status = "approved";

    }


    // ==========================================
    // REJECT
    // ==========================================

    if (status === "rejected") {

      // DO NOT change user.name

      // Only change request status
      user.profileUpdateRequest.status = "rejected";

    }


    // ==========================================
    // COMMON REVIEW INFORMATION
    // ==========================================

    user.profileUpdateRequest.reviewedAt = new Date();

    user.profileUpdateRequest.reviewedBy = req.userId;


    // ==========================================
    // SAVE
    // ==========================================

    await user.save();


    // ==========================================
    // RESPONSE
    // ==========================================

    return res.status(200).json({

      status: "success",

      message:
        status === "approved"
          ? "Profile update request approved successfully."
          : "Profile update request rejected successfully."

    });


  } catch (error) {

    console.error(
      "Update profile request status error:",
      error
    );


    return res.status(500).json({

      status: "error",

      message: "Failed to update profile request."

    });

  }
};


module.exports = {
  bootstrapAdmin,
  createUserByAdmin,
  getAllEmployees,
  getUserById,
  updateUser,
  deactivateUser,
  activateUser,
  loginUser,
  changePassword,
  forgotPassword,
  resetPassword,
  requestProfileUpdate,
  getProfileUpdateRequests,
  updateProfileUpdateRequestStatus
}