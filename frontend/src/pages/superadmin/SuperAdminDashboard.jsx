// SuperAdminDashboard.jsx
// Full SuperAdmin Dashboard with:
//   - Global stats (all admins, users, customers)
//   - Admin selector dropdown → loads that admin's dashboard
//   - User selector dropdown  → loads that user's dashboard
//   - Charts (Lead Stage, Priority, Source, Monthly Trend)
//   - Admin Progress table with "View Dashboard" buttons
//   - User Progress table with "View Dashboard" buttons

import React, { useEffect, useState, useCallback } from "react";
import API from "../../services/api";
import {
  FaBuilding, FaUserTie, FaUsers, FaPhone, FaMoneyBill,
  FaChartLine, FaCheckCircle, FaBell, FaUserPlus, FaUserFriends,
  FaEye, FaArrowLeft, FaFilter,
} from "react-icons/fa";
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line,
} from "recharts";
import "./SuperAdminDashboard.css";

const COLORS = ["#2563EB", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4"];

// ─────────────────────────────────────────────────────────
// STAT CARD (reusable)
// ─────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, accent }) => (
  <div className="sad-stat-card" style={{ borderTop: `3px solid ${accent || "#2563EB"}` }}>
    <div className="sad-stat-icon" style={{ color: accent || "#2563EB" }}>
      <Icon />
    </div>
    <div className="sad-stat-body">
      <p className="sad-stat-label">{label}</p>
      <h2 className="sad-stat-value">{value ?? "—"}</h2>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────
// CHARTS SECTION (reusable)
// ─────────────────────────────────────────────────────────
const DashboardCharts = ({ data }) => (
  <div className="sad-charts-grid">
    {/* Lead Stage Pie */}
    <div className="sad-chart-card">
      <h3>Lead Stage</h3>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie data={data.leadStageData} dataKey="value" outerRadius={90} label>
            {(data.leadStageData || []).map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>

    {/* Priority Bar */}
    <div className="sad-chart-card">
      <h3>Priority</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data.priorityData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#2563EB" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>

    {/* Lead Source Pie */}
    <div className="sad-chart-card">
      <h3>Lead Source</h3>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie data={data.sourceData} dataKey="value" outerRadius={90} label>
            {(data.sourceData || []).map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>

    {/* Monthly Trend Line */}
    <div className="sad-chart-card">
      <h3>Monthly Trend</h3>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data.monthlyTrendData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="customers" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────
const SuperAdminDashboard = () => {
  // ── view mode: "overview" | "admin" | "user"
  const [viewMode, setViewMode] = useState("overview");

  // ── data states
  const [overviewData, setOverviewData]   = useState(null);
  const [adminData, setAdminData]         = useState(null);
  const [userData, setUserData]           = useState(null);
  const [adminsList, setAdminsList]       = useState([]);
  const [usersUnderAdmin, setUsersUnderAdmin] = useState([]);

  // ── selected ids (dropdowns)
  const [selectedAdminId, setSelectedAdminId] = useState("");
  const [selectedUserId, setSelectedUserId]   = useState("");

  // ── loading
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [loadingAdmin, setLoadingAdmin]       = useState(false);
  const [loadingUser, setLoadingUser]         = useState(false);

  // ─────────────────────────────────────────────
  // FETCH: global overview
  // ─────────────────────────────────────────────
  const fetchOverview = useCallback(async () => {
    setLoadingOverview(true);
    try {
      const { data } = await API.get("/superadmin-dashboard/overview");
      setOverviewData(data.data);
    } catch (err) {
      console.error("fetchOverview", err);
    } finally {
      setLoadingOverview(false);
    }
  }, []);

  // ─────────────────────────────────────────────
  // FETCH: lightweight admins list for dropdown
  // ─────────────────────────────────────────────
  const fetchAdminsList = useCallback(async () => {
    try {
      const { data } = await API.get("/superadmin-dashboard/admins");
      setAdminsList(data.data || []);
    } catch (err) {
      console.error("fetchAdminsList", err);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
    fetchAdminsList();
  }, [fetchOverview, fetchAdminsList]);

  // ─────────────────────────────────────────────
  // FETCH: admin dashboard when admin selected
  // ─────────────────────────────────────────────
  const loadAdminDashboard = async (adminId) => {
    if (!adminId) return;
    setLoadingAdmin(true);
    setAdminData(null);
    setUserData(null);
    setSelectedUserId("");
    try {
      const [dashRes, usersRes] = await Promise.all([
        API.get(`/superadmin-dashboard/admin/${adminId}`),
        API.get(`/superadmin-dashboard/admin/${adminId}/users`),
      ]);
      setAdminData(dashRes.data.data);
      setUsersUnderAdmin(usersRes.data.data || []);
      setViewMode("admin");
    } catch (err) {
      console.error("loadAdminDashboard", err);
    } finally {
      setLoadingAdmin(false);
    }
  };

  // ─────────────────────────────────────────────
  // FETCH: user dashboard when user selected
  // ─────────────────────────────────────────────
  const loadUserDashboard = async (userId) => {
    if (!userId) return;
    setLoadingUser(true);
    setUserData(null);
    try {
      const { data } = await API.get(`/superadmin-dashboard/user/${userId}`);
      setUserData(data.data);
      setViewMode("user");
    } catch (err) {
      console.error("loadUserDashboard", err);
    } finally {
      setLoadingUser(false);
    }
  };

  // ─────────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────────
  const handleAdminChange = (e) => {
    const id = e.target.value;
    setSelectedAdminId(id);
    if (id) {
      loadAdminDashboard(id);
    } else {
      setViewMode("overview");
      setAdminData(null);
      setUserData(null);
      setUsersUnderAdmin([]);
      setSelectedUserId("");
    }
  };

  const handleUserChange = (e) => {
    const id = e.target.value;
    setSelectedUserId(id);
    if (id) {
      loadUserDashboard(id);
    } else {
      // back to admin view
      setViewMode("admin");
      setUserData(null);
    }
  };

  const handleBackToOverview = () => {
    setViewMode("overview");
    setSelectedAdminId("");
    setSelectedUserId("");
    setAdminData(null);
    setUserData(null);
    setUsersUnderAdmin([]);
  };

  const handleBackToAdmin = () => {
    setViewMode("admin");
    setSelectedUserId("");
    setUserData(null);
  };

  // ─────────────────────────────────────────────
  // QUICK JUMP from Admin Progress table
  // ─────────────────────────────────────────────
  const jumpToAdminDashboard = (adminId) => {
    setSelectedAdminId(adminId);
    loadAdminDashboard(adminId);
  };

  // ─────────────────────────────────────────────
  // QUICK JUMP from User Progress table
  // ─────────────────────────────────────────────
  const jumpToUserDashboard = (userId) => {
    setSelectedUserId(userId);
    loadUserDashboard(userId);
  };

  // ─────────────────────────────────────────────
  // RENDER HELPERS
  // ─────────────────────────────────────────────


  const renderFilters = () => (
    <div className="sad-filters">
      <FaFilter className="sad-filter-icon" />

      {/* Admin Selector */}
      <div className="sad-filter-group">
        <label>Select Admin</label>
        <select value={selectedAdminId} onChange={handleAdminChange}>
          <option value="">All Admins (Overview)</option>
          {adminsList.map(a => (
            <option key={a._id} value={a._id}>
              {a.name} {a.organization?.orgName ? `— ${a.organization.orgName}` : ""}
            </option>
          ))}
        </select>
      </div>

      {/* User Selector – shown only when an admin is selected */}
      {selectedAdminId && (
        <div className="sad-filter-group">
          <label>Select User</label>
          <select value={selectedUserId} onChange={handleUserChange} disabled={loadingAdmin}>
            <option value="">All Users (Admin View)</option>
            {usersUnderAdmin.map(u => (
              <option key={u._id} value={u._id}>{u.name} ({u.username})</option>
            ))}
          </select>
        </div>
      )}

      {/* Back buttons */}
      {viewMode !== "overview" && (
        <button className="sad-back-btn" onClick={handleBackToOverview}>
          <FaArrowLeft /> Overview
        </button>
      )}
      {viewMode === "user" && (
        <button className="sad-back-btn sad-back-admin" onClick={handleBackToAdmin}>
          <FaArrowLeft /> {adminData?.admin?.name || "Admin"} View
        </button>
      )}
    </div>
  );

  // ─────────────────────────────────────────────
  // OVERVIEW SECTION
  // ─────────────────────────────────────────────
  const renderOverview = () => {
    if (loadingOverview) return <div className="sad-loader">Loading overview…</div>;
    if (!overviewData)   return null;
    const d = overviewData;

    return (
      <>
        {/* Global KPIs */}
        <div className="sad-section-title">🌐 Global Overview</div>
        <div className="sad-stats-grid">
          <StatCard icon={FaBuilding}     label="Total Admins"        value={d.totalAdmins}       accent="#7c3aed" />
          <StatCard icon={FaUsers}        label="Total Users"         value={d.totalUsers}         accent="#2563EB" />
          <StatCard icon={FaChartLine}    label="Total Customers"     value={d.totalCustomers}     accent="#0891b2" />
          <StatCard icon={FaCheckCircle}  label="Active Leads"        value={d.activeLeads}        accent="#10B981" />
          <StatCard icon={FaCheckCircle}  label="Closed Leads"        value={d.closedLeads}        accent="#F59E0B" />
          <StatCard icon={FaChartLine}    label="Quotation Shared"    value={d.quotationShared}    accent="#8B5CF6" />
          <StatCard icon={FaPhone}        label="Follow-up Calls"     value={d.followUpCalls}      accent="#06B6D4" />
          <StatCard icon={FaMoneyBill}    label="Payment Follow-ups"  value={d.paymentFollowups}   accent="#EF4444" />
          <StatCard icon={FaUserPlus}     label="New Customers"       value={d.newCustomers}       accent="#14B8A6" />
          <StatCard icon={FaUserFriends}  label="Old Customers"       value={d.oldCustomers}       accent="#F97316" />
          <StatCard icon={FaBell}         label="Today's Reminders"   value={d.todayReminders}     accent="#DC2626" />
        </div>

        {/* Charts */}
        <DashboardCharts data={d} />

        {/* Admin Progress Table */}
        <div className="sad-section-title">👔 Admin Progress</div>
        <div className="sad-table-wrap">
          <table className="sad-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Admin Name</th>
                <th>Organization</th>
                <th>Status</th>
                <th>Users</th>
                <th>Customers</th>
                <th>Closed</th>
                <th>Quotation</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {(d.adminSummaries || []).map((a, i) => (
                <tr key={a._id}>
                  <td>{i + 1}</td>
                  <td><strong>{a.name}</strong></td>
                  <td>{a.organization?.orgName || "—"}</td>
                  <td>
                    <span className={`sad-badge ${a.status === "ACTIVE" ? "sad-badge-green" : "sad-badge-red"}`}>
                      {a.status}
                    </span>
                  </td>
                  <td>{a.totalUsers}</td>
                  <td>{a.totalCustomers}</td>
                  <td>{a.closedCustomers}</td>
                  <td>{a.quotationShared}</td>
                  <td>
                    <button className="sad-view-btn" onClick={() => jumpToAdminDashboard(a._id)}>
                      <FaEye /> View Dashboard
                    </button>
                  </td>
                </tr>
              ))}
              {(!d.adminSummaries || d.adminSummaries.length === 0) && (
                <tr><td colSpan={9} className="sad-empty">No admins found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </>
    );
  };

  // ─────────────────────────────────────────────
  // ADMIN DASHBOARD SECTION
  // ─────────────────────────────────────────────
  const renderAdminDashboard = () => {
    if (loadingAdmin) return <div className="sad-loader">Loading admin dashboard…</div>;
    if (!adminData)   return null;
    const d = adminData;

    return (
      <>
        {/* Admin info banner */}
        <div className="sad-entity-banner">
          <div>
            <h3>{d.admin?.name}</h3>
            <span>{d.admin?.organization?.orgName || "—"}</span>
          </div>
          <span className={`sad-badge ${d.admin?.status === "ACTIVE" ? "sad-badge-green" : "sad-badge-red"}`}>
            {d.admin?.status}
          </span>
        </div>

        {/* KPIs */}
        <div className="sad-section-title">📊 Admin Dashboard Stats</div>
        <div className="sad-stats-grid">
          <StatCard icon={FaUsers}       label="Total Users"        value={d.totalUsers}        accent="#2563EB" />
          <StatCard icon={FaChartLine}   label="Total Customers"    value={d.totalCustomers}    accent="#0891b2" />
          <StatCard icon={FaCheckCircle} label="Active Leads"       value={d.activeLeads}       accent="#10B981" />
          <StatCard icon={FaCheckCircle} label="Closed Leads"       value={d.closedLeads}       accent="#F59E0B" />
          <StatCard icon={FaChartLine}   label="Quotation Shared"   value={d.quotationShared}   accent="#8B5CF6" />
          <StatCard icon={FaPhone}       label="Follow-up Calls"    value={d.followUpCalls}     accent="#06B6D4" />
          <StatCard icon={FaMoneyBill}   label="Payment Follow-ups" value={d.paymentFollowups}  accent="#EF4444" />
          <StatCard icon={FaUserPlus}    label="New Customers"      value={d.newCustomers}      accent="#14B8A6" />
          <StatCard icon={FaUserFriends} label="Old Customers"      value={d.oldCustomers}      accent="#F97316" />
          <StatCard icon={FaBell}        label="Today's Reminders"  value={d.todayReminders}    accent="#DC2626" />
        </div>

        {/* Charts */}
        <DashboardCharts data={d} />

        {/* Users under this admin */}
        <div className="sad-section-title">👥 Users Under {d.admin?.name}</div>
        <div className="sad-table-wrap">
          <table className="sad-table">
            <thead>
              <tr>
                <th>#</th>
                <th>User Name</th>
                <th>Username</th>
                <th>Login Status</th>
                <th>Joined</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {(d.users || []).map((u, i) => (
                <tr key={u._id}>
                  <td>{i + 1}</td>
                  <td><strong>{u.name}</strong></td>
                  <td>{u.username}</td>
                  <td>
                    <span className={`sad-badge ${u.loginStatus === "Active" ? "sad-badge-green" : "sad-badge-gray"}`}>
                      {u.loginStatus || "Active"}
                    </span>
                  </td>
                  <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}</td>
                  <td>
                    <button className="sad-view-btn sad-view-user" onClick={() => jumpToUserDashboard(u._id)}>
                      <FaEye /> View Dashboard
                    </button>
                  </td>
                </tr>
              ))}
              {(!d.users || d.users.length === 0) && (
                <tr><td colSpan={6} className="sad-empty">No users found for this admin</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </>
    );
  };

  // ─────────────────────────────────────────────
  // USER DASHBOARD SECTION
  // ─────────────────────────────────────────────
  const renderUserDashboard = () => {
    if (loadingUser) return <div className="sad-loader">Loading user dashboard…</div>;
    if (!userData)   return null;
    const d = userData;

    return (
      <>
        {/* User info banner */}
        <div className="sad-entity-banner sad-user-banner">
          <div>
            <h3>{d.user?.name}</h3>
            <span>@{d.user?.username}</span>
          </div>
          <span className={`sad-badge ${d.user?.loginStatus === "Active" ? "sad-badge-green" : "sad-badge-gray"}`}>
            {d.user?.loginStatus || "Active"}
          </span>
        </div>

        {/* KPIs */}
        <div className="sad-section-title">📊 User Dashboard Stats</div>
        <div className="sad-stats-grid">
          <StatCard icon={FaChartLine}   label="Total Customers"    value={d.totalCustomers}    accent="#0891b2" />
          <StatCard icon={FaCheckCircle} label="Active Leads"       value={d.activeLeads}       accent="#10B981" />
          <StatCard icon={FaCheckCircle} label="Closed Leads"       value={d.closedLeads}       accent="#F59E0B" />
          <StatCard icon={FaChartLine}   label="Quotation Shared"   value={d.quotationShared}   accent="#8B5CF6" />
          <StatCard icon={FaPhone}       label="Follow-up Calls"    value={d.followUpCalls}     accent="#06B6D4" />
          <StatCard icon={FaMoneyBill}   label="Payment Follow-ups" value={d.paymentFollowups}  accent="#EF4444" />
          <StatCard icon={FaUserPlus}    label="New Customers"      value={d.newCustomers}      accent="#14B8A6" />
          <StatCard icon={FaUserFriends} label="Old Customers"      value={d.oldCustomers}      accent="#F97316" />
          <StatCard icon={FaBell}        label="Today's Reminders"  value={d.todayReminders}    accent="#DC2626" />
        </div>

        {/* Charts */}
        <DashboardCharts data={d} />

        {/* Customer list table */}
        <div className="sad-section-title">📋 Customers of {d.user?.name}</div>
        <div className="sad-table-wrap">
          <table className="sad-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Company</th>
                <th>Phone</th>
                <th>Lead Status</th>
                <th>Priority</th>
                <th>Stage</th>
                <th>Follow-up Date</th>
              </tr>
            </thead>
            <tbody>
              {(d.customers || []).map((c, i) => (
                <tr key={c._id}>
                  <td>{i + 1}</td>
                  <td><strong>{c.name || "—"}</strong></td>
                  <td>{c.company || "—"}</td>
                  <td>{c.phoneNumber || "—"}</td>
                  <td>
                    <span className={`sad-badge sad-badge-${leadStatusColor(c.leadStatus)}`}>
                      {c.leadStatus || "—"}
                    </span>
                  </td>
                  <td>
                    <span className={`sad-badge sad-badge-${priorityColor(c.priority)}`}>
                      {c.priority || "—"}
                    </span>
                  </td>
                  <td>{c.leadStage || "—"}</td>
                  <td>{c.followUpDate ? new Date(c.followUpDate).toLocaleDateString() : "—"}</td>
                </tr>
              ))}
              {(!d.customers || d.customers.length === 0) && (
                <tr><td colSpan={8} className="sad-empty">No customers found for this user</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </>
    );
  };

  // ─────────────────────────────────────────────
  // BADGE COLOR HELPERS
  // ─────────────────────────────────────────────
  const leadStatusColor = (s) => {
    if (!s) return "gray";
    if (s === "Closed") return "green";
    if (s === "Quotation Shared") return "blue";
    return "gray";
  };

  const priorityColor = (p) => {
    if (!p) return "gray";
    if (p === "High") return "red";
    if (p === "Medium") return "yellow";
    return "gray";
  };

  // ─────────────────────────────────────────────
  // MAIN RENDER
  // ─────────────────────────────────────────────
  return (
    <div className="sad-wrapper">
      {/* Header */}
      <div className="sad-header">
        <div>
          <h1 className="sad-title">Super Admin Dashboard</h1>
          <p className="sad-subtitle">View and drill down into Admins, Users & Customers</p>
        </div>
      </div>

      {/* Breadcrumb */}
    

      {/* Filter Bar */}
      {renderFilters()}

      {/* Content */}
      <div className="sad-content">
        {viewMode === "overview" && renderOverview()}
        {viewMode === "admin"    && renderAdminDashboard()}
        {viewMode === "user"     && renderUserDashboard()}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
