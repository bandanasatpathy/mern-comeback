import React, { useEffect, useState } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";

import { useAuth } from "../../context/AuthContext";
import Loading from "../../components/Loading";

import {
    getProfileUpdateRequests,
    updateProfileUpdateRequestStatus
} from "../../services/userService";

import "./ProfileRequests.css";


const ProfileRequests = () => {

    const { token } = useAuth();

    const [requests, setRequests] = useState([]);

    const [loading, setLoading] = useState(true);

    const [actionLoading, setActionLoading] = useState(false);

    const [message, setMessage] = useState("");

    const [messageType, setMessageType] = useState("");

    const [showModal, setShowModal] = useState(false);

    const [selectedRequest, setSelectedRequest] = useState(null);

    const [selectedAction, setSelectedAction] = useState("");


    // ========================================
    // FETCH REQUESTS
    // ========================================

    const fetchRequests = async (clearMessage = true) => {

        if (clearMessage) {
            setMessage("");
            setMessageType("");
        }

        try {

            setLoading(true);

            const response =
                await getProfileUpdateRequests(token);

            setRequests(response.data || []);

        } catch (error) {

            console.error(
                "Failed to fetch profile update requests:",
                error
            );

            setMessage(
                error.message ||
                "Failed to load profile update requests."
            );

            setMessageType("error");

        } finally {

            setLoading(false);

        }
    };


    // ========================================
    // INITIAL LOAD
    // ========================================

    useEffect(() => {

        if (token) {
            fetchRequests();
        }

    }, [token]);


    // ========================================
    // OPEN MODAL
    // ========================================

    const openModal = (request, action) => {

        setSelectedRequest(request);

        setSelectedAction(action);

        setShowModal(true);

    };


    // ========================================
    // CLOSE MODAL
    // ========================================

    const closeModal = () => {

        if (actionLoading) {
            return;
        }

        setShowModal(false);

        setSelectedRequest(null);

        setSelectedAction("");

    };


    // ========================================
    // CONFIRM APPROVE / REJECT
    // ========================================

    const confirmAction = async () => {

        if (!selectedRequest || !selectedAction) {
            return;
        }

        setActionLoading(true);

        try {

            const response =
                await updateProfileUpdateRequestStatus(
                    selectedRequest._id,
                    selectedAction,
                    token
                );


            // Close modal
            setShowModal(false);

            setSelectedRequest(null);

            setSelectedAction("");


            // Refresh pending requests
            await fetchRequests(false);


            // Show backend response
            setMessage(
                response.message ||
                (
                    selectedAction === "approved"
                        ? "Profile update request approved successfully."
                        : "Profile update request rejected successfully."
                )
            );

            setMessageType("success");

        } catch (error) {

            console.error(
                "Failed to update profile request:",
                error
            );

            setMessage(
                error.message ||
                "Failed to update profile request."
            );

            setMessageType("error");

        } finally {

            setActionLoading(false);

        }
    };


    return (

        <div className="profile-requests-page">


            {/* ========================================
          HEADER
      ======================================== */}

            <div className="profile-requests-header">

                <div>

                    <div className="profile-requests-title-row">

                        <div className="profile-requests-title-icon">

                            <i className="bi bi-person-lines-fill"></i>

                        </div>

                        <div>

                            <h2>
                                Profile Requests
                            </h2>

                            <p>
                                Review employee name correction requests.
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
                            ? "profile-request-alert success"
                            : "profile-request-alert error"
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


            {/* ========================================
          REQUEST TABLE
      ======================================== */}

            <div className="profile-requests-card">

                {requests.length > 0 ? (

                    <div className="table-responsive">

                        <table className="table profile-requests-table">

                            <thead>

                                <tr>

                                    <th>
                                        Employee
                                    </th>

                                    <th>
                                        Current Name
                                    </th>

                                    <th>
                                        Requested Name
                                    </th>

                                    <th>
                                        Reason
                                    </th>

                                    <th>
                                        Requested On
                                    </th>

                                    <th>
                                        Actions
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {requests.map((request) => (

                                    <tr key={request._id}>

                                        {/* Employee */}

                                        <td>

                                            <div className="request-employee">

                                                <div className="request-avatar">
                                                    {request.name
                                                        ?.charAt(0)
                                                        ?.toUpperCase() || "U"}
                                                </div>

                                                <div className="request-employee-info">

                                                    <strong>
                                                        {request.name || "-"}
                                                    </strong>

                                                    <span>
                                                        {request.email || "-"}
                                                    </span>

                                                </div>

                                            </div>

                                        </td>


                                        {/* Current Name */}

                                        <td>
                                            {request.name || "-"}
                                        </td>


                                        {/* Requested Name */}

                                        <td>

                                            <div className="requested-name">

                                                <i className="bi bi-arrow-right"></i>

                                                <strong>
                                                    {
                                                        request.profileUpdateRequest
                                                            ?.requestedName || "-"
                                                    }
                                                </strong>

                                            </div>

                                        </td>


                                        {/* Reason */}

                                        <td>

                                            <div className="request-reason">

                                                {
                                                    request.profileUpdateRequest
                                                        ?.reason || "-"
                                                }

                                            </div>

                                        </td>


                                        {/* Date */}

                                        <td>

                                            {
                                                request.profileUpdateRequest
                                                    ?.requestedAt
                                                    ? new Date(
                                                        request.profileUpdateRequest.requestedAt
                                                    ).toLocaleDateString()
                                                    : "-"
                                            }

                                        </td>


                                        {/* Actions */}

                                        <td>

                                            <div className="request-actions">

                                                <button
                                                    type="button"
                                                    className="btn btn-success btn-sm"
                                                    onClick={() =>
                                                        openModal(
                                                            request,
                                                            "approved"
                                                        )
                                                    }
                                                    disabled={actionLoading}
                                                >

                                                    <i className="bi bi-check-lg"></i>

                                                    Approve

                                                </button>


                                                <button
                                                    type="button"
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() =>
                                                        openModal(
                                                            request,
                                                            "rejected"
                                                        )
                                                    }
                                                    disabled={actionLoading}
                                                >

                                                    <i className="bi bi-x-lg"></i>

                                                    Reject

                                                </button>

                                            </div>

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                ) : (

                    <div className="profile-request-empty">

                        <div className="profile-request-empty-icon">

                            <i className="bi bi-person-check"></i>

                        </div>

                        <h4>
                            No Pending Requests
                        </h4>

                        <p>
                            There are currently no profile update requests
                            waiting for approval.
                        </p>

                    </div>

                )}

            </div>


            {/* ========================================
          LOADING
      ======================================== */}

            {loading && (

                <Loading
                    message="Loading profile requests..."
                />

            )}


            {/* ========================================
          CONFIRMATION MODAL
      ======================================== */}

            {showModal && selectedRequest && (

                <div className="profile-request-modal-overlay">

                    <div className="profile-request-modal">

                        <div
                            className={
                                selectedAction === "approved"
                                    ? "profile-request-modal-icon approve"
                                    : "profile-request-modal-icon reject"
                            }
                        >

                            <i
                                className={
                                    selectedAction === "approved"
                                        ? "bi bi-check-lg"
                                        : "bi bi-x-lg"
                                }
                            ></i>

                        </div>


                        <h4>

                            {selectedAction === "approved"
                                ? "Approve Profile Request?"
                                : "Reject Profile Request?"}

                        </h4>


                        <p>

                            {selectedAction === "approved" ? (

                                <>
                                    Approving this request will update the
                                    employee's name to{" "}

                                    <strong>
                                        {
                                            selectedRequest
                                                .profileUpdateRequest
                                                ?.requestedName
                                        }
                                    </strong>

                                    {" "}and mark the request as approved.
                                </>

                            ) : (

                                <>
                                    Are you sure you want to reject the
                                    profile update request from{" "}

                                    <strong>
                                        {selectedRequest.name}
                                    </strong>
                                    ?
                                </>

                            )}

                        </p>


                        <div className="profile-request-modal-actions">

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
                                    selectedAction === "approved"
                                        ? "btn btn-success"
                                        : "btn btn-danger"
                                }
                                onClick={confirmAction}
                                disabled={actionLoading}
                            >

                                {actionLoading ? (

                                    <>
                                        <i className="bi bi-arrow-repeat spinning"></i>

                                        {selectedAction === "approved"
                                            ? "Approving..."
                                            : "Rejecting..."}
                                    </>

                                ) : (

                                    <>
                                        <i
                                            className={
                                                selectedAction === "approved"
                                                    ? "bi bi-check-lg"
                                                    : "bi bi-x-lg"
                                            }
                                        ></i>

                                        {selectedAction === "approved"
                                            ? "Approve"
                                            : "Reject"}
                                    </>

                                )}

                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>

    );

};


export default ProfileRequests;