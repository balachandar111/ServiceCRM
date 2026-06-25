import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

import {
  FaTachometerAlt,
  FaBuilding,
  FaUserTie,
  FaUsers,
  FaClipboardList,
  FaSignOutAlt,
  FaChartLine,
  FaCheckCircle,
  FaUserCircle,
  FaIdBadge,
  FaEnvelope,
  FaShieldAlt,
  FaCalendarAlt,
} from "react-icons/fa";

import OrganizationList from "./superadmin/OrganizationList";
import AdminList from "./superadmin/AdminList";
import UserList from "./admin/UserList";
import PendingLeads from "./superadmin/PendingLeads";
import AdminDashboard from "./admin/AdminDashboard";
import SuperAdminDashboard from "./superadmin/SuperAdminDashboard";
import SmartCalculator from "./user/SmartCalculator";
import UserCustomers from "./user/UserCustomers";
import CustomerAnalytics from "./user/CustomerAnalytics";
import UserReminders from "./user/UserReminders";
import AdminCustomers from "./admin/AdminCustomers";
import AdminReminders from "./admin/AdminReminder";
import AdminSmartCalculator from "./admin/AdminSmartCalculator";
import Approvals from "./admin/Approvals";

const Dashboard = () => {
  const role = localStorage.getItem("role");
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "null");

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const roleLabel = {
    SUPER_ADMIN: "Super Admin",
    ADMIN: "Admin",
    USER: "User",
  };

  const roleColor = {
    SUPER_ADMIN: "linear-gradient(135deg,#7c3aed,#a855f7)",
    ADMIN: "linear-gradient(135deg,#2563eb,#3b82f6)",
    USER: "linear-gradient(135deg,#0891b2,#06b6d4)",
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f4f7fb" }}>

      {/* SIDEBAR */}
      <div
        className="sidebar"
        style={{
          width: "260px",
          background: "#fff",
          borderRight: "1px solid #eee",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div>
   <div className="sidebar-logo">

  <img
    src="https://res.cloudinary.com/ds4i8pujs/image/upload/v1782384056/ExpressPc_hlocwh.jpg"
    alt="Express PC"
    className="sidebar-logo-img"
  />

  <h2 className="sidebar-logo-title">
    Express PC
  </h2>

  <span className="sidebar-logo-subtitle">
    CRM Management
  </span>

</div>

          <ul className="sidebar-menu" style={{ listStyle: "none", padding: "10px" }}>

            {(role === "SUPER_ADMIN" || role === "ADMIN" || role === "USER") && (
              <li
                onClick={() => setActiveMenu("dashboard")}
                className={`menu-item ${activeMenu === "dashboard" ? "active-menu" : ""}`}
              >
                <FaTachometerAlt />
                Dashboard
              </li>
            )}

            {role === "SUPER_ADMIN" && (
              <>
                <li
                  onClick={() => setActiveMenu("organizations")}
                  className={`menu-item ${activeMenu === "organizations" ? "active-menu" : ""}`}
                >
                  <FaBuilding />
                  Organizations
                </li>
                <li
                  onClick={() => setActiveMenu("admins")}
                  className={`menu-item ${activeMenu === "admins" ? "active-menu" : ""}`}
                >
                  <FaUserTie />
                  Admins
                </li>
                <li
                  onClick={() => setActiveMenu("pendingLeads")}
                  className={`menu-item ${activeMenu === "pendingLeads" ? "active-menu" : ""}`}
                >
                  <FaClipboardList />
                  Pending Leads
                </li>
              </>
            )}

            {role === "ADMIN" && (
              <>
                <li
                  onClick={() => setActiveMenu("users")}
                  className={`menu-item ${activeMenu === "users" ? "active-menu" : ""}`}
                >
                  <FaUsers />
                  Users
                </li>
                <li
                  onClick={() => setActiveMenu("customers")}
                  className={`menu-item ${activeMenu === "customers" ? "active-menu" : ""}`}
                >
                  <FaClipboardList />
                  Customers
                </li>
                <li
                  onClick={() => setActiveMenu("reminders")}
                  className={`menu-item ${activeMenu === "reminders" ? "active-menu" : ""}`}
                >
                  <FaClipboardList />
                  Reminders
                </li>
                <li
                  onClick={() => setActiveMenu("calculator")}
                  className={`menu-item ${activeMenu === "calculator" ? "active-menu" : ""}`}
                >
                  <FaChartLine />
                  Smart Calculator
                </li>
                <li
                  onClick={() => setActiveMenu("approvals")}
                  className={`menu-item ${activeMenu === "approvals" ? "active-menu" : ""}`}
                >
                  <FaCheckCircle />
                  Approvals
                </li>
              </>
            )}

            {role === "USER" && (
              <>
                <li
                  onClick={() => setActiveMenu("Customers")}
                  className={`menu-item ${activeMenu === "Customers" ? "active-menu" : ""}`}
                >
                  <FaClipboardList />
                  Customers
                </li>
                <li
                  onClick={() => setActiveMenu("smartcalculator")}
                  className={`menu-item ${activeMenu === "smartcalculator" ? "active-menu" : ""}`}
                >
                  <FaChartLine />
                  Smart Calculator
                </li>
                <li
                  onClick={() => setActiveMenu("reminders")}
                  className={`menu-item ${activeMenu === "reminders" ? "active-menu" : ""}`}
                >
                  <FaClipboardList />
                  Reminders
                </li>
              </>
            )}

            {/* Profile — visible to all roles */}
            <li
              onClick={() => setActiveMenu("profile")}
              className={`menu-item ${activeMenu === "profile" ? "active-menu" : ""}`}
            >
              <FaUserCircle />
              Profile
            </li>

            <li>
              <button onClick={logout} className="logout-btn">
                <FaSignOutAlt />
                Logout
              </button>
            </li>

          </ul>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, padding: "30px" }}>

        {activeMenu === "organizations" && <OrganizationList />}
        {activeMenu === "admins" && <AdminList />}
        {activeMenu === "users" && <UserList />}
        {activeMenu === "pendingLeads" && <PendingLeads />}

        {role === "ADMIN" && activeMenu === "dashboard" && <AdminDashboard />}
        {role === "SUPER_ADMIN" && activeMenu === "dashboard" && <SuperAdminDashboard />}
        {role === "USER" && activeMenu === "dashboard" && <CustomerAnalytics />}

        {activeMenu === "Customers" && <UserCustomers />}
        {activeMenu === "smartcalculator" && <SmartCalculator />}

        {/* USER reminders */}
        {role === "USER" && activeMenu === "reminders" && <UserReminders />}

        {/* ADMIN reminders — single calendar component */}
        {role === "ADMIN" && activeMenu === "reminders" && <AdminReminders />}

        {role === "ADMIN" && activeMenu === "customers" && <AdminCustomers />}
        {role === "ADMIN" && activeMenu === "calculator" && <AdminSmartCalculator />}
        {role === "ADMIN" && activeMenu === "approvals" && <Approvals />}

        {/* ── PROFILE PAGE ── */}
        {activeMenu === "profile" && (
          <div style={{ maxWidth: "700px", margin: "0 auto" }}>
            {/* Header banner */}
            <div
              style={{
                background: roleColor[role] || "linear-gradient(135deg,#2563eb,#3b82f6)",
                borderRadius: "24px",
                padding: "40px 36px 60px",
                color: "#fff",
                marginBottom: "-40px",
                boxShadow: "0 10px 30px rgba(37,99,235,0.25)",
              }}
            >
              <p style={{ margin: 0, opacity: 0.85, fontSize: "14px", letterSpacing: "1px", textTransform: "uppercase" }}>
                My Profile
              </p>
              <h1 style={{ margin: "10px 0 4px", fontSize: "30px", fontWeight: 700 }}>
                {user?.name || "—"}
              </h1>
              <span
                style={{
                  display: "inline-block",
                  background: "rgba(255,255,255,0.25)",
                  padding: "4px 14px",
                  borderRadius: "50px",
                  fontSize: "13px",
                  fontWeight: 600,
                  letterSpacing: "0.5px",
                }}
              >
                {roleLabel[role] || role}
              </span>
            </div>

            {/* Avatar + details card */}
            <div
              style={{
                background: "#fff",
                borderRadius: "24px",
                padding: "60px 36px 36px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                position: "relative",
              }}
            >
              {/* Avatar circle */}
              <div
                style={{
                  position: "absolute",
                  top: "-40px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  background: roleColor[role] || "#2563eb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "34px",
                  fontWeight: 700,
                  color: "#fff",
                  border: "4px solid #fff",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                }}
              >
                {(user?.name || "?").charAt(0).toUpperCase()}
              </div>

              {/* Info rows */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "20px",
                  marginTop: "10px",
                }}
              >
                {/* Name */}
                <div style={infoBox}>
                  <div style={infoIcon("#2563eb")}>
                    <FaUserCircle />
                  </div>
                  <div>
                    <p style={infoLabel}>Full Name</p>
                    <p style={infoValue}>{user?.name || "—"}</p>
                  </div>
                </div>

                {/* Username */}
                <div style={infoBox}>
                  <div style={infoIcon("#7c3aed")}>
                    <FaIdBadge />
                  </div>
                  <div>
                    <p style={infoLabel}>Username</p>
                    <p style={infoValue}>{user?.username || "—"}</p>
                  </div>
                </div>

                {/* Role */}
                <div style={infoBox}>
                  <div style={infoIcon("#0891b2")}>
                    <FaShieldAlt />
                  </div>
                  <div>
                    <p style={infoLabel}>Role</p>
                    <p style={infoValue}>{roleLabel[role] || role}</p>
                  </div>
                </div>

                {/* Email */}
                {user?.email && (
                  <div style={infoBox}>
                    <div style={infoIcon("#059669")}>
                      <FaEnvelope />
                    </div>
                    <div>
                      <p style={infoLabel}>Email</p>
                      <p style={infoValue}>{user.email}</p>
                    </div>
                  </div>
                )}

                {/* Joined */}
                {user?.createdAt && (
                  <div style={infoBox}>
                    <div style={infoIcon("#d97706")}>
                      <FaCalendarAlt />
                    </div>
                    <div>
                      <p style={infoLabel}>Joined On</p>
                      <p style={infoValue}>
                        {new Date(user.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                )}

                {/* Status */}
                {user?.loginStatus && (
                  <div style={infoBox}>
                    <div
                      style={infoIcon(
                        user.loginStatus === "Active" ? "#16a34a" : "#dc2626"
                      )}
                    >
                      <FaShieldAlt />
                    </div>
                    <div>
                      <p style={infoLabel}>Status</p>
                      <p
                        style={{
                          ...infoValue,
                          color:
                            user.loginStatus === "Active" ? "#16a34a" : "#dc2626",
                          fontWeight: 700,
                        }}
                      >
                        {user.loginStatus}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

/* ── inline style helpers ── */
const infoBox = {
  display: "flex",
  alignItems: "center",
  gap: "14px",
  background: "#f8fafc",
  borderRadius: "14px",
  padding: "16px 18px",
};

const infoIcon = (color) => ({
  width: "42px",
  height: "42px",
  borderRadius: "12px",
  background: color + "18",
  color: color,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "18px",
  flexShrink: 0,
});

const infoLabel = {
  margin: 0,
  fontSize: "11px",
  color: "#94a3b8",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const infoValue = {
  margin: "4px 0 0",
  fontSize: "15px",
  color: "#1e293b",
  fontWeight: 600,
};

export default Dashboard;
