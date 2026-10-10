const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: true
        },

        role: {
            type: String,
            enum: ["employee", "admin"],
            default: "employee"
        },

        isActive: {
            type: Boolean,
            default: true
        },

        // ========================================
        // PROFILE UPDATE REQUEST
        // ========================================

        profileUpdateRequest: {
            requestedName: {
                type: String,
                default: null,
                trim: true
            },

            reason: {
                type: String,
                default: null,
                trim: true
            },

            status: {
                type: String,
                enum: [
                    "none",
                    "pending",
                    "approved",
                    "rejected"
                ],
                default: "none"
            },

            requestedAt: {
                type: Date,
                default: null
            },

            reviewedAt: {
                type: Date,
                default: null
            },

            reviewedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                default: null
            }
        }
    },
    {
        timestamps: true
    }
);


// ========================================
// HASH PASSWORD BEFORE SAVE
// ========================================

userSchema.pre("save", async function () {

    // Do not hash password again when
    // updating name, email, role, etc.
    if (!this.isModified("password")) {
        return;
    }

    const salt = await bcrypt.genSalt(12);

    this.password = await bcrypt.hash(
        this.password,
        salt
    );
});


module.exports = mongoose.model("User", userSchema);