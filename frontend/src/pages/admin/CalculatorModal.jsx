import React from "react";
import "./CalculatorModal.css";

const CalculatorModal = ({ data, close }) => {
  if (!data) return null;

  const owner = data.createdBy || {};

  return (
    <div className="modal-overlay" onClick={close}>
      <div
        className="modal-container calculator-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>Calculator Details</h2>
          <button className="close-btn" onClick={close}>
            ✕
          </button>
        </div>

        <div className="calculator-modal-body">
          <p>
            <strong>User :</strong> {owner.name || "—"}
          </p>

          <p>
            <strong>Username :</strong> {owner.username || "—"}
          </p>

          <p>
            <strong>Company :</strong> {data.companyName || "—"}
          </p>

          <p>
            <strong>Order No :</strong> {data.orderNo || "—"}
          </p>

          <p>
            <strong>File Name :</strong> {data.fileName || "—"}
          </p>

          <p>
            <strong>Date :</strong>{" "}
            {data.createdAt
              ? new Date(data.createdAt).toLocaleDateString()
              : "—"}
          </p>

          {data.fileUrl && (
            <div className="calculator-file-preview">
              {data.fileUrl.toLowerCase().includes(".pdf") ? (
                <a href={data.fileUrl} target="_blank" rel="noreferrer">
                  View PDF
                </a>
              ) : (
                <img src={data.fileUrl} alt={data.fileName || "calculator"} />
              )}
            </div>
          )}
        </div>

        <button className="save-btn" onClick={close}>
          Close
        </button>
      </div>
    </div>
  );
};

export default CalculatorModal;