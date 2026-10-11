import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";

import { useAuth } from "../../context/AuthContext";
import {
    getUserById,
    updateUserRole
} from "../../services/userService";

import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Loading from "../../components/Loading";

import "./EditEmployee.css";

function EditEmployee() {

    const { token, user: loggedInUser } = useAuth();

    const { id } = useParams();

    const navigate = useNavigate();

    // Employee information
    const [employee, setEmployee] = useState(null);

    // Only role is editable
    const [role, setRole] = useState("");

    const [loading, setLoading] = useState(true);

    const [saving, setSaving] = useState(false);

    const [message, setMessage] = useState("");

    const [messageType, setMessageType] = useState("");


    /* =========================
       Fetch employee
    ========================= */

    const fetchEmployee = async () => {

        setLoading(true);

        setMessage("");
        setMessageType("");

        try {

            const response = await getUserById(
                id,
                token
            );

            const employeeData = response.data;

            setEmployee(employeeData);

            setRole(employeeData.role || "");

        } catch (error) {

            console.error(
                "Failed to fetch employee:",
                error
            );

            setMessage(
                error.response?.data?.message ||
                "Failed to load employee."
            );

            setMessageType("error");

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {
        fetchEmployee();
    }, [id, fetchEmployee]);


    /* =========================
       Update role
    ========================= */

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!role) {
            setMessage("Please select a role.");
            setMessageType("error");
            return;
        }

        if (loggedInUser?._id === id || loggedInUser?.id === id) {
            setMessage("You cannot change your own role.");
            setMessageType("error");
            return;
        }

        setSaving(true);
        setMessage("");
        setMessageType("");

        try {
            console.log("Role being sent:", role);

            const response = await updateUserRole(
                id,
                { role: role },
                token
            );

            setMessage(response.message || "Employee role updated successfully.");
            setMessageType("success");

            setTimeout(() => {
                navigate("/admin/employees");
            }, 1000);

        } catch (error) {
            console.error("Failed to update employee role:", error);

            setMessage(
                error.response?.data?.message ||
                "Failed to update employee role."
            );

            setMessageType("error");
        } finally {
            setSaving(false);
        }
    };


    return (

        <div className="edit-employee-page">

            <Navbar />

            <div className="edit-employee-body">

                <Sidebar />

                <main className="edit-employee-content">

                    <div className="edit-employee-header">

                        <div>

                            <h2>Edit Employee Role</h2>

                            <p>
                                Update the employee's access role
                            </p>

                        </div>

                    </div>


                    <div className="edit-employee-card">

                        {message && (

                            <div
                                className={`alert ${messageType === "success"
                                        ? "alert-success"
                                        : "alert-danger"
                                    }`}
                            >
                                {message}
                            </div>

                        )}


                        {employee && (

                            <form onSubmit={handleSubmit}>

                                {/* Employee Name */}

                                <div className="form-group">

                                    <label>
                                        Employee
                                    </label>

                                    <div className="employee-info-field">

                                        <i className="bi bi-person"></i>

                                        <div>
                                            <strong>
                                                {employee.name}
                                            </strong>

                                            <span>
                                                Employee name
                                            </span>
                                        </div>

                                    </div>

                                </div>


                                {/* Email */}

                                <div className="form-group">

                                    <label>
                                        Email
                                    </label>

                                    <div className="employee-info-field">

                                        <i className="bi bi-envelope"></i>

                                        <div>
                                            <strong>
                                                {employee.email}
                                            </strong>

                                            <span>
                                                Email cannot be changed
                                            </span>
                                        </div>

                                    </div>

                                </div>


                                {/* Role */}

                                <div className="form-group">

                                    <label htmlFor="role">
                                        Role
                                    </label>

                                    <div className="select-wrapper">

                                        <i className="bi bi-person-badge select-icon"></i>

                                        <select
                                            id="role"
                                            name="role"
                                            value={role}
                                            onChange={(e) =>
                                                setRole(e.target.value)
                                            }
                                            required
                                            disabled={
                                                loggedInUser?._id === id ||
                                                loggedInUser?.id === id
                                            }
                                        >

                                            <option value="">
                                                Select role
                                            </option>

                                            <option value="employee">
                                                Employee
                                            </option>

                                            <option value="admin">
                                                Admin
                                            </option>

                                        </select>

                                        <i className="bi bi-chevron-down select-arrow"></i>

                                    </div>

                                </div>


                                {/* Actions */}

                                <div className="form-actions">

                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() =>
                                            navigate(
                                                "/admin/employees"
                                            )
                                        }
                                        disabled={saving}
                                    >
                                        Cancel
                                    </button>


                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={
                                            saving ||
                                            loggedInUser?._id === id ||
                                            loggedInUser?.id === id
                                        }
                                    >

                                        {saving ? (

                                            <>
                                                <i className="bi bi-arrow-repeat spinning"></i>
                                                Updating...
                                            </>

                                        ) : (

                                            <>
                                                <i className="bi bi-check-lg"></i>
                                                Update Role
                                            </>

                                        )}

                                    </button>

                                </div>

                            </form>

                        )}

                    </div>

                </main>

            </div>


            {loading && (
                <Loading message="Loading employee..." />
            )}

        </div>
    );
}

export default EditEmployee;