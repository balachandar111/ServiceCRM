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
  FaUserCircle
} from "react-icons/fa";

import OrganizationList from "./superadmin/OrganizationList";
import AdminList from "./superadmin/AdminList";
import UserList from "./admin/UserList";
import UserDashboard
from "./user/UserDashboard";
import PendingLeads
from "./superadmin/PendingLeads";
import AdminDashboard
from "./admin/AdminDashboard";

import SuperAdminDashboard
from "./superadmin/SuperAdminDashboard";

const Dashboard = () => {

  const [activeMenu, setActiveMenu] =
    useState("dashboard");

  const navigate = useNavigate();

  const role =
    localStorage.getItem("role");

  const user =
    JSON.parse(
      localStorage.getItem("user")
    );

  const logout = () => {

    localStorage.clear();

    navigate("/login");

  };

  return (

    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f4f7fb"
      }}
    >

      {/* SIDEBAR */}

      <div
      className="sidebar"
        style={{
          width: "260px",
          background: "#fff",
          borderRight: "1px solid #eee",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between"
        }}
      >

        <div>

          <div
          className="sidebar-logo"
            style={{
              padding: "25px",
              fontSize: "26px",
              fontWeight: "700",
              color: "#2563eb"
            }}
          >
            CRM
          </div>

          <ul
          className="sidebar-menu"
            style={{
              listStyle: "none",
              padding: "10px"
            }}
          >

            <li
              onClick={() => setActiveMenu("dashboard")}
  className={`menu-item ${
    activeMenu === "dashboard" ? "active-menu" : ""
  }`}
            >

              <FaTachometerAlt />

              Dashboard

            </li>

            {
              role ===
              "SUPER_ADMIN" && (
                <>
                 <li
  onClick={() => setActiveMenu("organizations")}
  className={`menu-item ${
    activeMenu === "organizations" ? "active-menu" : ""
  }`}
>
  <FaBuilding />
  Organizations
</li>

                 <li
  onClick={() => setActiveMenu("admins")}
  className={`menu-item ${
    activeMenu === "admins" ? "active-menu" : ""
  }`}
>
  <FaUserTie />
  Admins
</li>
              <li
  onClick={() => setActiveMenu("pendingLeads")}
  className={`menu-item ${
    activeMenu === "pendingLeads" ? "active-menu" : ""
  }`}
>
  <FaClipboardList />
  Pending Leads
</li>
                </>
              )
            }

            {
              role ===
              "ADMIN" && (
                <>
                 <li
  onClick={() => setActiveMenu("users")}
  className={`menu-item ${
    activeMenu === "users" ? "active-menu" : ""
  }`}
>
  <FaUsers />
  Users
</li>

                 <li
  onClick={() => setActiveMenu("leads")}
  className={`menu-item ${
    activeMenu === "leads" ? "active-menu" : ""
  }`}
>
  <FaClipboardList />
  Leads
</li>
                </>
              )
            }
            

            {
              role ===
              "USER" && (
               <li
  onClick={() => setActiveMenu("myleads")}
  className={`menu-item ${
    activeMenu === "myleads" ? "active-menu" : ""
  }`}
>
  <FaClipboardList />
  My Leads
</li>
              )
            }

          <li
  onClick={() => setActiveMenu("profile")}
  className={`menu-item ${
    activeMenu === "profile" ? "active-menu" : ""
  }`}
>
  <FaUserCircle />
  Profile
</li>
<li>
  <button
    onClick={logout}
    className="logout-btn"
  >
    <FaSignOutAlt />
    Logout
  </button>
</li>
          </ul>

        </div>


      </div>

      {/* MAIN */}

      <div
        style={{
          flex: 1,
          padding: "30px"
        }}
      >

       

        {/* PAGE CONTENT */}

        {
          activeMenu ===
          "organizations" &&
          <OrganizationList />
        }

        {
          activeMenu ===
          "admins" &&
          <AdminList />
        }

        {
          activeMenu ===
          "users" &&
          <UserList />
        }

        {
          activeMenu ===
          "leads" && (

            <div
              className="card"
            >

              <h2>
                Lead Management
              </h2>

            </div>

          )
        }
{
 activeMenu ===
 "myleads" &&

 <UserDashboard />

}


        {
          activeMenu ===
          "profile" && (

            <div
              style={{
                background: "#fff",
                padding: "30px",
                borderRadius: "20px"
              }}
            >

              <h2>
                Profile
              </h2>

              <hr />

              <h3>
                Name :
                {user?.name}
              </h3>

              <h3>
                Role :
                {role}
              </h3>

            </div>

          )
        }
        {
 activeMenu ===
 "pendingLeads" &&

 <PendingLeads />

}

       {
        role === "ADMIN" &&
 activeMenu ===
 "dashboard" &&

 <AdminDashboard />
}
{
 role === "SUPER_ADMIN" &&
 activeMenu === "dashboard" &&

 <SuperAdminDashboard />
}
      </div>

    </div>

  );

};


const menuStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "15px",
  marginBottom: "10px",
  cursor: "pointer",
  borderRadius: "10px"
};

export default Dashboard;