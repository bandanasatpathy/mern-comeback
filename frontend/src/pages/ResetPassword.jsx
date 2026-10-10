import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";

import PublicNavbar from "../components/PublicNavbar";
import Loading from "../components/Loading";

import "./ResetPassword.css";

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [loading, setLoading] = useState(false);

    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");

    const [formData, setFormData] = useState({
        newPassword: "",
        confirmPassword: "",
    });

    // =========================================================
    // HANDLE INPUT
    // =========================================================

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });

        // Clear old error when user starts typing again
        if (message) {
            setMessage("");
            setMessageType("");
        }
    };

    // =========================================================
    // PASSWORD VALIDATION
    // =========================================================

    const validatePassword = () => {
        if (!formData.newPassword) {
            return "Please enter your new password.";
        }

        if (formData.newPassword.length < 8) {
            return "Password must be at least 8 characters long.";
        }

        if (!formData.confirmPassword) {
            return "Please confirm your new password.";
        }

        if (
            formData.newPassword !==
            formData.confirmPassword
        ) {
            return "Passwords do not match.";
        }

        return null;
    };

    // =========================================================
    // RESET PASSWORD
    // =========================================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationError = validatePassword();

        if (validationError) {
            setMessage(validationError);
            setMessageType("error");
            return;
        }

        if (!token) {
            setMessage(
                "Invalid password reset link. Please request a new reset link."
            );
            setMessageType("error");
            return;
        }

        setLoading(true);
        setMessage("");
        setMessageType("");

        try {
            const response = await axios.post(
                `${process.env.REACT_APP_API_URL}/auth/resetPassword`,
                {
                    token,
                    newPassword: formData.newPassword,
                    confirmPassword: formData.confirmPassword,
                }
            );

            setMessage(
                response.data.message ||
                "Password reset successfully."
            );

            setMessageType("success");

            // Redirect only after successful reset
            setTimeout(() => {
                navigate("/login");
            }, 1800);

        } catch (error) {
            console.error(
                "Password reset failed:",
                error
            );

            setMessage(
                error.response?.data?.message ||
                "Unable to reset your password. Please try again."
            );

            setMessageType("error");

        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // PASSWORD REQUIREMENTS
    // =========================================================

    const passwordLengthValid =
        formData.newPassword.length >= 8;

    const passwordsMatch =
        formData.confirmPassword.length > 0 &&
        formData.newPassword ===
        formData.confirmPassword;

    return (
        <>
            {/* Loading overlay */}
            {loading && (
                <Loading message="Updating your password..." />
            )}

            {/* Public Navbar */}
            <PublicNavbar />

            <div className="reset-password-page">

                <div className="reset-password-card">

                    {/* =================================================
                        ICON
                    ================================================== */}

                    <div className="reset-password-icon">
                        <i className="bi bi-shield-lock"></i>
                    </div>

                    {/* =================================================
                        HEADING
                    ================================================== */}

                    <h2>
                        Reset Password
                    </h2>

                    <p className="reset-password-subtitle">
                        Create a new password for your
                        Task Management account
                    </p>

                    <div
                        className="reset-password-accent-line"
                        aria-hidden="true"
                    ></div>

                    {/* =================================================
                        MESSAGE
                    ================================================== */}

                    {message && (
                        <div
                            className={`reset-password-message ${
                                messageType === "success"
                                    ? "success"
                                    : "error"
                            }`}
                            role="alert"
                        >
                            <i
                                className={
                                    messageType === "success"
                                        ? "bi bi-check-circle-fill"
                                        : "bi bi-exclamation-circle-fill"
                                }
                            ></i>

                            <span>
                                {message}
                            </span>
                        </div>
                    )}

                    {/* =================================================
                        FORM
                    ================================================== */}

                    <form onSubmit={handleSubmit}>

                        {/* New Password */}
                        <div className="reset-form-group">

                            <label htmlFor="newPassword">
                                New Password
                            </label>

                            <div className="reset-input-wrapper">

                                <i className="bi bi-lock reset-input-icon"></i>

                                <input
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    id="newPassword"
                                    name="newPassword"
                                    placeholder="Enter your new password"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    disabled={loading}
                                    autoComplete="new-password"
                                    required
                                />

                                <button
                                    type="button"
                                    className="reset-password-toggle"
                                    onClick={() =>
                                        setShowPassword(
                                            !showPassword
                                        )
                                    }
                                    disabled={loading}
                                    aria-label={
                                        showPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >
                                    <i
                                        className={
                                            showPassword
                                                ? "bi bi-eye-slash"
                                                : "bi bi-eye"
                                        }
                                    ></i>
                                </button>

                            </div>

                        </div>

                        {/* Confirm Password */}
                        <div className="reset-form-group">

                            <label htmlFor="confirmPassword">
                                Confirm Password
                            </label>

                            <div className="reset-input-wrapper">

                                <i className="bi bi-lock-fill reset-input-icon"></i>

                                <input
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    placeholder="Confirm your new password"
                                    value={
                                        formData.confirmPassword
                                    }
                                    onChange={handleChange}
                                    disabled={loading}
                                    autoComplete="new-password"
                                    required
                                />

                                <button
                                    type="button"
                                    className="reset-password-toggle"
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            !showConfirmPassword
                                        )
                                    }
                                    disabled={loading}
                                    aria-label={
                                        showConfirmPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >
                                    <i
                                        className={
                                            showConfirmPassword
                                                ? "bi bi-eye-slash"
                                                : "bi bi-eye"
                                        }
                                    ></i>
                                </button>

                            </div>

                        </div>

                        {/* =================================================
                            PASSWORD REQUIREMENTS
                        ================================================== */}

                        <div className="password-requirements">

                            <div className="password-requirements-title">
                                <i className="bi bi-info-circle"></i>
                                Password requirements
                            </div>

                            <div
                                className={
                                    passwordLengthValid
                                        ? "requirement valid"
                                        : "requirement"
                                }
                            >
                                <i
                                    className={
                                        passwordLengthValid
                                            ? "bi bi-check-circle-fill"
                                            : "bi bi-circle"
                                    }
                                ></i>

                                At least 8 characters
                            </div>

                            <div
                                className={
                                    passwordsMatch
                                        ? "requirement valid"
                                        : "requirement"
                                }
                            >
                                <i
                                    className={
                                        passwordsMatch
                                            ? "bi bi-check-circle-fill"
                                            : "bi bi-circle"
                                    }
                                ></i>

                                Passwords must match
                            </div>

                        </div>

                        {/* =================================================
                            SUBMIT
                        ================================================== */}

                        <button
                            type="submit"
                            className="reset-password-button"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <i className="bi bi-arrow-repeat spinning"></i>
                                    Updating Password...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-shield-check"></i>
                                    Reset Password
                                </>
                            )}
                        </button>

                    </form>

                    {/* =================================================
                        BACK TO LOGIN
                    ================================================== */}

                    <button
                        type="button"
                        className="reset-back-login"
                        onClick={() => navigate("/login")}
                        disabled={loading}
                    >
                        <i className="bi bi-arrow-left"></i>
                        Back to Login
                    </button>

                </div>
            </div>
        </>
    );
};

export default ResetPassword;