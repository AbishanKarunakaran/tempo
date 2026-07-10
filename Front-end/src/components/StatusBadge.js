import React from "react";
import "./StatusBadge.css";

const StatusBadge = ({ status }) => {
  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "not viewed":
        return "status-not-viewed";
      case "in progress":
        return "status-in-progress";
      case "pending":
        return "status-pending";
      case "approved":
        return "status-approved";
      case "rejected":
        return "status-rejected";
      case "resolved":
        return "status-resolved";
      default:
        return "status-default";
    }
  };

  return (
    <span className={`status-badge ${getStatusClass(status)}`}>
      {status || "Unknown"}
    </span>
  );
};

export default StatusBadge;
