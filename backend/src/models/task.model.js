const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
    {

        // ========================================
        // TASK DETAILS
        // ========================================

        title: {
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
        // TASK STATUS
        // ========================================

        status: {
            type: String,
            enum: [
                "pending",
                "in-progress",
                "completed"
            ],
            default: "pending"
        },


        // ========================================
        // PRIORITY
        // ========================================

        priority: {
            type: String,
            enum: [
                "low",
                "medium",
                "high"
            ],
            default: "medium"
        },


        // ========================================
        // ASSIGNMENT
        // ========================================

        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        assignedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },


        // ========================================
        // PROJECT
        // ========================================

        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            required: true
        },


        // ========================================
        // DUE DATE
        // ========================================

        dueDate: {
            type: Date,
            required: true
        },


        // ========================================
        // STATUS HISTORY
        // ========================================

        statusHistory: [
            {
                status: {
                    type: String,
                    enum: [
                        "pending",
                        "in-progress",
                        "completed"
                    ],
                    required: true
                },

                changedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    required: true
                },

                changedAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ],


        // ========================================
        // EDIT HISTORY
        // ========================================

        editHistory: [
            {
                editedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    required: true
                },

                editedAt: {
                    type: Date,
                    default: Date.now
                },

                reason: {
                    type: String,
                    required: true,
                    trim: true
                },

                changes: [
                    {
                        field: {
                            type: String,
                            required: true
                        },

                        oldValue: {
                            type: mongoose.Schema.Types.Mixed
                        },

                        newValue: {
                            type: mongoose.Schema.Types.Mixed
                        }
                    }
                ]
            }
        ],


        // ========================================
        // SOFT DELETE
        // ========================================

        isDeleted: {
            type: Boolean,
            default: false
        }

    },
    {
        timestamps: true
    }
);


// ========================================
// INITIAL STATUS HISTORY
// ========================================

// When a task is created, automatically
// record its initial "pending" status.
//
// assignedBy is the admin who created the task.

taskSchema.pre("save", function () {

    if (this.isNew) {

        this.statusHistory.push({
            status: this.status,
            changedBy: this.assignedBy,
            changedAt: new Date()
        });

    }

});


module.exports = mongoose.model(
    "Task",
    taskSchema
);