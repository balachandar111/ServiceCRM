import React, { useState, useEffect } from "react";
import API from "../../services/api";
import "./SmartCalculator.css";

const SmartCalculator = () => {
  const [form, setForm] = useState({ companyName: "", orderNo: "" });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Get logged-in user info from localStorage (set on login)
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const submitData = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Please select a file to upload.");
      return;
    }

    try {
      setUploading(true);

      const fd = new FormData();
      fd.append("companyName", form.companyName);
      fd.append("orderNo", form.orderNo);
      fd.append("file", file);
      // userId is derived on the backend from req.user.id (JWT token)
      // No need to send it manually — the protect middleware handles it.

      const res = await API.post("/smartcalculator/create", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert(res.data.message || "Uploaded Successfully");
      setForm({ companyName: "", orderNo: "" });
      setFile(null);
      // Reset file input
      const fileInput = document.getElementById("sc-file-input");
      if (fileInput) fileInput.value = "";
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Upload Failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="card">
      <h2>Smart Calculator</h2>

      {user && (
        <p style={{ color: "#64748b", fontSize: 13, marginBottom: 16 }}>
          Uploading as: <strong>{user.name}</strong>
        </p>
      )}

      <form onSubmit={submitData}>
        <div className="form-group">
          <label>Company Name</label>
          <input
            type="text"
            value={form.companyName}
            onChange={(e) => setForm({ ...form, companyName: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label>Order Number</label>
          <input
            type="text"
            value={form.orderNo}
            onChange={(e) => setForm({ ...form, orderNo: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label>Upload PNG / PDF</label>
          <input
            id="sc-file-input"
            type="file"
            accept=".png,.pdf"
            onChange={(e) => setFile(e.target.files[0])}
            required
          />
        </div>

        {file && (
          <div className="file-preview">Selected File: {file.name}</div>
        )}

        <button type="submit" className="upload-btn" disabled={uploading}>
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </form>
    </div>
  );
};

export default SmartCalculator;