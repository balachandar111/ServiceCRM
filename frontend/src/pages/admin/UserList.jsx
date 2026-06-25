import React, { useEffect, useState } from "react";
import API from "../../services/api";
import CreateUser from "./CreateUser";
import EditUser from "./EditUser";
import "./UserList.css";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const UserList = () => {
  const role = localStorage.getItem("role");
  const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";

  const [users, setUsers] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [togglingId, setTogglingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  const fetchUsers = async () => {
    try {
      const { data } = await API.get("/users");
      setUsers(data.data || []);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await API.delete(`/users/${id}`);
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || "Delete failed");
    }
  };

  // Toggle between Active and Inactive — sends the values the model accepts
  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
    setTogglingId(id);
    try {
      await API.put(`/users/status/${id}`, { loginStatus: newStatus });
      // Optimistically update local state so UI reflects instantly
      setUsers((prev) =>
        prev.map((u) =>
          u._id === id ? { ...u, loginStatus: newStatus } : u
        )
      );
    } catch (error) {
      alert(error.response?.data?.message || "Status update failed");
    } finally {
      setTogglingId(null);
    }
  };

  const downloadExcel = () => {
    const exportData = filteredUsers.map((u) => ({
      Name: u.name,
      Username: u.username,
      Role: u.role,
      "Login Status": u.loginStatus,
      "Created At": u.createdAt
        ? new Date(u.createdAt).toLocaleDateString()
        : "",
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    saveAs(
      new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      "Users.xlsx"
    );
  };

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      (u.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.username || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(search.toLowerCase());

    const matchStatus = statusFilter ? u.loginStatus === statusFilter : true;

    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const indexOfLast = currentPage * usersPerPage;
  const indexOfFirst = indexOfLast - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirst, indexOfLast);

  return (
    <div className="user-page">
      <div className="user-header">
        <h2>User Management</h2>
      </div>

      {/* TOOLBAR */}
      <div className="user-toolbar">
        <input
          type="text"
          placeholder="Search by name, username or email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="search-box"
        />

        <button className="download-btn" onClick={downloadExcel}>
          Download Excel
        </button>

        <button className="create-btn" onClick={() => setShowCreate(true)}>
          + Create User
        </button>
      </div>

      {/* FILTERS */}
      <div className="user-filters">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>

        <button
          className="clear-btn"
          onClick={() => {
            setSearch("");
            setStatusFilter("");
            setCurrentPage(1);
          }}
        >
          Clear Filters
        </button>
      </div>

      {/* TABLE */}
      <div className="table-wrapper">
        <table className="crm-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Username</th>
              <th>Role</th>
              <th>Login Status</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {currentUsers.length > 0 ? (
              currentUsers.map((user, index) => (
                <tr key={user._id}>
                  <td>{indexOfFirst + index + 1}</td>
                  <td>{user.name || "—"}</td>
                  <td>{user.username || "—"}</td>
                  <td>{user.role || "—"}</td>

                  {/* LOGIN STATUS BADGE */}
                  <td>
                    <span
                      className={
                        user.loginStatus === "Active"
                          ? "active-badge"
                          : "inactive-badge"
                      }
                    >
                      {user.loginStatus || "Inactive"}
                    </span>
                  </td>

                  <td>
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "—"}
                  </td>

                  {/* ACTIONS */}
                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => {
                        setSelectedUser(user);
                        setShowEdit(true);
                      }}
                    >
                      Edit
                    </button>

                    {/* Toggle only visible to Admin / Super Admin */}
                    {isAdmin && (
                      <button
                        className="toggle-btn"
                        disabled={togglingId === user._id}
                        onClick={() => toggleStatus(user._id, user.loginStatus)}
                        style={{ opacity: togglingId === user._id ? 0.6 : 1 }}
                      >
                        {togglingId === user._id
                          ? "..."
                          : user.loginStatus === "Active"
                          ? "Deactivate"
                          : "Activate"}
                      </button>
                    )}

                    <button
                      className="delete-btn"
                      onClick={() => deleteUser(user._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: "30px" }}>
                  No Users Found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Previous
            </button>

            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                className={currentPage === index + 1 ? "active-page" : ""}
                onClick={() => setCurrentPage(index + 1)}
              >
                {index + 1}
              </button>
            ))}

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {showCreate && (
        <CreateUser
          refresh={fetchUsers}
          closeModal={() => setShowCreate(false)}
        />
      )}

      {showEdit && selectedUser && (
        <EditUser
          user={selectedUser}
          isAdmin={isAdmin}
          refresh={fetchUsers}
          closeModal={() => {
            setShowEdit(false);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
};

export default UserList;