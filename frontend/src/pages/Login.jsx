import React, { useState } from "react";
import axios from "axios";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import PublicNavbar from "../components/PublicNavbar";

import Loading from "../components/Loading";

import "./Login.css";

function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    // =========================================================
    // FORGOT PASSWORD STATES
    // =========================================================

    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [forgotEmail, setForgotEmail] = useState("");
    const [forgotLoading, setForgotLoading] = useState(false);
    const [forgotMessage, setForgotMessage] = useState("");
    const [forgotMessageType, setForgotMessageType] = useState("");

    // =========================================================
    // LOGIN FORM
    // =========================================================

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setMessage("");
        setMessageType("");

        try {
            const response = await axios.post(
                `${process.env.REACT_APP_API_URL}/auth/loginUser`,
                formData
            );

            console.log("Login response:", response.data);

            const token = response.data.data.token;
            const user = response.data.data.user;

            // Save authentication state through AuthContext
            login(token, user);

            setMessage(
                response.data.message || "Login successful"
            );

            setMessageType("success");

            // Redirect based on role
            if (user.role === "admin") {
                navigate("/admin");
            } else if (user.role === "employee") {
                navigate("/employee");
            }

        } catch (error) {
            console.error("Login failed:", error);

            setMessage(
                error.response?.data?.message ||
                "Something went wrong. Please try again."
            );

            setMessageType("error");

        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // OPEN FORGOT PASSWORD MODAL
    // =========================================================

    const openForgotPassword = () => {
        setForgotEmail(formData.email || "");
        setForgotMessage("");
        setForgotMessageType("");
        setShowForgotPassword(true);
    };

    // =========================================================
    // CLOSE FORGOT PASSWORD MODAL
    // =========================================================

    const closeForgotPassword = () => {
        if (forgotLoading) return;

        setShowForgotPassword(false);
        setForgotMessage("");
        setForgotMessageType("");
    };

    // =========================================================
    // FORGOT PASSWORD
    // =========================================================

    const handleForgotPassword = async (e) => {
        e.preventDefault();

        const email = forgotEmail.trim();

        if (!email) {
            setForgotMessage("Please enter your email address.");
            setForgotMessageType("error");
            return;
        }

        setForgotLoading(true);
        setForgotMessage("");
        setForgotMessageType("");

        try {
            const response = await axios.post(
                `${process.env.REACT_APP_API_URL}/auth/forgotPassword`,
                {
                    email,
                }
            );

            setForgotMessage(
                response.data.message ||
                "If an account exists with this email, a password reset link has been sent."
            );

            setForgotMessageType("success");

        } catch (error) {
            console.error("Forgot password failed:", error);

            setForgotMessage(
                error.response?.data?.message ||
                "Unable to process password reset request. Please try again."
            );

            setForgotMessageType("error");

        } finally {
            setForgotLoading(false);
        }
    };

    return (
        <>
            {/* Loader */}
            {loading && <Loading message="Signing you in..." />}

            {/* Public Navbar */}
            <PublicNavbar />

            {/* =====================================================
                LOGIN SECTION
            ====================================================== */}

            <div className="login-page">
                <div className="login-card">

                    {/* Logo */}
                    <div className="login-icon">
                        <i className="bi bi-check2-square"></i>
                    </div>

                    <h2>Welcome Back</h2>

                    <p className="login-subtitle">
                        Sign in to manage your tasks
                    </p>

                    <div
                        className="login-accent-line"
                        aria-hidden="true"
                    ></div>

                    {/* Backend message */}
                    {message && (
                        <div
                            className={`alert ${
                                messageType === "success"
                                    ? "alert-success"
                                    : "alert-danger"
                            }`}
                            role="alert"
                        >
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>

                        {/* Email */}
                        <div className="form-group">

                            <label htmlFor="email">
                                Email
                            </label>

                            <div className="input-wrapper">

                                <i className="bi bi-envelope input-icon"></i>

                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />

                            </div>

                        </div>

                        {/* Password */}
                        <div className="form-group">

                            <label htmlFor="password">
                                Password
                            </label>

                            <div className="input-wrapper">

                                <i className="bi bi-lock input-icon"></i>

                                <input
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    id="password"
                                    name="password"
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />

                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
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

                        {/* Remember + Forgot Password */}
                        <div className="login-options">

                            <label className="login-remember">
                                <input type="checkbox" />
                                <span>Remember me</span>
                            </label>

                            <button
                                type="button"
                                className="login-forgot"
                                onClick={openForgotPassword}
                            >
                                Forgot password?
                            </button>

                        </div>

                        {/* Login button */}
                        <button
                            type="submit"
                            className="login-button"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <i className="bi bi-arrow-repeat spinning"></i>
                                    Signing In...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-box-arrow-in-right"></i>
                                    Sign In
                                </>
                            )}
                        </button>

                    </form>

                    <div className="login-footer">
                        Don't have an account?{" "}
                        <strong>Contact Admin</strong>
                    </div>

                </div>
            </div>

            {/* =====================================================
                ABOUT SECTION
            ====================================================== */}

            <section
                id="about"
                className="login-about"
            >
                <div className="login-about-content">

                    <span className="login-about-label">
                        ABOUT
                    </span>

                    <h2>
                        Task Management System
                    </h2>

                    <p>
                        A simple and secure platform designed to help
                        teams manage projects, assign tasks, track progress,
                        and collaborate efficiently.
                    </p>

                </div>
            </section>

            {/* =====================================================
                FORGOT PASSWORD MODAL
            ====================================================== */}

            {showForgotPassword && (
                <div
                    className="forgot-password-overlay"
                    onClick={closeForgotPassword}
                >
                    <div
                        className="forgot-password-modal"
                        onClick={(e) => e.stopPropagation()}
                    >

                        {/* Close button */}
                        <button
                            type="button"
                            className="forgot-password-close"
                            onClick={closeForgotPassword}
                            disabled={forgotLoading}
                            aria-label="Close"
                        >
                            <i className="bi bi-x-lg"></i>
                        </button>

                        {/* Icon */}
                        <div className="forgot-password-icon">
                            <i className="bi bi-shield-lock"></i>
                        </div>

                        <h3>
                            Forgot Password?
                        </h3>

                        <p className="forgot-password-description">
                            Enter your registered email address and
                            we'll send you a link to reset your password.
                        </p>

                        {/* Message */}
                        {forgotMessage && (
                            <div
                                className={`forgot-password-message ${
                                    forgotMessageType === "success"
                                        ? "success"
                                        : "error"
                                }`}
                            >
                                <i
                                    className={
                                        forgotMessageType === "success"
                                            ? "bi bi-check-circle"
                                            : "bi bi-exclamation-circle"
                                    }
                                ></i>

                                <span>
                                    {forgotMessage}
                                </span>
                            </div>
                        )}

                        <form onSubmit={handleForgotPassword}>

                            <div className="forgot-password-form-group">

                                <label htmlFor="forgotEmail">
                                    Email Address
                                </label>

                                <div className="forgot-password-input-wrapper">

                                    <i className="bi bi-envelope"></i>

                                    <input
                                        type="email"
                                        id="forgotEmail"
                                        placeholder="Enter your registered email"
                                        value={forgotEmail}
                                        onChange={(e) =>
                                            setForgotEmail(e.target.value)
                                        }
                                        disabled={forgotLoading}
                                        required
                                        autoFocus
                                    />

                                </div>

                            </div>

                            <button
                                type="submit"
                                className="forgot-password-submit"
                                disabled={forgotLoading}
                            >
                                {forgotLoading ? (
                                    <>
                                        <i className="bi bi-arrow-repeat spinning"></i>
                                        Sending Reset Link...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-send"></i>
                                        Send Reset Link
                                    </>
                                )}
                            </button>

                        </form>

                        <button
                            type="button"
                            className="forgot-password-back"
                            onClick={closeForgotPassword}
                            disabled={forgotLoading}
                        >
                            <i className="bi bi-arrow-left"></i>
                            Back to Login
                        </button>

                    </div>
                </div>
            )}
        </>
    );
}

export default Login;