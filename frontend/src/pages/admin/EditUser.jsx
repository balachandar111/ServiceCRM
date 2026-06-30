import React, { useState, useEffect } from "react";
import API from "../../services/api";

const EditUser = ({ user, isAdmin, refresh, closeModal }) => {
  const [form, setForm] = useState({
    name: "",
    username: "",
    role: "USER",
    loginStatus: "Inactive",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        username: user.username || "",
        role: user.role || "USER",
        loginStatus: user.loginStatus || "Inactive",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const updateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Build the update payload; non-admins cannot touch loginStatus
      const payload = {
        name: form.name,
        username: form.username,
        role: form.role,
      };

      if (isAdmin) {
        payload.loginStatus = form.loginStatus;
      }

      await API.put(`/users/${user._id}`, payload);
      alert("User Updated Successfully");
      refresh();
      closeModal();
    } catch (error) {
      alert(error.response?.data?.message || "Update Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Edit User</h2>
          <button type="button" className="close-btn" onClick={closeModal}>
            ✕
          </button>
        </div>

        <form className="create-form" onSubmit={updateUser}>
          <div className="form-section">
            <h3>Account Information</h3>

            <div className="form-grid">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div className="form-group">
                <label>Username</label>
                <input
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="Enter username"
                  required
                />
              </div>

              <div className="form-group">
                <label>Role</label>
                <select name="role" value={form.role} onChange={handleChange}>
                  <option value="USER">User</option>
                
                </select>
              </div>

              {/* Login Status — only Admin can change this */}
              {isAdmin ? (
                <div className="form-group">
                  <label>Login Status</label>
                  <select
                    name="loginStatus"
                    value={form.loginStatus}
                    onChange={handleChange}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              ) : (
                <div className="form-group">
                  <label>Login Status</label>
                  <input
                    value={form.loginStatus}
                    readOnly
                    disabled
                    style={{
                      background: "#f1f5f9",
                      color: "#64748b",
                      cursor: "not-allowed",
                    }}
                  />
                  <small style={{ color: "#94a3b8", fontSize: "12px" }}>
                    Only an Admin can change the login status.
                  </small>
                </div>
              )}
            </div>
          </div>

          <button type="submit" className="save-btn" disabled={loading}>
            {loading ? "Saving..." : "Update User"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditUser;