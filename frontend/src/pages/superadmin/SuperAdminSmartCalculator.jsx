// SuperAdminSmartCalculator.jsx
// SuperAdmin view of ALL Smart Calculator records
//   – View all records from every admin & user
//   – Filter by Admin → filter by User under that Admin
//   – View detail modal with file preview
//   – Per-admin and per-user drill-down

import React, { useEffect, useState, useCallback } from "react";
import API from "../../services/api";
import {
  FaSearch, FaTimes, FaEye, FaFilter,
  FaUserTie, FaUsers, FaFileAlt, FaBuilding,
  FaArrowLeft, FaCalendarAlt,
} from "react-icons/fa";
import CalculatorModal from "../admin/CalculatorModal";
import "./SuperAdminSmartCalculator.css";

// ─────────────────────────────────────────────────────────
// STAT CARD
// ─────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, accent = "#2563eb" }) => (
  <div className="sasc-stat-card" style={{ borderTop: `3px solid ${accent}` }}>
    <div className="sasc-stat-icon" style={{ color: accent }}><Icon /></div>
    <div>
      <p className="sasc-stat-label">{label}</p>
      <h3 className="sasc-stat-value">{value ?? "—"}</h3>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────
const SuperAdminSmartCalculator = () => {
  // Data
  const [allRecords,     setAllRecords]     = useState([]);
  const [adminsList,     setAdminsList]     = useState([]);
  const [usersForAdmin,  setUsersForAdmin]  = useState([]);
  const [loading,        setLoading]        = useState(false);

  // Filters
  const [selectedAdminId, setSelectedAdminId] = useState("");
  const [selectedUserId,  setSelectedUserId]  = useState("");
  const [search,          setSearch]          = useState("");

  // View mode: "all" | "admin" | "user"
  const [viewMode, setViewMode] = useState("all");

  // Admin/User drill-down data
  const [adminInfo,  setAdminInfo]  = useState(null);
  const [userInfo,   setUserInfo]   = useState(null);
  const [adminRecords, setAdminRecords] = useState([]);
  const [userRecords,  setUserRecords]  = useState([]);
  const [loadingDrill, setLoadingDrill] = useState(false);

  // Modal
  const [selected, setSelected] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 12;

  // ─── Fetch all records ───────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await API.get("/superadmin-dashboard/smart-calculator");
      setAllRecords(data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  // ─── Fetch admins list ───────────────────────────────────
  const fetchAdmins = useCallback(async () => {
    try {
      const { data } = await API.get("/admins/all-admins");
      setAdminsList(data.data || []);
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => {
    fetchAll();
    fetchAdmins();
  }, [fetchAll, fetchAdmins]);

  // ─── Drill into admin ────────────────────────────────────
  const drillToAdmin = async (adminId, adminObj) => {
    setLoadingDrill(true);
    setSelectedAdminId(adminId);
    setSelectedUserId("");
    setAdminInfo(adminObj || adminsList.find(a => a._id === adminId) || null);
    try {
      const { data } = await API.get(`/superadmin-dashboard/smart-calculator/admin/${adminId}`);
      setAdminRecords(data.data || []);
      setUsersForAdmin(data.users || []);
      setViewMode("admin");
    } catch (err) { console.error(err); }
    finally { setLoadingDrill(false); setCurrentPage(1); }
  };

  // ─── Drill into user ─────────────────────────────────────
  const drillToUser = async (userId, userObj) => {
    setLoadingDrill(true);
    setSelectedUserId(userId);
    setUserInfo(userObj || usersForAdmin.find(u => u._id === userId) || null);
    try {
      const { data } = await API.get(`/superadmin-dashboard/smart-calculator/user/${userId}`);
      setUserRecords(data.data || []);
      setViewMode("user");
    } catch (err) { console.error(err); }
    finally { setLoadingDrill(false); setCurrentPage(1); }
  };

  // ─── Handle admin dropdown change ────────────────────────
  const handleAdminChange = (e) => {
    const id = e.target.value;
    if (!id) {
      resetToAll();
    } else {
      drillToAdmin(id, null);
    }
  };

  // ─── Handle user dropdown change ─────────────────────────
  const handleUserChange = (e) => {
    const id = e.target.value;
    if (!id) {
      setViewMode("admin");
      setSelectedUserId("");
      setUserRecords([]);
      setCurrentPage(1);
    } else {
      drillToUser(id, null);
    }
  };

  const resetToAll = () => {
    setViewMode("all");
    setSelectedAdminId("");
    setSelectedUserId("");
    setAdminInfo(null);
    setUserInfo(null);
    setAdminRecords([]);
    setUserRecords([]);
    setSearch("");
    setCurrentPage(1);
  };

  // ─── Displayed records based on viewMode ─────────────────
  const baseRecords =
    viewMode === "user"  ? userRecords  :
    viewMode === "admin" ? adminRecords :
    allRecords;

  const displayed = baseRecords.filter(item => {
    const searchLower = search.toLowerCase();
    if (!searchLower) return true;
    return (
      (item.companyName     || "").toLowerCase().includes(searchLower) ||
      (item.orderNo         || "").toLowerCase().includes(searchLower) ||
      (item.fileName        || "").toLowerCase().includes(searchLower) ||
      (item.createdBy?.name || "").toLowerCase().includes(searchLower)
    );
  });

  const totalPages = Math.ceil(displayed.length / perPage);
  const paginated  = displayed.slice((currentPage - 1) * perPage, currentPage * perPage);

  // ─── Stats ───────────────────────────────────────────────
  const uniqueUsers  = new Set(allRecords.map(r => r.createdBy?._id).filter(Boolean)).size;
  const uniqueAdmins = new Set(allRecords.map(r => r.adminId).filter(Boolean)).size;

  // ─── Grouped admins summary for "all" view ───────────────
  const adminSummary = (() => {
    const map = {};
    allRecords.forEach(r => {
      const aid  = r.adminId;
      const aname = r.adminName || "Unknown";
      if (!aid) return;
      if (!map[aid]) map[aid] = { _id: aid, name: aname, count: 0, users: new Set() };
      map[aid].count++;
      if (r.createdBy?._id) map[aid].users.add(r.createdBy._id);
    });
    return Object.values(map).map(a => ({ ...a, userCount: a.users.size }));
  })();

  // ─── User summary for admin view ─────────────────────────
  const userSummary = (() => {
    const map = {};
    adminRecords.forEach(r => {
      const uid  = r.createdBy?._id;
      const uname = r.createdBy?.name || "Unknown";
      if (!uid) return;
      if (!map[uid]) map[uid] = { _id: uid, name: uname, count: 0 };
      map[uid].count++;
    });
    return Object.values(map);
  })();

  // ─────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────
  return (
    <div className="sasc-page">

      {/* ── Header ── */}
      <div className="sasc-header">
        <div>
          <h2 className="sasc-title">Smart Calculator</h2>
          <p className="sasc-subtitle">SuperAdmin — View all uploads across Admins & Users</p>
        </div>
        <div className="sasc-header-stats">
          <span className="sasc-pill"><FaFileAlt /> {allRecords.length} Total Records</span>
          <span className="sasc-pill sasc-pill--blue"><FaUsers /> {uniqueUsers} Users</span>
          <span className="sasc-pill sasc-pill--purple"><FaUserTie /> {uniqueAdmins} Admins</span>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="sasc-stats-grid">
        <StatCard icon={FaFileAlt}  label="Total Submissions" value={allRecords.length}  accent="#2563eb" />
        <StatCard icon={FaUserTie}  label="Admins with Data"  value={uniqueAdmins}        accent="#7c3aed" />
        <StatCard icon={FaUsers}    label="Users who Uploaded" value={uniqueUsers}         accent="#0891b2" />
        <StatCard icon={FaCalendarAlt} label="This Month"
          value={allRecords.filter(r => {
            const d = new Date(r.createdAt);
            const n = new Date();
            return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
          }).length}
          accent="#10b981"
        />
      </div>

      {/* ── Breadcrumb ── */}
      <div className="sasc-breadcrumb">
        <span
          className={viewMode === "all" ? "sasc-bc-active" : "sasc-bc-link"}
          onClick={resetToAll}
        >Super Admin</span>

        {(viewMode === "admin" || viewMode === "user") && adminInfo && (
          <>
            <span className="sasc-bc-sep">›</span>
            <span
              className={viewMode === "admin" ? "sasc-bc-active" : "sasc-bc-link"}
              onClick={() => {
                setViewMode("admin");
                setSelectedUserId("");
                setUserRecords([]);
                setCurrentPage(1);
              }}
            >{adminInfo.name || "Admin"}</span>
          </>
        )}

        {viewMode === "user" && userInfo && (
          <>
            <span className="sasc-bc-sep">›</span>
            <span className="sasc-bc-active">{userInfo.name || "User"}</span>
          </>
        )}
      </div>

      {/* ── Filter bar ── */}
      <div className="sasc-filters">
        <FaFilter className="sasc-filter-icon" />

        <div className="sasc-filter-group">
          <label>Select Admin</label>
          <select value={selectedAdminId} onChange={handleAdminChange}>
            <option value="">— All Admins —</option>
            {adminsList.map(a => (
              <option key={a._id} value={a._id}>{a.name}</option>
            ))}
          </select>
        </div>

        {viewMode !== "all" && usersForAdmin.length > 0 && (
          <div className="sasc-filter-group">
            <label>Select User</label>
            <select value={selectedUserId} onChange={handleUserChange} disabled={loadingDrill}>
              <option value="">— All Users —</option>
              {usersForAdmin.map(u => (
                <option key={u._id} value={u._id}>{u.name} ({u.username})</option>
              ))}
            </select>
          </div>
        )}

        <div className="sasc-search-wrap">
          <FaSearch className="sasc-search-icon" />
          <input
            className="sasc-search"
            placeholder="Search company, order, file, user…"
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
          />
          {search && (
            <button className="sasc-search-clear" onClick={() => { setSearch(""); setCurrentPage(1); }}>
              <FaTimes />
            </button>
          )}
        </div>

        {viewMode !== "all" && (
          <button className="sasc-back-btn" onClick={resetToAll}>
            <FaArrowLeft /> All Records
          </button>
        )}
        {viewMode === "user" && (
          <button className="sasc-back-btn sasc-back-btn--admin" onClick={() => {
            setViewMode("admin");
            setSelectedUserId("");
            setUserRecords([]);
            setCurrentPage(1);
          }}>
            <FaArrowLeft /> {adminInfo?.name || "Admin"} View
          </button>
        )}
      </div>

      {/* ── Admin entity banner (admin view) ── */}
      {viewMode === "admin" && adminInfo && (
        <div className="sasc-entity-banner sasc-entity-banner--admin">
          <div className="sasc-entity-banner-left">
            <FaUserTie className="sasc-entity-icon" />
            <div>
              <h4>{adminInfo.name}</h4>
              <span>{adminInfo.organization?.orgName || "—"}</span>
            </div>
          </div>
          <div className="sasc-entity-stats">
            <span><strong>{adminRecords.length}</strong> records</span>
            <span><strong>{userSummary.length}</strong> users</span>
          </div>
        </div>
      )}

      {/* ── User entity banner (user view) ── */}
      {viewMode === "user" && userInfo && (
        <div className="sasc-entity-banner sasc-entity-banner--user">
          <div className="sasc-entity-banner-left">
            <FaUsers className="sasc-entity-icon" />
            <div>
              <h4>{userInfo.name}</h4>
              <span>@{userInfo.username}</span>
            </div>
          </div>
          <div className="sasc-entity-stats">
            <span><strong>{userRecords.length}</strong> records</span>
          </div>
        </div>
      )}

      {/* ── Admin summary table (all view only) ── */}
      {viewMode === "all" && !search && adminSummary.length > 0 && (
        <div className="sasc-summary-section">
          <h3 className="sasc-section-title">👔 Admin Summary</h3>
          <div className="sasc-table-wrap">
            <table className="sasc-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Admin Name</th>
                  <th>Submissions</th>
                  <th>Users</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {adminSummary.sort((a,b) => b.count - a.count).map((a, i) => (
                  <tr key={a._id}>
                    <td>{i + 1}</td>
                    <td><strong>{a.name}</strong></td>
                    <td>
                      <span className="sasc-badge sasc-badge-blue">{a.count}</span>
                    </td>
                    <td>{a.userCount}</td>
                    <td>
                      <button className="sasc-drill-btn" onClick={() => drillToAdmin(a._id, a)}>
                        <FaEye /> View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── User summary table (admin view only) ── */}
      {viewMode === "admin" && !search && userSummary.length > 0 && (
        <div className="sasc-summary-section">
          <h3 className="sasc-section-title">👥 User Summary under {adminInfo?.name}</h3>
          <div className="sasc-table-wrap">
            <table className="sasc-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>User Name</th>
                  <th>Submissions</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {userSummary.sort((a,b) => b.count - a.count).map((u, i) => (
                  <tr key={u._id}>
                    <td>{i + 1}</td>
                    <td><strong>{u.name}</strong></td>
                    <td>
                      <span className="sasc-badge sasc-badge-green">{u.count}</span>
                    </td>
                    <td>
                      <button className="sasc-drill-btn sasc-drill-btn--user" onClick={() => drillToUser(u._id, u)}>
                        <FaEye /> View Uploads
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Records table ── */}
      <div className="sasc-section-title-row">
        <h3 className="sasc-section-title">
          {viewMode === "all"   && "📋 All Submissions"}
          {viewMode === "admin" && `📋 All Submissions by ${adminInfo?.name || "Admin"}`}
          {viewMode === "user"  && `📋 Submissions by ${userInfo?.name || "User"}`}
        </h3>
        <span className="sasc-record-count">{displayed.length} record{displayed.length !== 1 ? "s" : ""}</span>
      </div>

      <div className="sasc-table-wrap">
        {loading || loadingDrill ? (
          <div className="sasc-loading">Loading records…</div>
        ) : (
          <table className="sasc-table">
            <thead>
              <tr>
                <th>#</th>
                {viewMode !== "user" && <th>User</th>}
                {viewMode === "all"  && <th>Admin</th>}
                <th>Company</th>
                <th>Order No</th>
                <th>File</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={viewMode === "all" ? 8 : viewMode === "admin" ? 7 : 6} className="sasc-empty">
                    No records found.
                  </td>
                </tr>
              ) : (
                paginated.map((item, i) => (
                  <tr key={item._id}>
                    <td>{(currentPage - 1) * perPage + i + 1}</td>

                    {viewMode !== "user" && (
                      <td>
                        {item.createdBy?.name ? (
                          <button
                            className="sasc-link-btn"
                            onClick={() => drillToUser(item.createdBy._id, item.createdBy)}
                          >
                            <FaUsers style={{ fontSize: "0.7rem", marginRight: 4 }} />
                            {item.createdBy.name}
                          </button>
                        ) : "—"}
                      </td>
                    )}

                    {viewMode === "all" && (
                      <td>
                        {item.adminName ? (
                          <button
                            className="sasc-link-btn sasc-link-btn--admin"
                            onClick={() => drillToAdmin(item.adminId, { _id: item.adminId, name: item.adminName })}
                          >
                            <FaUserTie style={{ fontSize: "0.7rem", marginRight: 4 }} />
                            {item.adminName}
                          </button>
                        ) : "—"}
                      </td>
                    )}

                    <td><strong>{item.companyName || "—"}</strong></td>
                    <td>
                      <span className="sasc-order-badge">{item.orderNo || "—"}</span>
                    </td>
                    <td>
                      <span className="sasc-file-name">
                        <FaFileAlt style={{ fontSize: "0.75rem", marginRight: 4, opacity: 0.6 }} />
                        {item.fileName || "—"}
                      </span>
                    </td>
                    <td>{item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-IN") : "—"}</td>
                    <td>
                      <button className="sasc-view-btn" onClick={() => setSelected(item)}>
                        <FaEye /> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="sasc-pagination">
          <button className="sasc-page-btn" disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}>‹ Prev</button>
          {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map(p => (
            <button key={p}
              className={`sasc-page-btn ${p === currentPage ? "sasc-page-active" : ""}`}
              onClick={() => setCurrentPage(p)}>{p}</button>
          ))}
          {totalPages > 10 && <span className="sasc-page-ellipsis">…{totalPages}</span>}
          <button className="sasc-page-btn" disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}>Next ›</button>
        </div>
      )}

      {/* ── Detail Modal ── */}
      {selected && (
        <CalculatorModal data={selected} close={() => setSelected(null)} />
      )}
    </div>
  );
};

export default SuperAdminSmartCalculator;