const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
    {
        // ========================================
        // PROJECT DETAILS
        // ========================================

        name: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        // ========================================
        // PROJECT MEMBERS
        // ========================================

        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ],

        // ========================================
        // PROJECT CREATOR
        // ========================================

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        // ========================================
        // PROJECT STATUS
        // ========================================

        status: {
            type: String,
            enum: [
                "active",
                "completed",
                "archived"
            ],
            default: "active"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "Project",
    projectSchema
);