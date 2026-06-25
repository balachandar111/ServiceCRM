import React, { useEffect, useState } from "react";
import API from "../../services/api";
import CalculatorModal from "./CalculatorModal";
import UserProfileModal from "../user/UserProfileModal";

import { FaUserCircle, FaEye } from "react-icons/fa";

import "../user/UserCustomers.css";

const AdminSmartCalculator = () => {
  const [records, setRecords] = useState([]);
  const [users, setUsers] = useState([]);
  const [userFilter, setUserFilter] = useState("");
  const [search, setSearch] = useState("");

  const [selected, setSelected] = useState(null);
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
    fetchUsers();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Admin / Super Admin receive every user's submissions here
      const { data } = await API.get("/smartcalculator/all");
      setRecords(data.data || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await API.get("/users");
      setUsers((data.data || []).filter((u) => u.role === "USER"));
    } catch (error) {
      console.log(error);
    }
  };

  const filteredRecords = records.filter((item) => {
    const userMatch = userFilter ? item.createdBy?._id === userFilter : true;

    const searchMatch =
      (item.companyName || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.orderNo || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.createdBy?.name || "")
        .toLowerCase()
        .includes(search.toLowerCase());

    return userMatch && searchMatch;
  });

  return (
    <div className="customers-page">
      <div className="page-header">
        <div>
          <h1>Smart Calculator — Admin</h1>
          <p>View every submission, or drill into one user's uploads</p>
        </div>
      </div>

      <div className="toolbar">
        <input
          type="text"
          placeholder="Search by company, order no, user..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-box"
        />
      </div>

      <div className="filters">
        <select
          value={userFilter}
          onChange={(e) => setUserFilter(e.target.value)}
        >
          <option value="">All Users</option>
          {users.map((u) => (
            <option key={u._id} value={u._id}>
              {u.name}
            </option>
          ))}
        </select>

      

        {(userFilter || search) && (
          <button
            className="clear-btn"
            onClick={() => {
              setUserFilter("");
              setSearch("");
            }}
          >
            Clear
          </button>
        )}
      </div>

      <div className="table-wrapper">
        <table className="crm-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Company</th>
              <th>Order No</th>
              <th>File</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: 30 }}>
                  Loading...
                </td>
              </tr>
            ) : filteredRecords.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: 30 }}>
                  No Records Found
                </td>
              </tr>
            ) : (
              filteredRecords.map((item) => (
                <tr key={item._id}>
                  <td>
                    {item.createdBy?.name ? (
                      <button
                        type="button"
                        className="link-btn"
                        onClick={() => setProfileUser(item.createdBy)}
                      >
                        {item.createdBy.name}
                      </button>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>{item.companyName || "—"}</td>
                  <td>{item.orderNo || "—"}</td>
                  <td>{item.fileName || "—"}</td>
                  <td>
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleDateString()
                      : "—"}
                  </td>
                  <td>
                    <button
                      className="view-btn"
                      onClick={() => setSelected(item)}
                    >
                      <FaEye /> View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <CalculatorModal data={selected} close={() => setSelected(null)} />
      )}

      {profileUser && (
        <UserProfileModal
          user={profileUser}
          close={() => setProfileUser(null)}
        />
      )}
    </div>
  );
};

export default AdminSmartCalculator;