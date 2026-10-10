import React from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./Loading.css";

function Loading({ message = "Please wait..." }) {
  return (
    <div className="loading-overlay">
      <div className="loading-box">
        <div className="loading-spinner">
          <i className="bi bi-arrow-repeat"></i>
        </div>

        <p>{message}</p>
      </div>
    </div>
  );
}

export default Loading;