// SuperAdminCustomers.jsx
// Full customer management for SuperAdmin:
//   - Filter by Admin → User
//   - Create (CreateCustomerModal), Edit (EditCustomerModal), Reassign, Delete, View (CustomerDetailsModal)
//   - Uses /superadmin-dashboard/customers endpoints (no approval queue)

import React, { useEffect, useState, useCallback } from "react";
import API from "../../services/api";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  FaPlus, FaEye, FaEdit, FaTrash, FaExchangeAlt,
  FaSearch, FaFilter, FaTimes, FaUserAlt, FaDownload,
} from "react-icons/fa";
import CustomerDetailsModal from "../user/CustomerDetailsModal";
import CreateCustomerModal  from "../user/CreateCustomerModal";
import EditCustomerModal    from "../user/EditCustomerModel";
import "./SuperAdminCustomers.css";

const SA_CUSTOMERS_ENDPOINT = "/superadmin-dashboard/customers";

// ─────────────────────────────────────────────────────────
// REASSIGN MODAL
// ─────────────────────────────────────────────────────────
const ReassignModal = ({ customer, allUsers, admins, onClose, onReassigned }) => {
  const [selectedAdminId, setSelectedAdminId] = useState("");
  const [selectedUserId,  setSelectedUserId]  = useState("");
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  const filteredUsers = selectedAdminId
    ? allUsers.filter(u =>
        u.createdBy?._id === selectedAdminId || u.createdBy === selectedAdminId
      )
    : allUsers;

  const handleReassign = async () => {
    if (!selectedUserId) { setError("Please select a user."); return; }
    setSaving(true);
    setError("");
    try {
      const targetUser = allUsers.find(u => u._id === selectedUserId);
      await API.put(`${SA_CUSTOMERS_ENDPOINT}/${customer._id}/reassign`, {
        userId:     selectedUserId,
        assignedTo: targetUser?.name || "",
      });
      onReassigned();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Reassign failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="sac-overlay" onClick={onClose}>
      <div className="sac-modal sac-modal--reassign" onClick={e => e.stopPropagation()}>
        <div className="sac-modal-header sac-modal-header--orange">
          <h3><FaExchangeAlt style={{ marginRight: 8 }} />Reassign Customer</h3>
          <button className="sac-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="sac-modal-body">
          <p className="sac-reassign-info">
            Reassigning <strong>{customer?.name || "this customer"}</strong> to a new user.
            {customer?.createdBy?.name && (
              <span className="sac-current-user"> Currently: <em>{customer.createdBy.name}</em></span>
            )}
          </p>

          <label className="sac-label">Filter by Admin (optional)</label>
          <select
            className="sac-select"
            value={selectedAdminId}
            onChange={e => { setSelectedAdminId(e.target.value); setSelectedUserId(""); }}
          >
            <option value="">— All Admins —</option>
            {admins.map(a => (
              <option key={a._id} value={a._id}>{a.name}</option>
            ))}
          </select>

          <label className="sac-label" style={{ marginTop: 14 }}>Select Target User *</label>
          <select
            className="sac-select"
            value={selectedUserId}
            onChange={e => setSelectedUserId(e.target.value)}
          >
            <option value="">— Choose user —</option>
            {filteredUsers.map(u => (
              <option key={u._id} value={u._id}>
                {u.name} ({u.username})
              </option>
            ))}
          </select>

          {error && <p className="sac-error">{error}</p>}
        </div>

        <div className="sac-modal-footer">
          <button className="sac-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="sac-btn-save" onClick={handleReassign} disabled={saving}>
            {saving ? "Reassigning…" : "Reassign"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────
// DELETE CONFIRM MODAL
// ─────────────────────────────────────────────────────────
const DeleteConfirmModal = ({ customer, onClose, onDeleted }) => {
  const [deleting, setDeleting] = useState(false);
  const [error,    setError]    = useState("");

  const handleDelete = async () => {
    setDeleting(true);
    setError("");
    try {
      await API.delete(`${SA_CUSTOMERS_ENDPOINT}/${customer._id}`);
      onDeleted();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed");
      setDeleting(false);
    }
  };

  return (
    <div className="sac-overlay" onClick={onClose}>
      <div className="sac-modal sac-modal--sm" onClick={e => e.stopPropagation()}>
        <div className="sac-modal-header sac-modal-header--red">
          <h3><FaTrash style={{ marginRight: 8 }} />Delete Customer</h3>
          <button className="sac-close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="sac-modal-body">
          <p style={{ margin: 0, color: "#475569", fontSize: "0.95rem" }}>
            Are you sure you want to delete <strong>{customer?.name}</strong>?
            This action <strong>cannot be undone</strong>.
          </p>
          {error && <p className="sac-error">{error}</p>}
        </div>
        <div className="sac-modal-footer">
          <button className="sac-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="sac-btn-delete" onClick={handleDelete} disabled={deleting}>
            {deleting ? "Deleting…" : "Yes, Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────
const SuperAdminCustomers = ({ scopeAdmin, scopeUser, setScopeAdmin, setScopeUser }) => {
  const [customers, setCustomers] = useState([]);
  const [admins,    setAdmins]    = useState([]);
  const [allUsers,  setAllUsers]  = useState([]);
  const [loading,   setLoading]   = useState(false);

  // Local fallback state when props are not provided
  const [localAdmin, setLocalAdmin] = useState("ALL");
  const [localUser,  setLocalUser]  = useState("ALL");

  const selectedAdmin    = scopeAdmin    !== undefined ? scopeAdmin    : localAdmin;
  const selectedUser     = scopeUser     !== undefined ? scopeUser     : localUser;
  const setSelectedAdmin = setScopeAdmin !== undefined ? setScopeAdmin : setLocalAdmin;
  const setSelectedUser  = setScopeUser  !== undefined ? setScopeUser  : setLocalUser;

  // Filters
  const [search,           setSearch]           = useState("");
  const [leadStatusFilter, setLeadStatusFilter] = useState("");
  const [stageFilter,      setStageFilter]      = useState("");
  const [priorityFilter,   setPriorityFilter]   = useState("");

  // Extra filters (same as Admin Customers, plus Admin/User scope above)
  const [serviceFilter,       setServiceFilter]       = useState("");
  const [sourceFilter,        setSourceFilter]        = useState("");
  const [statusFilter,        setStatusFilter]        = useState("");
  const [customerLevelFilter, setCustomerLevelFilter] = useState("");
  const [callTypeFilter,      setCallTypeFilter]      = useState("");
  const [followUpTypeFilter,  setFollowUpTypeFilter]  = useState("");
  const [sectorFilter,        setSectorFilter]        = useState("");
  const [fromDate,            setFromDate]            = useState("");
  const [toDate,              setToDate]              = useState("");

  // Modals
  const [showCreate,   setShowCreate]   = useState(false);
  const [showEdit,     setShowEdit]     = useState(false);
  const [showDetails,  setShowDetails]  = useState(false);
  const [showReassign, setShowReassign] = useState(false);
  const [showDelete,   setShowDelete]   = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  // ─────────────────────────
  // Fetch
  // ─────────────────────────
  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await API.get(SA_CUSTOMERS_ENDPOINT);
      setCustomers(data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  const fetchAdmins = useCallback(async () => {
    try {
      const { data } = await API.get("/admins/all-admins");
      setAdmins(data.data || []);
    } catch (err) { console.error(err); }
  }, []);

  const fetchAllUsers = useCallback(async () => {
    try {
      const { data } = await API.get("/users");
      setAllUsers((data.data || []).filter(u => u.role === "USER"));
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => {
    fetchCustomers();
    fetchAdmins();
    fetchAllUsers();
  }, [fetchCustomers, fetchAdmins, fetchAllUsers]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    selectedAdmin, selectedUser, search, leadStatusFilter, stageFilter, priorityFilter,
    serviceFilter, sourceFilter, statusFilter, customerLevelFilter, callTypeFilter,
    followUpTypeFilter, sectorFilter, fromDate, toDate,
  ]);

  // ─────────────────────────
  // Filter logic
  // ─────────────────────────
  const usersUnderAdmin =
    selectedAdmin === "ALL"
      ? allUsers
      : allUsers.filter(u =>
          u.createdBy?._id === selectedAdmin || u.createdBy === selectedAdmin
        );

  const filtered = customers.filter(c => {
    const createdById = typeof c.createdBy === "object"
      ? c.createdBy?._id?.toString()
      : c.createdBy?.toString();

    if (selectedAdmin !== "ALL") {
      const adminUserIds = usersUnderAdmin.map(u => u._id?.toString());
      if (createdById !== selectedAdmin && !adminUserIds.includes(createdById)) return false;
    }

    if (selectedUser !== "ALL" && createdById !== selectedUser) return false;

    const searchLower = search.toLowerCase();
    if (search && !`${c.name} ${c.company} ${c.phoneNumber} ${c.email}`.toLowerCase().includes(searchLower)) return false;
    if (leadStatusFilter === "Pending") {
      if (c.leadStatus === "Quotation Shared" || c.leadStatus === "Closed") return false;
    } else if (leadStatusFilter && c.leadStatus !== leadStatusFilter) {
      return false;
    }
    if (stageFilter && c.leadStage !== stageFilter) return false;
    if (priorityFilter && c.priority !== priorityFilter) return false;

    if (serviceFilter && c.service !== serviceFilter) return false;
    if (sourceFilter && c.source !== sourceFilter) return false;
    if (statusFilter && c.status !== statusFilter) return false;
    if (customerLevelFilter && c.customerLevel !== customerLevelFilter) return false;
    if (callTypeFilter && c.callType !== callTypeFilter) return false;
    if (followUpTypeFilter && c.followUpType !== followUpTypeFilter) return false;
    if (sectorFilter && !(c.sector || "").toLowerCase().includes(sectorFilter.toLowerCase())) return false;

    if (fromDate || toDate) {
      const created = new Date(c.createdAt);
      if (fromDate && created < new Date(fromDate)) return false;
      if (toDate) {
        const end = new Date(toDate);
        end.setHours(23, 59, 59, 999);
        if (created > end) return false;
      }
    }

    return true;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated  = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const clearAllFilters = () => {
    setSearch(""); setLeadStatusFilter(""); setStageFilter(""); setPriorityFilter("");
    setSelectedAdmin("ALL"); setSelectedUser("ALL");
    setServiceFilter(""); setSourceFilter(""); setStatusFilter("");
    setCustomerLevelFilter(""); setCallTypeFilter(""); setFollowUpTypeFilter("");
    setSectorFilter(""); setFromDate(""); setToDate("");
  };

  const hasFilters =
    search || leadStatusFilter || stageFilter || priorityFilter ||
    selectedAdmin !== "ALL" || selectedUser !== "ALL" ||
    serviceFilter || sourceFilter || statusFilter || customerLevelFilter ||
    callTypeFilter || followUpTypeFilter || sectorFilter || fromDate || toDate;

  // ─────────────────────────
  // Download filtered customers as Excel
  // ─────────────────────────
  const downloadExcel = () => {
    const exportData = filtered.map((customer) => {
      const baseData = {
        Name: customer.name,
        Company: customer.company,
        PhoneNumber: customer.phoneNumber,
        Email: customer.email,
        Service: customer.service,
        ServiceNumber: customer.serviceNumber || "",
        Status: customer.status,
        CustomerLevel: customer.customerLevel,
        CallType: customer.callType,
        LeadStatus: customer.leadStatus,
        FollowUpType: customer.followUpType,
        FollowUpDate: customer.followUpDate
          ? new Date(customer.followUpDate).toLocaleDateString()
          : "",
        LeadStage: customer.leadStage,
        Priority: customer.priority,
        Source: customer.source,
        AssignedTo: customer.assignedTo || "",
        OwnedBy: customer.createdBy?.name || "",
        Admin: admins.find(a =>
          a._id === (typeof customer.createdBy === "object"
            ? customer.createdBy?.createdBy?._id || customer.createdBy?.createdBy
            : null)
        )?.name || "",
        Sector: customer.sector || "",
        Expense: customer.expense || "",
        Remark: customer.remark || "",
        CreatedDate: customer.createdAt
          ? new Date(customer.createdAt).toLocaleString()
          : "",
      };

      if (customer.leadStatus === "Quotation Shared") {
        return {
          ...baseData,
          WhatsAppShared: customer.quotationShared?.whatsappShared ? "Yes" : "No",
          EmailShared: customer.quotationShared?.emailShared ? "Yes" : "No",
          GSTType: customer.quotationShared?.gstType || "",
          QuotationNumber: customer.quotationShared?.quotationNumber || "",
        };
      }

      if (customer.leadStatus === "Closed") {
        return {
          ...baseData,
          ClosedType: customer.closedDetails?.closedType || "",
          Engineers: customer.closedDetails?.engineers?.join(", ") || "",
          FieldEngineer: customer.closedDetails?.fieldEngineer || "",
          InvoiceNumber: customer.closedDetails?.invoiceNumber || "",
          OutsourceName: customer.closedDetails?.outsourceName || "",
          OutsourceDate: customer.closedDetails?.outsourceDate
            ? new Date(customer.closedDetails.outsourceDate).toLocaleDateString()
            : "",
          InternalName: customer.closedDetails?.internalName || "",
          InternalDate: customer.closedDetails?.internalDate
            ? new Date(customer.closedDetails.internalDate).toLocaleDateString()
            : "",
          BottomLine: customer.closedDetails?.bottomLine || "",
          AccountManagerName: customer.closedDetails?.bottomLineAllocation?.accountManagerName || "",
          AccountManagerAmount: customer.closedDetails?.bottomLineAllocation?.accountManagerAmount || 0,
          BackendSupportName: customer.closedDetails?.bottomLineAllocation?.backendSupportName || "",
          BackendSupportAmount: customer.closedDetails?.bottomLineAllocation?.backendSupportAmount || 0,
          ServiceDeliveryName: customer.closedDetails?.bottomLineAllocation?.serviceDeliveryName || "",
          ServiceDeliveryAmount: customer.closedDetails?.bottomLineAllocation?.serviceDeliveryAmount || 0,
        };
      }

      return baseData;
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Customers");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const file = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(file, "Customers.xlsx");
  };

  // ─────────────────────────
  // Badge helpers
  // ─────────────────────────
  const leadStatusClass = (s) => {
    const map = {
      "Closed":           "sac-badge-green",
      "Quotation Shared": "sac-badge-blue",
      "Not Interested":   "sac-badge-red",
      "Follow Up":        "sac-badge-yellow",
    };
    return map[s] || "sac-badge-gray";
  };

  const priorityClass = (p) =>
    ({ High: "sac-badge-red", Medium: "sac-badge-yellow", Low: "sac-badge-green" }[p] || "sac-badge-gray");

  const openEdit   = (c) => { setSelectedCustomer(c); setShowEdit(true); };
  const openView   = (c) => { setSelectedCustomer(c); setShowDetails(true); };
  const openAssign = (c) => { setSelectedCustomer(c); setShowReassign(true); };
  const openDelete = (c) => { setSelectedCustomer(c); setShowDelete(true); };

  // ─────────────────────────
  // Render
  // ─────────────────────────
  return (
    <div className="sac-page">

      {/* ── Header ── */}
      <div className="sac-header">
        <div>
          <h2 className="sac-title">All Customers</h2>
          <p className="sac-subtitle">SuperAdmin — Create · Edit · Reassign · Delete customers</p>
        </div>
        <div className="sac-header-actions">
          <button className="sac-btn-secondary" onClick={downloadExcel}>
            <FaDownload /> Download
          </button>
          <button className="sac-btn-primary" onClick={() => setShowCreate(true)}>
            <FaPlus /> Add Customer
          </button>
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div className="sac-filters">
        <div className="sac-search-wrap">
          <FaSearch className="sac-search-icon" />
          <input
            className="sac-search"
            placeholder="Search name / company / phone / email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="sac-search-clear" onClick={() => setSearch("")}>
              <FaTimes />
            </button>
          )}
        </div>

        <select className="sac-select-filter" value={selectedAdmin}
          onChange={e => { setSelectedAdmin(e.target.value); setSelectedUser("ALL"); }}>
          <option value="ALL">All Admins</option>
          {admins.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
        </select>

        {selectedAdmin !== "ALL" && (
          <select className="sac-select-filter" value={selectedUser}
            onChange={e => setSelectedUser(e.target.value)}>
            <option value="ALL">All Users</option>
            {usersUnderAdmin.map(u => (
              <option key={u._id} value={u._id}>{u.name || u.username}</option>
            ))}
          </select>
        )}

        <select className="sac-select-filter" value={leadStatusFilter}
          onChange={e => setLeadStatusFilter(e.target.value)}>
          <option value="">All Lead Status</option>
          {["Quotation Shared", "Closed", "Pending"].map(s => (
            <option key={s}>{s}</option>
          ))}
        </select>

        <select className="sac-select-filter" value={stageFilter}
          onChange={e => setStageFilter(e.target.value)}>
          <option value="">All Stages</option>
          {["Awareness", "Interest", "Desire", "Closure"].map(s => (
            <option key={s}>{s}</option>
          ))}
        </select>

        <select className="sac-select-filter" value={priorityFilter}
          onChange={e => setPriorityFilter(e.target.value)}>
          <option value="">All Priority</option>
          {["High", "Medium", "Low"].map(p => <option key={p}>{p}</option>)}
        </select>

        <select className="sac-select-filter" value={serviceFilter}
          onChange={e => setServiceFilter(e.target.value)}>
          <option value="">All Service</option>
          {["Service", "Product", "Solution", "Service + Product"].map(s => (
            <option key={s}>{s}</option>
          ))}
        </select>

        <select className="sac-select-filter" value={sourceFilter}
          onChange={e => setSourceFilter(e.target.value)}>
          <option value="">All Source</option>
          {["Website", "Referral", "Expo", "Social media"].map(s => (
            <option key={s}>{s}</option>
          ))}
        </select>

        <select className="sac-select-filter" value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          {["Waiting for Internal", "Waiting for External", "Waiting for Customer"].map(s => (
            <option key={s}>{s}</option>
          ))}
        </select>

        <select className="sac-select-filter" value={customerLevelFilter}
          onChange={e => setCustomerLevelFilter(e.target.value)}>
          <option value="">Customer Level</option>
          {["New", "Old"].map(s => <option key={s}>{s}</option>)}
        </select>

        <select className="sac-select-filter" value={callTypeFilter}
          onChange={e => setCallTypeFilter(e.target.value)}>
          <option value="">Call Type</option>
          {["AMC", "Service", "Sale", "Presales"].map(s => <option key={s}>{s}</option>)}
        </select>

        <select className="sac-select-filter" value={followUpTypeFilter}
          onChange={e => setFollowUpTypeFilter(e.target.value)}>
          <option value="">Follow Up</option>
          {["Payment", "Calls", "Both"].map(s => <option key={s}>{s}</option>)}
        </select>

        <input
          type="text"
          className="sac-select-filter"
          placeholder="Sector"
          value={sectorFilter}
          onChange={e => setSectorFilter(e.target.value)}
        />

        <input
          type="date"
          className="sac-select-filter"
          value={fromDate}
          onChange={e => setFromDate(e.target.value)}
        />

        <input
          type="date"
          className="sac-select-filter"
          value={toDate}
          onChange={e => setToDate(e.target.value)}
        />

        {hasFilters && (
          <button className="sac-clear-btn" onClick={clearAllFilters}>
            <FaTimes /> Clear All
          </button>
        )}
      </div>

      {/* ── Scope banner ── */}
      {(selectedAdmin !== "ALL" || selectedUser !== "ALL") && (
        <div className="sac-scope-banner">
          <span>
            <FaFilter style={{ marginRight: 6, opacity: 0.7 }} />
            Filtering:&nbsp;<strong>{admins.find(a => a._id === selectedAdmin)?.name || "Selected Admin"}</strong>
            {selectedUser !== "ALL" && (
              <>&nbsp;›&nbsp;<strong>{allUsers.find(u => u._id === selectedUser)?.name || "Selected User"}</strong></>
            )}
          </span>
          <button className="sac-clear-scope" onClick={() => { setSelectedAdmin("ALL"); setSelectedUser("ALL"); }}>
            Clear
          </button>
        </div>
      )}

      {/* ── Count ── */}
      <p className="sac-count">
        Showing <strong>{filtered.length}</strong> customer{filtered.length !== 1 ? "s" : ""}
        {customers.length !== filtered.length && ` (of ${customers.length} total)`}
      </p>

      {/* ── Table ── */}
      <div className="sac-table-wrap">
        {loading ? (
          <div className="sac-loading">Loading customers…</div>
        ) : (
          <table className="sac-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Company</th>
                <th>Phone</th>
                <th>Lead Status</th>
                <th>Stage</th>
                <th>Priority</th>
                <th>Assigned To</th>
                <th>Follow-up</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={10} className="sac-empty">
                    {hasFilters ? "No customers match your filters." : "No customers found."}
                  </td>
                </tr>
              ) : (
                paginated.map((c, i) => (
                  <tr key={c._id}>
                    <td>{(currentPage - 1) * perPage + i + 1}</td>
                    <td><strong>{c.name || "—"}</strong></td>
                    <td>{c.company || "—"}</td>
                    <td>{c.phoneNumber || "—"}</td>
                    <td>
                      <span className={`sac-badge ${leadStatusClass(c.leadStatus)}`}>
                        {c.leadStatus || "—"}
                      </span>
                    </td>
                    <td>{c.leadStage || "—"}</td>
                    <td>
                      <span className={`sac-badge ${priorityClass(c.priority)}`}>
                        {c.priority || "—"}
                      </span>
                    </td>
                    <td>
                      <span className="sac-assigned-cell">
                        <FaUserAlt style={{ fontSize: "0.7rem", opacity: 0.5 }} />
                        {typeof c.createdBy === "object"
                          ? (c.createdBy?.name || c.createdBy?.username || "—")
                          : "—"}
                      </span>
                    </td>
                    <td>
                      {c.followUpDate
                        ? new Date(c.followUpDate).toLocaleDateString("en-IN")
                        : "—"}
                    </td>
                    <td>
                      <div className="sac-action-btns">
                        <button title="View Details" className="sac-icon-btn sac-view" onClick={() => openView(c)}>
                          <FaEye />
                        </button>
                        <button title="Edit" className="sac-icon-btn sac-edit" onClick={() => openEdit(c)}>
                          <FaEdit />
                        </button>
                        <button title="Reassign User" className="sac-icon-btn sac-reassign" onClick={() => openAssign(c)}>
                          <FaExchangeAlt />
                        </button>
                        <button title="Delete" className="sac-icon-btn sac-delete" onClick={() => openDelete(c)}>
                          <FaTrash />
                        </button>
                      </div>
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
        <div className="sac-pagination">
          <button className="sac-page-btn" disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}>‹ Prev</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p}
              className={`sac-page-btn ${p === currentPage ? "sac-page-active" : ""}`}
              onClick={() => setCurrentPage(p)}>{p}</button>
          ))}
          <button className="sac-page-btn" disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}>Next ›</button>
        </div>
      )}

      {/* ── Modals ── */}

      {/* CREATE — uses CreateCustomerModal pointed at superadmin endpoint */}
      {showCreate && (
        <CreateCustomerModal
          apiEndpoint={SA_CUSTOMERS_ENDPOINT}
          refresh={fetchCustomers}
          closeModal={() => setShowCreate(false)}
        />
      )}

      {/* EDIT — uses EditCustomerModal pointed at superadmin endpoint */}
      {showEdit && selectedCustomer && (
        <EditCustomerModal
          customer={selectedCustomer}
          apiEndpoint={SA_CUSTOMERS_ENDPOINT}
          refresh={fetchCustomers}
          closeModal={() => { setShowEdit(false); setSelectedCustomer(null); }}
        />
      )}

      {/* VIEW DETAILS — shared CustomerDetailsModal */}
      {showDetails && selectedCustomer && (
        <CustomerDetailsModal
          customer={selectedCustomer}
          closeModal={() => { setShowDetails(false); setSelectedCustomer(null); }}
          onEdit={() => {
            setShowDetails(false);
            openEdit(selectedCustomer);
          }}
        />
      )}

      {/* REASSIGN */}
      {showReassign && selectedCustomer && (
        <ReassignModal
          customer={selectedCustomer}
          allUsers={allUsers}
          admins={admins}
          onClose={() => { setShowReassign(false); setSelectedCustomer(null); }}
          onReassigned={fetchCustomers}
        />
      )}

      {/* DELETE */}
      {showDelete && selectedCustomer && (
        <DeleteConfirmModal
          customer={selectedCustomer}
          onClose={() => { setShowDelete(false); setSelectedCustomer(null); }}
          onDeleted={fetchCustomers}
        />
      )}
    </div>
  );
};

export default SuperAdminCustomers;