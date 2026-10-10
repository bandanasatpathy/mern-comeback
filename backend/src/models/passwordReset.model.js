const mongoose = require("mongoose");

const passwordResetSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        tokenHash: {
            type: String,
            required: true
        },

        expiresAt: {
            type: Date,
            required: true
        },

        used: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "PasswordReset",
    passwordResetSchema
);