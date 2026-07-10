import React, { useState, useEffect } from "react";
import StatusBadge from "./StatusBadge";
import "./ReportCard.css";

const ReportCard = ({ report, isAuthority = false, onUpdate, onDelete, onView }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [realLocation, setRealLocation] = useState(report.locationName || "");

  const {
    id,
    category,
    categoryLabel,
    description,
    locationName,
    latitude,
    longitude,
    mediaFiles,
    status,
    createdAt,
  } = report;

  const formattedDate = new Date(createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Reverse Geocoding (Lat/Lng → Address)
  useEffect(() => {
    if (!locationName && latitude && longitude) {
      fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.display_name) {
            setRealLocation(data.display_name);
          }
        })
        .catch((err) => console.error("Location fetch error:", err));
    }
  }, [latitude, longitude, locationName]);

  const openImage = (imgData) => {
    setSelectedImage(imgData);
    setShowModal(true);
  };

  const violationClass = (categoryLabel || category || "other")
    .toLowerCase()
    .replace(/\s+/g, "-");

  return (
    <>
      <div className={`report-card card-${violationClass}`}>
        <div className="report-header">
          <h3 className="report-title">
            {categoryLabel || category?.replace(/-/g, " ").toUpperCase()}
          </h3>
          <StatusBadge status={status} />
        </div>

        {/* Media Evidence */}
        {mediaFiles && mediaFiles.length > 0 && (
          <div className="report-media">
            {mediaFiles.map((file, index) => (
              <div
                key={index}
                className="media-thumb"
                onClick={() => file.type.startsWith("image/") && openImage(file.data)}
                style={{ cursor: file.type.startsWith("image/") ? "pointer" : "default" }}
              >
                {file.type.startsWith("image/") ? (
                  <img src={file.data} alt="evidence" />
                ) : (
                  <div className="video-thumb">
                    🎬 <br /> Video
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="report-body">
          <p className="report-description">{description}</p>

          <div className="report-details">
            {report.violation_id_string && (
              <div className="detail-item">
                <span className="detail-label">Violation ID:</span>
                <span className="detail-value" style={{ fontFamily: 'monospace' }}>{report.violation_id_string}</span>
              </div>
            )}

            {/* Location Title/Address */}
            <div className="detail-item">
              <span className="detail-label">📍 Location:</span>
              <span className="detail-value">{realLocation || locationName || "Pinned on Map"}</span>
            </div>

            {/* Coordinates */}
            {latitude && longitude && (
              <div className="detail-item">
                <span className="detail-label">🌐 Coordinates:</span>
                <span className="detail-value">
                  {latitude.toFixed(4)}, {longitude.toFixed(4)}
                </span>
              </div>
            )}

            {/* View on Map */}
            {latitude && longitude && (
              <div className="detail-item">
                <span className="detail-label">🗺 Map:</span>
                <span className="detail-value">
                  <a
                    href={`https://www.google.com/maps?q=${latitude},${longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View on Map
                  </a>
                </span>
              </div>
            )}

            <div className="detail-item">
              <span className="detail-label">📅 Reported:</span>
              <span className="detail-value">{formattedDate}</span>
            </div>

            {mediaFiles && mediaFiles.length > 0 && (
              <div className="detail-item">
                <span className="detail-label">📎 Evidence:</span>
                <span className="detail-value">
                  {mediaFiles.length} file(s) attached
                </span>
              </div>
            )}

            {report.linked_count > 0 && (
              <div className="detail-item" style={{ background: 'rgba(255, 193, 7, 0.15)', padding: '10px', borderRadius: '6px', borderLeft: '4px solid #ffc107', marginTop: '12px', display: 'block' }}>
                <div style={{ color: '#856404', fontWeight: '700', fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span>🔗 Duplicate Grouping</span>
                  <span>{report.linked_count + 1} Reports</span>
                </div>
                <div style={{ fontSize: '0.8rem', marginTop: '6px', color: '#666', lineHeight: '1.4', wordBreak: 'break-all' }}>
                  <strong>Linked Violation IDs:</strong> <br />
                  {[report.violation_id_string, report.linked_ids].filter(Boolean).join(', ')}
                </div>
              </div>
            )}
          </div>
        </div>

        {isAuthority && (
          <div className="report-actions">
            <select
              value={status}
              onChange={(e) => onUpdate(report.complaint_id || id, e.target.value)}
              className="status-select"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="resolved">Resolved</option>
            </select>

            <button
              onClick={() => onDelete && onDelete(report.complaint_id || id)}
              className="btn-delete"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Image Modal */}
      {showModal && selectedImage && (
        <div className="image-modal" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setShowModal(false)}
            >
              ✕
            </button>
            <img src={selectedImage} alt="Full size evidence" />
          </div>
        </div>
      )}
    </>
  );
};

export default ReportCard;
