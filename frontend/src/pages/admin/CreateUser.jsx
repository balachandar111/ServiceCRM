import React, { useState } from "react";
import API from "../../services/api";

const CreateUser = ({ refresh, closeModal }) => {
  const [form, setForm] = useState({
    name: "",
    username: "",
    password: "",
    role: "USER",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const saveUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/users", form);
      alert("User Created Successfully");
      refresh();
      closeModal();
    } catch (error) {
      alert(error.response?.data?.message || "Create Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Create User</h2>
          <button type="button" className="close-btn" onClick={closeModal}>
            ✕
          </button>
        </div>

        <form className="create-form" onSubmit={saveUser}>
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
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  required
                />
              </div>

              <div className="form-group">
                <label>Role</label>
                <select name="role" value={form.role} onChange={handleChange}>
                  <option value="USER">User</option>
                
                </select>
              </div>
            </div>
          </div>

          {/* Note: Login status defaults to Inactive.
              Only an Admin can activate the user after creation. */}
          <p
            style={{
              fontSize: "13px",
              color: "#64748b",
              marginBottom: "16px",
              padding: "0 4px",
            }}
          >
            ℹ️ New users are created as <strong>Inactive</strong> by default.
            An Admin must activate the account before the user can log in.
          </p>

          <button type="submit" className="save-btn" disabled={loading}>
            {loading ? "Creating..." : "Create User"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateUser;