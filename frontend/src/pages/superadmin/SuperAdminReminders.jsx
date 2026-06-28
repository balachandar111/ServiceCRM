// SuperAdminReminders.jsx
// SuperAdmin — Follow-up Reminders across all admins and users.
// Scope:
//   • All Admins  → shows every customer's follow-up
//   • Selected Admin → shows all customers belonging to that admin + their users
//   • Selected User  → shows only that user's customers

import React, { useEffect, useState, useCallback, useMemo } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import API from "../../services/api";
import CustomerDetailsModal from "../user/CustomerDetailsModal";
import EditCustomerModal from "../user/EditCustomerModel";
import "../user/UserReminders.css";

const SA_CUSTOMERS_ENDPOINT = "/superadmin-dashboard/customers";

const formatDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const SuperAdminReminders = () => {
  // ── Data ──────────────────────────────────────────────────
  const [allCustomers, setAllCustomers] = useState([]);
  const [admins,       setAdmins]       = useState([]);
  const [allUsers,     setAllUsers]     = useState([]);
  const [loading,      setLoading]      = useState(false);

  // ── Scope filters ─────────────────────────────────────────
  const [selectedAdminId, setSelectedAdminId] = useState("ALL");
  const [selectedUserId,  setSelectedUserId]  = useState("ALL");

  // ── Calendar ──────────────────────────────────────────────
  const [selectedDate, setSelectedDate] = useState(new Date());

  // ── Detail modal ──────────────────────────────────────────
  const [viewCustomer, setViewCustomer] = useState(null);
  const [editCustomer, setEditCustomer] = useState(null);

  // ── Fetch ─────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [custRes, adminRes, userRes] = await Promise.all([
        API.get("/superadmin-dashboard/customers"),
        API.get("/admins/all-admins"),
        API.get("/users"),
      ]);
      setAllCustomers(custRes.data.data || []);
      setAdmins(adminRes.data.data || []);
      setAllUsers((userRes.data.data || []).filter((u) => u.role === "USER"));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Reset user filter when admin changes
  const handleAdminChange = (e) => {
    setSelectedAdminId(e.target.value);
    setSelectedUserId("ALL");
  };

  // ── Users visible under the selected admin ────────────────
  const usersUnderAdmin = useMemo(() => {
    if (selectedAdminId === "ALL") return allUsers;
    return allUsers.filter(
      (u) => u.createdBy?._id === selectedAdminId || u.createdBy === selectedAdminId
    );
  }, [selectedAdminId, allUsers]);

  // ── Scoped customers (admin → user drill-down) ─────────────
  const scopedCustomers = useMemo(() => {
    return allCustomers.filter((c) => {
      const createdById =
        typeof c.createdBy === "object"
          ? c.createdBy?._id?.toString()
          : c.createdBy?.toString();

      // Filter by user first (most specific)
      if (selectedUserId !== "ALL") return createdById === selectedUserId;

      // Filter by admin: include the admin's own customers + all their users' customers
      if (selectedAdminId !== "ALL") {
        const adminUserIds = usersUnderAdmin.map((u) => u._id?.toString());
        return createdById === selectedAdminId || adminUserIds.includes(createdById);
      }

      return true;
    });
  }, [allCustomers, selectedAdminId, selectedUserId, usersUnderAdmin]);

  // ── Calendar helpers ───────────────────────────────────────
  const today = new Date();

  const todayReminders = useMemo(
    () => scopedCustomers.filter((c) => c.followUpDate?.slice(0, 10) === formatDate(today)),
    [scopedCustomers]
  );

  const selectedDateCustomers = useMemo(
    () => scopedCustomers.filter((c) => c.followUpDate?.slice(0, 10) === formatDate(selectedDate)),
    [scopedCustomers, selectedDate]
  );

  const hasReminderOnDate = (date) =>
    scopedCustomers.some((c) => c.followUpDate?.slice(0, 10) === formatDate(date));

  // ── Scope label for UI ─────────────────────────────────────
  const scopeLabel = useMemo(() => {
    if (selectedUserId !== "ALL") {
      const u = allUsers.find((u) => u._id === selectedUserId);
      return `User: ${u?.name || "Selected User"}`;
    }
    if (selectedAdminId !== "ALL") {
      const a = admins.find((a) => a._id === selectedAdminId);
      return `Admin: ${a?.name || "Selected Admin"}`;
    }
    return "All Admins & Users";
  }, [selectedAdminId, selectedUserId, admins, allUsers]);

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="reminder-page">

      {/* Header */}
      <div className="reminder-header">
        <h1>Follow-Up Reminders</h1>
        <p>SuperAdmin — view reminders across all admins and users</p>
      </div>

      {/* Scope filters */}
      <div className="filters" style={{ marginBottom: 20, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>

        {/* Admin selector */}
        <select value={selectedAdminId} onChange={handleAdminChange}>
          <option value="ALL">All Admins</option>
          {admins.map((a) => (
            <option key={a._id} value={a._id}>{a.name}</option>
          ))}
        </select>

        {/* User selector — only visible once an admin is picked */}
        {selectedAdminId !== "ALL" && (
          <select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)}>
            <option value="ALL">All Users under this Admin</option>
            {usersUnderAdmin.map((u) => (
              <option key={u._id} value={u._id}>{u.name}</option>
            ))}
          </select>
        )}

        {/* Clear */}
        {(selectedAdminId !== "ALL" || selectedUserId !== "ALL") && (
          <button
            className="clear-btn"
            onClick={() => { setSelectedAdminId("ALL"); setSelectedUserId("ALL"); }}
          >
            Clear Filter
          </button>
        )}

        {/* Scope badge */}
        <span style={{
          marginLeft: "auto",
          background: "#eff6ff",
          color: "#2563eb",
          padding: "6px 14px",
          borderRadius: 20,
          fontSize: 13,
          fontWeight: 600,
        }}>
          📍 {scopeLabel}
        </span>
      </div>

      {/* Stats bar */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={statChip("#dbeafe", "#1d4ed8")}>
          📋 {scopedCustomers.length} total follow-ups
        </div>
        <div style={statChip("#fef9c3", "#92400e")}>
          🔔 {todayReminders.length} due today
        </div>
        <div style={statChip("#dcfce7", "#15803d")}>
          📅 {selectedDateCustomers.length} on {selectedDate.toLocaleDateString("en-IN")}
        </div>
      </div>

      {/* Today alert */}
      {todayReminders.length > 0 && (
        <div className="today-alert">
          🔔 {todayReminders.length} follow-up{todayReminders.length > 1 ? "s" : ""} due today
          {selectedAdminId !== "ALL" || selectedUserId !== "ALL"
            ? ` — ${scopeLabel}`
            : " across all admins and users"}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "#94a3b8", fontSize: 16 }}>
          Loading reminders…
        </div>
      ) : (
        <div className="reminder-grid">

          {/* Calendar */}
          <div className="calendar-card">
            <Calendar
              className="modern-calendar"
              value={selectedDate}
              onChange={setSelectedDate}
              tileClassName={({ date }) =>
                hasReminderOnDate(date) ? "highlight-date" : null
              }
            />

            {/* Mini legend */}
            <div style={{ marginTop: 14, fontSize: 12, color: "#6b7280", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 14, height: 14, borderRadius: "50%", background: "#2563eb", display: "inline-block" }} />
              Dates with follow-ups
            </div>
          </div>

          {/* Follow-up list */}
          <div className="followup-card">
            <div className="followup-header">
              <h2>Follow Ups</h2>
              <span className="date-badge">{selectedDate.toDateString()}</span>
            </div>

            {selectedDateCustomers.length === 0 ? (
              <div className="empty-state">No follow-ups on this date</div>
            ) : (
              selectedDateCustomers.map((customer) => {
                const ownerName =
                  typeof customer.createdBy === "object"
                    ? customer.createdBy?.name || customer.createdBy?.username
                    : null;

                return (
                  <div
                    key={customer._id}
                    className="customer-box"
                    onClick={() => setViewCustomer(customer)}
                  >
                    <div>
                      <h3>{customer.name}</h3>
                      <p style={{ margin: "4px 0", color: "#6b7280", fontSize: 13 }}>{customer.company || "—"}</p>
                      <small>{customer.phoneNumber}</small>

                      {/* Show owner context based on scope */}
                      {selectedUserId === "ALL" && ownerName && (
                        <small style={{ display: "block", color: "#2563eb", marginTop: 4, fontWeight: 600 }}>
                          👤 {ownerName}
                        </small>
                      )}

                      {/* Admin scope: show which admin this customer's user belongs to */}
                      {selectedAdminId === "ALL" && (() => {
                        const user = allUsers.find(
                          (u) => u._id?.toString() === (typeof customer.createdBy === "object" ? customer.createdBy?._id?.toString() : customer.createdBy?.toString())
                        );
                        const adminOfUser = user
                          ? admins.find((a) => a._id?.toString() === (typeof user.createdBy === "object" ? user.createdBy?._id?.toString() : user.createdBy?.toString()))
                          : null;
                        return adminOfUser ? (
                          <small style={{ display: "block", color: "#7c3aed", marginTop: 2, fontWeight: 600 }}>
                            🏢 {adminOfUser.name}
                          </small>
                        ) : null;
                      })()}

                      <small style={{ display: "block", color: "#94a3b8", marginTop: 4 }}>
                        Follow-up: {customer.followUpType || "—"}
                      </small>
                    </div>

                    <div className="right-box">
                      <span className="priority-pill">{customer.priority}</span>
                      <span className="stage-pill">{customer.leadStage}</span>
                      <span style={{
                        fontSize: 11,
                        padding: "4px 10px",
                        borderRadius: 20,
                        background: customer.leadStatus === "Closed" ? "#dcfce7" : "#fef3c7",
                        color: customer.leadStatus === "Closed" ? "#15803d" : "#92400e",
                        fontWeight: 600,
                      }}>
                        {customer.leadStatus}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Customer detail modal — view + update for superadmin */}
      {viewCustomer && (
        <CustomerDetailsModal
          customer={viewCustomer}
          closeModal={() => setViewCustomer(null)}
          onEdit={() => {
            setEditCustomer(viewCustomer);
            setViewCustomer(null);
          }}
        />
      )}

      {/* Update Customer modal */}
      {editCustomer && (
        <EditCustomerModal
          customer={editCustomer}
          apiEndpoint={SA_CUSTOMERS_ENDPOINT}
          refresh={fetchAll}
          closeModal={() => setEditCustomer(null)}
        />
      )}
    </div>
  );
};

// Helper for stat chips
const statChip = (bg, color) => ({
  background: bg,
  color,
  padding: "7px 16px",
  borderRadius: 20,
  fontSize: 13,
  fontWeight: 600,
});

export default SuperAdminReminders;