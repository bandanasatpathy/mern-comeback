import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";

import { useAuth } from "../../context/AuthContext";

import {
  getAllEmployees,
  deactivateUser,
  activateUser
} from "../../services/userService";

import Loading from "../../components/Loading";
import Pagination from "../../components/Pagination";

import "./Employees.css";

function Employees() {

  const { token } = useAuth();
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [activeTab, setActiveTab] = useState("active");

  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(true);

  const [actionLoading, setActionLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);


  /* =========================
     Fetch Employees
  ========================= */

  const fetchEmployees = async () => {

    setLoading(true);

    setMessage("");
    setMessageType("");

    try {

      const isActive = activeTab === "active";

      const response = await getAllEmployees(
        currentPage,
        10,
        token,
        isActive
      );

      setEmployees(response.data || []);

      setTotalPages(
        response.pagination?.totalPages || 1
      );

    } catch (error) {

      console.error(
        "Failed to fetch employees:",
        error
      );

      setMessage(
        error.response?.data?.message ||
        "Failed to load employees."
      );

      setMessageType("error");

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {

    fetchEmployees();

  }, [currentPage, activeTab]);


  /* =========================
     Change Tab
  ========================= */

  const handleTabChange = (tab) => {

    setActiveTab(tab);
    setCurrentPage(1);
    setSearchTerm("");

  };


  /* =========================
     Open Confirmation Modal
  ========================= */

  const handleStatusChange = (employee) => {

    setSelectedEmployee(employee);

    setShowStatusModal(true);

  };


  /* =========================
     Confirm Status Change
  ========================= */

  const confirmStatusChange = async () => {

    if (!selectedEmployee) {
      return;
    }

    setActionLoading(true);

    setMessage("");
    setMessageType("");

    try {

      let response;

      if (activeTab === "active") {

        response = await deactivateUser(
          selectedEmployee._id,
          token
        );

      } else {

        response = await activateUser(
          selectedEmployee._id,
          token
        );

      }

      setMessage(
        response.message ||
        `Employee ${
          activeTab === "active"
            ? "deactivated"
            : "activated"
        } successfully.`
      );

      setMessageType("success");

      setShowStatusModal(false);
      setSelectedEmployee(null);

      // Refresh current list
      await fetchEmployees();

    } catch (error) {

      console.error(
        "Failed to change employee status:",
        error
      );

      setMessage(
        error.response?.data?.message ||
        "Failed to update employee status."
      );

      setMessageType("error");

    } finally {

      setActionLoading(false);

    }
  };


  /* =========================
     Close Modal
  ========================= */

  const closeModal = () => {

    if (actionLoading) {
      return;
    }

    setShowStatusModal(false);
    setSelectedEmployee(null);

  };


  const filteredEmployees = employees.filter((employee) => {

    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return true;
    }

    return (
      employee.name?.toLowerCase().includes(query) ||
      employee.email?.toLowerCase().includes(query) ||
      employee.role?.toLowerCase().includes(query)
    );
  });


  return (

    <div className="employees-page">

      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <section className="employees-hero">

        <div className="employees-hero-content">

          <div className="employees-title-block">

            <h2>
              Employees
            </h2>

            <p>
              Manage your organization's employees
            </p>

          </div>

          <button
            type="button"
            className="employees-add-button"
            onClick={() =>
              navigate("/admin/employees/create")
            }
          >
            <i className="bi bi-person-plus"></i>

            <span>
              Add Employee
            </span>
          </button>

        </div>

      </section>


      {/* Message */}

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


      {/* =================================================
          FILTERS + SEARCH
      ================================================= */}

      <div className="employees-controls">

        <div className="employee-tabs">

          <button
            type="button"
            className={
              activeTab === "active"
                ? "employee-tab active"
                : "employee-tab"
            }
            onClick={() =>
              handleTabChange("active")
            }
          >

            <i className="bi bi-person-check"></i>

            <span>
              Active Employees
            </span>

          </button>


          <button
            type="button"
            className={
              activeTab === "inactive"
                ? "employee-tab active"
                : "employee-tab"
            }
            onClick={() =>
              handleTabChange("inactive")
            }
          >

            <i className="bi bi-person-x"></i>

            <span>
              Inactive Employees
            </span>

          </button>

        </div>


        <div className="employees-search">

          <i className="bi bi-search"></i>

          <input
            type="search"
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
            placeholder="Search employees..."
            aria-label="Search employees"
          />

          {searchTerm && (
            <button
              type="button"
              className="employees-search-clear"
              onClick={() => setSearchTerm("")}
              aria-label="Clear search"
            >
              <i className="bi bi-x"></i>
            </button>
          )}

        </div>

      </div>


      {/* Employee Table */}

      <div className="employees-card">

        {filteredEmployees.length > 0 ? (

          <div className="table-responsive">

            <table className="table employees-table">

              <thead>

                <tr>

                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>

                </tr>

              </thead>


              <tbody>

                {filteredEmployees.map((employee) => (

                  <tr key={employee._id}>

                    <td>

                      <div className="employee-name">

                        <div className="employee-avatar">

                          {employee.name
                            ?.charAt(0)
                            ?.toUpperCase()}

                        </div>

                        <span>
                          {employee.name}
                        </span>

                      </div>

                    </td>


                    <td>
                      {employee.email}
                    </td>


                    <td>

                      <span className="role-badge">
                        {employee.role}
                      </span>

                    </td>


                    <td>

                      <span
                        className={
                          employee.isActive
                            ? "status-badge status-active"
                            : "status-badge status-inactive"
                        }
                      >

                        {employee.isActive
                          ? "Active"
                          : "Inactive"}

                      </span>

                    </td>


                    <td>

                      <div className="employee-actions">

                        {/* Edit Role */}

                        {employee.isActive && (

                          <button
                            className="action-btn edit-btn"
                            title="Edit Role"
                            onClick={() =>
                              navigate(
                                `/admin/employees/${employee._id}/edit`
                              )
                            }
                          >

                            <i className="bi bi-pencil"></i>

                          </button>

                        )}


                        {/* Activate / Deactivate */}

                        <button
                          className={
                            employee.isActive
                              ? "action-btn deactivate-btn"
                              : "action-btn activate-btn"
                          }
                          title={
                            employee.isActive
                              ? "Deactivate Employee"
                              : "Activate Employee"
                          }
                          onClick={() =>
                            handleStatusChange(employee)
                          }
                        >

                          <i
                            className={
                              employee.isActive
                                ? "bi bi-person-dash"
                                : "bi bi-person-check"
                            }
                          ></i>

                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        ) : (

          <div className="empty-state">

            <i
              className={
                activeTab === "active"
                  ? "bi bi-people"
                  : "bi bi-person-x"
              }
            ></i>

            <h5>

              {searchTerm
                ? "No employees found"
                : `No ${
                    activeTab === "active"
                      ? "active"
                      : "inactive"
                  } employees found`}

            </h5>

            <p>

              {searchTerm
                ? `No employees match "${searchTerm}".`
                : `There are currently no ${
                    activeTab === "active"
                      ? "active"
                      : "inactive"
                  } employees.`}

            </p>

          </div>

        )}

      </div>


      {/* Pagination */}

      {totalPages > 1 && (

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />

      )}


      {/* Loading */}

      {loading && (
        <Loading message="Loading employees..." />
      )}


      {/* Confirmation Modal */}

      {showStatusModal && selectedEmployee && (

        <div className="status-modal-overlay">

          <div className="status-modal">

            <div className="status-modal-icon">

              <i
                className={
                  activeTab === "active"
                    ? "bi bi-person-dash"
                    : "bi bi-person-check"
                }
              ></i>

            </div>


            <h4>

              {activeTab === "active"
                ? "Deactivate Employee?"
                : "Activate Employee?"}

            </h4>


            <p>

              Are you sure you want to{" "}

              <strong>

                {activeTab === "active"
                  ? "deactivate"
                  : "activate"}{" "}

                {selectedEmployee.name}

              </strong>

              ?

              {activeTab === "active" && (
                <>

                  <br />

                  <span>

                    This employee will no longer be able
                    to log in or receive new tasks.
                    Their existing task history will remain.

                  </span>

                </>
              )}

            </p>


            <div className="status-modal-actions">

              <button
                type="button"
                className="btn btn-secondary"
                onClick={closeModal}
                disabled={actionLoading}
              >
                Cancel
              </button>


              <button
                type="button"
                className={
                  activeTab === "active"
                    ? "btn btn-danger"
                    : "btn btn-success"
                }
                onClick={confirmStatusChange}
                disabled={actionLoading}
              >

                {actionLoading ? (

                  <>

                    <i className="bi bi-arrow-repeat spinning"></i>

                    {activeTab === "active"
                      ? "Deactivating..."
                      : "Activating..."}

                  </>

                ) : (

                  <>

                    <i
                      className={
                        activeTab === "active"
                          ? "bi bi-person-dash"
                          : "bi bi-person-check"
                      }
                    ></i>

                    {activeTab === "active"
                      ? "Deactivate"
                      : "Activate"}

                  </>

                )}

              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default Employees;