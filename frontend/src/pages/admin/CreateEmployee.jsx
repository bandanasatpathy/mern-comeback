import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";

import { useAuth } from "../../context/AuthContext";
import { createEmployee } from "../../services/userService";

import "./CreateEmployee.css";

function CreateEmployee() {

  const { token } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: ""
  });

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const [showPassword, setShowPassword] = useState(false);


  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value
    }));

  };


  const handleSubmit = async (e) => {

    e.preventDefault();

    setLoading(true);

    setMessage("");
    setMessageType("");

    try {

      const response = await createEmployee(
        formData,
        token
      );

      setMessage(
        response.message ||
        "Employee created successfully."
      );

      setMessageType("success");

      // Clear form
      setFormData({
        name: "",
        email: "",
        password: "",
        role: ""
      });

      setShowPassword(false);

      // Navigate after showing success message
      setTimeout(() => {
        navigate("/admin/employees");
      }, 1000);

    } catch (error) {

      console.error(
        "Failed to create employee:",
        error
      );

      setMessage(
        error.response?.data?.message ||
        "Failed to create employee."
      );

      setMessageType("error");

    } finally {

      setLoading(false);

    }
  };


  return (

    <div className="create-employee-page">

      <main className="create-employee-content">

        <div className="create-employee-shell">

          <div className="create-employee-header">

            <div className="create-employee-header-icon">
              <i className="bi bi-person-plus"></i>
            </div>

            <div className="create-employee-header-text">

              <h2>Create Employee</h2>

              <p>
                Add a new employee to your organization
              </p>

            </div>

          </div>


          <div className="create-employee-card">

          {message && (

            <div
              className={`alert ${
                messageType === "success"
                  ? "alert-success"
                  : "alert-danger"
              }`}
            >
              {message}
            </div>

          )}


          <form onSubmit={handleSubmit}>

            {/* Name */}

            <div className="form-group">

              <label htmlFor="name">
                Name
              </label>

              <div className="input-wrapper">

                <i className="bi bi-person input-icon"></i>

                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Enter employee name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />

              </div>

            </div>


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
                  placeholder="Enter employee email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />

              </div>

            </div>


            {/* Password */}

            <div className="form-group">

              <label htmlFor="password">
                Temporary Password
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
                  placeholder="Enter temporary password"
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
                  value={formData.role}
                  onChange={handleChange}
                  required
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
                  navigate("/admin/employees")
                }
                disabled={loading}
              >
                Cancel
              </button>


              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >

                {loading ? (

                  <>

                    <i className="bi bi-arrow-repeat spinning"></i>

                    Creating...

                  </>

                ) : (

                  <>

                    <i className="bi bi-person-plus"></i>

                    Create

                  </>

                )}

              </button>

            </div>

          </form>

          </div>

        </div>

      </main>

    </div>
  );
}

export default CreateEmployee;