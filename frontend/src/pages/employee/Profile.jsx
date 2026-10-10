import React, { useState } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";

import { useAuth } from "../../context/AuthContext";
import { requestProfileUpdate } from "../../services/userService";

import "./Profile.css";


const Profile = () => {

    const { token, user } = useAuth();


    // ========================================
    // FORM
    // ========================================

    const [form, setForm] = useState({
        requestedName: "",
        reason: ""
    });


    // ========================================
    // UI STATE
    // ========================================

    const [saving, setSaving] = useState(false);

    const [message, setMessage] = useState("");

    const [messageType, setMessageType] = useState("");


    // ========================================
    // HANDLE FORM CHANGE
    // ========================================

    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value
        }));

    };


    // ========================================
    // SUBMIT REQUEST
    // ========================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        setMessage("");
        setMessageType("");


        // At least one field required
        if (
            !form.requestedName.trim()
        ) {

            setMessage(
                "Please enter the name you want to update."
            );

            setMessageType("error");

            return;
        }


        // Reason required
        if (!form.reason.trim()) {

            setMessage(
                "Please provide a reason for this request."
            );

            setMessageType("error");

            return;
        }


        setSaving(true);


        try {

            const data = {};

            if (form.requestedName.trim()) {

                data.requestedName =
                    form.requestedName.trim();

            }

            data.reason =
                form.reason.trim();


            const response =
                await requestProfileUpdate(
                    data,
                    token
                );


            setMessage(
                response.message ||
                "Profile update request submitted successfully."
            );

            setMessageType("success");


            // Clear form
            setForm({
                requestedName: "",
                reason: ""
            });


        } catch (error) {

            console.error(
                "Profile update request failed:",
                error
            );

            setMessage(
                error.message ||
                "Failed to submit profile update request."
            );

            setMessageType("error");

        } finally {

            setSaving(false);

        }
    };


    return (

        <div className="profile-page">


            {/* ========================================
                PAGE HEADER
            ======================================== */}

            <div className="profile-header">

                <div>

                    <div className="profile-title-row">

                        <div className="profile-title-icon">

                            <i className="bi bi-person-circle"></i>

                        </div>

                        <div>

                            <h2>
                                My Profile
                            </h2>

                            <p>
                                View your account information and
                                request profile changes.
                            </p>

                        </div>

                    </div>

                </div>

            </div>


            {/* ========================================
                MESSAGE
            ======================================== */}

            {message && (

                <div
                    className={
                        messageType === "success"
                            ? "profile-alert success"
                            : "profile-alert error"
                    }
                >

                    <i
                        className={
                            messageType === "success"
                                ? "bi bi-check-circle"
                                : "bi bi-exclamation-circle"
                        }
                    ></i>

                    <span>
                        {message}
                    </span>

                </div>

            )}


            <div className="profile-grid">


                {/* ========================================
                    CURRENT PROFILE
                ======================================== */}

                <div className="profile-card">

                    <div className="profile-card-header">

                        <div className="profile-card-icon">

                            <i className="bi bi-person"></i>

                        </div>

                        <div>

                            <h4>
                                Account Information
                            </h4>

                            <p>
                                Your current account details
                            </p>

                        </div>

                    </div>


                    <div className="profile-avatar-section">

                        <div className="profile-avatar">

                            {user?.name
                                ?.charAt(0)
                                ?.toUpperCase() || "U"}

                        </div>

                        <div>

                            <h3>
                                {user?.name || "Employee"}
                            </h3>

                            <span className="profile-role-badge">

                                <i className="bi bi-person-badge"></i>

                                {user?.role || "employee"}

                            </span>

                        </div>

                    </div>


                    <div className="profile-details">


                        {/* Name */}

                        <div className="profile-detail">

                            <div className="profile-detail-icon">

                                <i className="bi bi-person"></i>

                            </div>

                            <div>

                                <span>
                                    Full Name
                                </span>

                                <strong>
                                    {user?.name || "-"}
                                </strong>

                            </div>

                        </div>


                        {/* Email */}

                        <div className="profile-detail">

                            <div className="profile-detail-icon">

                                <i className="bi bi-envelope"></i>

                            </div>

                            <div>

                                <span>
                                    Email
                                </span>

                                <strong>
                                    {user?.email || "-"}
                                </strong>

                            </div>

                        </div>


                        {/* Role */}

                        <div className="profile-detail">

                            <div className="profile-detail-icon">

                                <i className="bi bi-shield-check"></i>

                            </div>

                            <div>

                                <span>
                                    Role
                                </span>

                                <strong>
                                    {user?.role || "-"}
                                </strong>

                            </div>

                        </div>

                    </div>


                    <div className="profile-readonly-note">

                        <i className="bi bi-lock"></i>

                        <span>
                            Name, email and role cannot be changed
                            directly. Contact an administrator by
                            submitting a request.
                        </span>

                    </div>

                </div>


                {/* ========================================
                    REQUEST UPDATE
                ======================================== */}

                <div className="profile-card">

                    <div className="profile-card-header">

                        <div className="profile-card-icon request-icon">

                            <i className="bi bi-pencil-square"></i>

                        </div>

                        <div>

                            <h4>
                                Request Profile Update
                            </h4>

                            <p>
                                Ask an administrator to update
                                your information.
                            </p>

                        </div>

                    </div>


                    <form
                        className="profile-form"
                        onSubmit={handleSubmit}
                    >


                        {/* Requested Name */}

                        <div className="profile-form-group">

                            <label htmlFor="requestedName">

                                Requested Name

                                <span>
                                    Optional
                                </span>

                            </label>

                            <div className="profile-input-wrapper">

                                <i className="bi bi-person"></i>

                                <input
                                    type="text"
                                    id="requestedName"
                                    name="requestedName"
                                    value={
                                        form.requestedName
                                    }
                                    onChange={handleChange}
                                    placeholder={
                                        user?.name ||
                                        "Enter requested name"
                                    }
                                    disabled={saving}
                                />

                            </div>

                            <small>
                                Leave blank if you do not want
                                to change your name.
                            </small>

                        </div>

                        {/* Reason */}

                        <div className="profile-form-group">

                            <label htmlFor="reason">

                                Reason for Request

                                <span className="required">
                                    *
                                </span>

                            </label>

                            <textarea
                                id="reason"
                                name="reason"
                                value={form.reason}
                                onChange={handleChange}
                                placeholder="Explain why you need this information updated..."
                                rows="4"
                                disabled={saving}
                            />

                        </div>


                        {/* Submit */}

                        <button
                            type="submit"
                            className="profile-submit-btn"
                            disabled={saving}
                        >

                            {saving ? (

                                <>
                                    <i className="bi bi-arrow-repeat spinning"></i>

                                    Submitting...
                                </>

                            ) : (

                                <>
                                    <i className="bi bi-send"></i>

                                    Submit Request
                                </>

                            )}

                        </button>

                    </form>

                </div>

            </div>

        </div>

    );

};


export default Profile;