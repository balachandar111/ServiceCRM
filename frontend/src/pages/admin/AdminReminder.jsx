import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

import API from "../../services/api";
import EditCustomerModal from "../user/EditCustomerModel";

import "../user/UserReminders.css";
import "../user/UserCustomers.css";

const AdminReminders = () => {
  const [customers, setCustomers] = useState([]);
  const [users, setUsers] = useState([]);
  const [userFilter, setUserFilter] = useState("");

  const [selectedDate, setSelectedDate] = useState(new Date());

  const [showCustomerPopup, setShowCustomerPopup] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [customerForm, setCustomerForm] = useState({});

  useEffect(() => {
    fetchCustomers();
    fetchUsers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const { data } = await API.get("/customers");
      setCustomers(data.data || []);
    } catch (error) {
      console.log(error);
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

  const deleteCustomer = async (id) => {
    if (!window.confirm("Delete Customer?")) return;
    try {
      await API.delete(`/customers/${id}`);
      fetchCustomers();
      setShowCustomerPopup(false);
    } catch (error) {
      console.log(error);
    }
  };

  const formatDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  // Filter customers by selected user
  const scopedCustomers = customers.filter((customer) =>
    userFilter ? customer.createdBy?._id === userFilter : true
  );

  const selectedCustomers = scopedCustomers.filter(
    (customer) =>
      customer.followUpDate?.slice(0, 10) === formatDate(selectedDate)
  );

  const today = new Date();
  const todayReminders = scopedCustomers.filter(
    (customer) => customer.followUpDate?.slice(0, 10) === formatDate(today)
  );

  return (
    <div className="reminder-page">
      <div className="reminder-header">
        <h1>Follow Up Reminders — Admin</h1>
        <p>View follow-ups across all users, or drill into one user</p>
      </div>

      {/* USER FILTER */}
      <div className="filters" style={{ marginBottom: "20px" }}>
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

        {userFilter && (
          <button className="clear-btn" onClick={() => setUserFilter("")}>
            Clear Filter
          </button>
        )}
      </div>

      {todayReminders.length > 0 && (
        <div className="today-alert">
          🔔 {todayReminders.length} follow-up
          {todayReminders.length > 1 ? "s" : ""} today
          {userFilter
            ? ` for ${users.find((u) => u._id === userFilter)?.name || ""}`
            : " across all users"}
        </div>
      )}

      <div className="reminder-grid">
        {/* CALENDAR */}
        <div className="calendar-card">
          <Calendar
            className="modern-calendar"
            value={selectedDate}
            onChange={setSelectedDate}
            tileClassName={({ date }) => {
              const formatted = formatDate(date);
              const hasReminder = scopedCustomers.some(
                (customer) =>
                  customer.followUpDate?.slice(0, 10) === formatted
              );
              return hasReminder ? "highlight-date" : null;
            }}
          />
        </div>

        {/* FOLLOWUPS */}
        <div className="followup-card">
          <div className="followup-header">
            <h2>Follow Ups</h2>
            <span className="date-badge">{selectedDate.toDateString()}</span>
          </div>

          {selectedCustomers.length === 0 ? (
            <div className="empty-state">No Follow Ups</div>
          ) : (
            selectedCustomers.map((customer) => (
              <div
                key={customer._id}
                className="customer-box"
                onClick={() => {
                  setCustomerForm(customer);
                  setShowCustomerPopup(true);
                }}
              >
                <div>
                  <h3>{customer.name}</h3>
                  <p>{customer.company}</p>
                  <small>{customer.phoneNumber}</small>
                  {!userFilter && customer.createdBy?.name && (
                    <small style={{ display: "block", color: "#2563eb" }}>
                      Owner: {customer.createdBy.name}
                    </small>
                  )}
                </div>

                <div className="right-box">
                  <span className="priority-pill">{customer.priority}</span>
                  <span className="stage-pill">{customer.leadStage}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showCustomerPopup && customerForm && (
        <div className="popup-overlay">
          <div className="customer-popup">
            <div className="popup-header">
              <h2>Customer Details</h2>
              <button
                className="close-btn2"
                onClick={() => setShowCustomerPopup(false)}
              >
                ✕
              </button>
            </div>

            <div className="popup-content">
              <div className="detail-grid">
                <div>
                  <label>Name</label>
                  <p>{customerForm.name}</p>
                </div>

                <div>
                  <label>Company</label>
                  <p>{customerForm.company}</p>
                </div>

                <div>
                  <label>Phone</label>
                  <p>{customerForm.phoneNumber}</p>
                </div>

                <div>
                  <label>Email</label>
                  <p>{customerForm.email}</p>
                </div>

                <div>
                  <label>Lead Status</label>
                  <p>{customerForm.leadStatus}</p>
                </div>

                <div>
                  <label>Lead Stage</label>
                  <p>{customerForm.leadStage}</p>
                </div>

                <div>
                  <label>Priority</label>
                  <p>{customerForm.priority}</p>
                </div>

                <div>
                  <label>Follow Up Date</label>
                  <p>
                    {customerForm.followUpDate
                      ? (() => {
                          const [y, m, d] = customerForm.followUpDate.slice(0, 10).split("-");
                          return `${d}/${m}/${y}`;
                        })()
                      : "-"}
                  </p>
                </div>

                <div>
                  <label>Assigned To</label>
                  <p>{customerForm.assignedTo || "—"}</p>
                </div>

                <div>
                  <label>Owner</label>
                  <p>{customerForm.createdBy?.name || "—"}</p>
                </div>
              </div>

              <div className="remarks-box">
                <label>Remarks</label>
                <p>{customerForm.remark}</p>
              </div>

              <div className="popup-actions">
                <button
                  className="edit-btn2"
                  onClick={() => {
                    setShowCustomerPopup(false);
                    setEditMode(true);
                  }}
                >
                  Update Customer
                </button>

                <button
                  className="delete-btn2"
                  onClick={() => deleteCustomer(customerForm._id)}
                >
                  Delete Customer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editMode && (
        <EditCustomerModal
          customer={customerForm}
          refresh={fetchCustomers}
          closeModal={() => setEditMode(false)}
        />
      )}
    </div>
  );
};

export default AdminReminders;