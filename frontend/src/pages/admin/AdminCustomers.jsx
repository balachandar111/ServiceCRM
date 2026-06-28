import React, { useEffect, useState } from "react";
import API from "../../services/api";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import {
  FaPlus,
  FaDownload,
  FaUpload,
  FaEdit,
  FaTrash,
  FaEye,
  FaUserEdit,
} from "react-icons/fa";

import CreateCustomerModal from "../user/CreateCustomerModal";
import EditCustomerModal from "../user/EditCustomerModel";
import CustomerDetailsModal from "../user/CustomerDetailsModal";

import "../user/UserCustomers.css";

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [customerLevelFilter, setCustomerLevelFilter] = useState("");
  const [callTypeFilter, setCallTypeFilter] = useState("");
  const [leadStatusFilter, setLeadStatusFilter] = useState("");
  const [followUpTypeFilter, setFollowUpTypeFilter] = useState("");
  const [sectorFilter, setSectorFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [uploading, setUploading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const customersPerPage = 10;

  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Reassign modal state
  const [showReassign, setShowReassign] = useState(false);
  const [reassignCustomer, setReassignCustomer] = useState(null);
  const [reassignUserId, setReassignUserId] = useState("");
  const [reassigning, setReassigning] = useState(false);

  useEffect(() => {
    fetchCustomers();
    fetchUsers();
  }, []);

  const bulkUploadCustomers = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      setUploading(true);
      const { data } = await API.post("/customers/bulk-upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert(data.message);
      fetchCustomers();
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Bulk Upload Failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/customers");
      setCustomers(data.data || []);
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

  const deleteCustomer = async (id) => {
    if (!window.confirm("Delete Customer?")) return;
    try {
      await API.delete(`/customers/${id}`);
      fetchCustomers();
    } catch (error) {
      console.log(error);
    }
  };

  // Open reassign modal
  const openReassign = (customer) => {
    setReassignCustomer(customer);
    // Pre-select the current assigned user if found
    const currentUser = users.find(
      (u) =>
        u._id === customer.createdBy?._id ||
        u.name === customer.assignedTo
    );
    setReassignUserId(currentUser?._id || "");
    setShowReassign(true);
  };

  // Perform reassign
  const handleReassign = async () => {
    if (!reassignUserId) {
      alert("Please select a user to reassign to.");
      return;
    }
    const targetUser = users.find((u) => u._id === reassignUserId);
    try {
      setReassigning(true);
      await API.patch(`/customers/${reassignCustomer._id}/reassign`, {
        userId: reassignUserId,
        assignedTo: targetUser?.name || "",
      });
      alert(
        `Customer "${reassignCustomer.name}" has been reassigned to ${targetUser?.name}.`
      );
      setShowReassign(false);
      setReassignCustomer(null);
      fetchCustomers();
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Reassign failed");
    } finally {
      setReassigning(false);
    }
  };

  const downloadExcel = () => {
    const exportData = filteredCustomers.map((customer) => {
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

  const filteredCustomers = customers.filter((customer) => {
    const searchMatch =
      (customer.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (customer.company || "").toLowerCase().includes(search.toLowerCase()) ||
      (customer.phoneNumber || "").toLowerCase().includes(search.toLowerCase()) ||
      (customer.email || "").toLowerCase().includes(search.toLowerCase());

    const userMatch = userFilter
      ? customer.createdBy?._id === userFilter
      : true;

    const serviceMatch = serviceFilter
      ? customer.service === serviceFilter
      : true;
    const priorityMatch = priorityFilter
      ? customer.priority === priorityFilter
      : true;
    const sourceMatch = sourceFilter ? customer.source === sourceFilter : true;
    const stageMatch = stageFilter ? customer.leadStage === stageFilter : true;
    const statusMatch = statusFilter ? customer.status === statusFilter : true;
    const customerLevelMatch = customerLevelFilter
      ? customer.customerLevel === customerLevelFilter
      : true;
    const callTypeMatch = callTypeFilter
      ? customer.callType === callTypeFilter
      : true;
    const leadStatusMatch = leadStatusFilter
      ? customer.leadStatus === leadStatusFilter
      : true;
    const followUpMatch = followUpTypeFilter
      ? customer.followUpType === followUpTypeFilter
      : true;
    const sectorMatch = sectorFilter
      ? (customer.sector || "")
          .toLowerCase()
          .includes(sectorFilter.toLowerCase())
      : true;

    const dateMatch = (() => {
      if (!fromDate && !toDate) return true;
      const created = new Date(customer.createdAt);
      if (fromDate && created < new Date(fromDate)) return false;
      if (toDate) {
        const end = new Date(toDate);
        end.setHours(23, 59, 59, 999);
        if (created > end) return false;
      }
      return true;
    })();

    return (
      searchMatch &&
      userMatch &&
      serviceMatch &&
      priorityMatch &&
      sourceMatch &&
      stageMatch &&
      statusMatch &&
      customerLevelMatch &&
      callTypeMatch &&
      leadStatusMatch &&
      followUpMatch &&
      sectorMatch &&
      dateMatch
    );
  });

  const indexOfLast = currentPage * customersPerPage;
  const indexOfFirst = indexOfLast - customersPerPage;
  const currentCustomers = filteredCustomers.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredCustomers.length / customersPerPage);

  return (
    <div className="customers-page">
      <div className="page-header">
        <div>
          <h1>Customer Management</h1>
          <p>Admin view — manage and reassign customers across all users</p>
        </div>
      </div>

      <div className="toolbar">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="search-box"
        />

        <button className="download-btn" onClick={downloadExcel}>
          <FaDownload /> Download
        </button>

        <label className="upload-btn">
          <FaUpload />
          {uploading ? "Uploading..." : "Bulk Upload"}
          <input
            type="file"
            accept=".xlsx,.xls"
            hidden
            onChange={bulkUploadCustomers}
          />
        </label>

        <button className="create-btn" onClick={() => setShowCreate(true)}>
          <FaPlus /> Add Customer
        </button>
      </div>

      <div className="filters">
        <h2>Custom Filters</h2>

        <select
          value={userFilter}
          onChange={(e) => setUserFilter(e.target.value)}
        >
          <option value="">All Users</option>
          {users.map((user) => (
            <option key={user._id} value={user._id}>
              {user.name}
            </option>
          ))}
        </select>

        <select
          value={serviceFilter}
          onChange={(e) => setServiceFilter(e.target.value)}
        >
          <option value="">All Service</option>
          <option>Service</option>
          <option>Product</option>
          <option>Solution</option>
          <option>Service + Product</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
        >
          <option value="">Priority</option>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>

        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
        >
          <option value="">Source</option>
          <option>Website</option>
          <option>Referral</option>
          <option>Expo</option>
          <option>Social media</option>
        </select>

        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
        >
          <option value="">Lead Stage</option>
          <option>Awareness</option>
          <option>Interest</option>
          <option>Desire</option>
          <option>Closure</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Status</option>
          <option>Waiting for Internal</option>
          <option>Waiting for External</option>
          <option>Waiting for Customer</option>
        </select>

        <select
          value={customerLevelFilter}
          onChange={(e) => setCustomerLevelFilter(e.target.value)}
        >
          <option value="">Customer Level</option>
          <option>New</option>
          <option>Old</option>
        </select>

        <select
          value={callTypeFilter}
          onChange={(e) => setCallTypeFilter(e.target.value)}
        >
          <option value="">Call Type</option>
          <option>AMC</option>
          <option>Service</option>
          <option>Sale</option>
          <option>Presales</option>
        </select>

        <select
          value={leadStatusFilter}
          onChange={(e) => setLeadStatusFilter(e.target.value)}
        >
          <option value="">Lead Status</option>
          <option>Quotation Shared</option>
          <option>Closed</option>
          <option>Pending</option>
        </select>

        <select
          value={followUpTypeFilter}
          onChange={(e) => setFollowUpTypeFilter(e.target.value)}
        >
          <option value="">Follow Up</option>
          <option>Payment</option>
          <option>Calls</option>
          <option>Both</option>
        </select>

        <input
          type="text"
          placeholder="Sector"
          value={sectorFilter}
          onChange={(e) => setSectorFilter(e.target.value)}
        />

        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
        />

        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
        />

        <button
          className="clear-btn"
          onClick={() => {
            setSearch("");
            setUserFilter("");
            setServiceFilter("");
            setPriorityFilter("");
            setSourceFilter("");
            setStageFilter("");
            setStatusFilter("");
            setCustomerLevelFilter("");
            setCallTypeFilter("");
            setLeadStatusFilter("");
            setFollowUpTypeFilter("");
            setSectorFilter("");
            setFromDate("");
            setToDate("");
          }}
        >
          Clear
        </button>
      </div>

      <div className="table-wrapper">
        <table className="crm-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Company</th>
              <th>Phone</th>
              <th>Priority</th>
              <th>Stage</th>
              <th>Assigned To</th>
              <th>Owned By</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", padding: 30 }}>
                  Loading...
                </td>
              </tr>
            ) : currentCustomers.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", padding: 30 }}>
                  No Customers Found
                </td>
              </tr>
            ) : (
              currentCustomers.map((customer) => (
                <tr key={customer._id}>
                  <td>{customer.name}</td>
                  <td>{customer.company}</td>
                  <td>{customer.phoneNumber}</td>
                  <td>{customer.priority}</td>
                  <td>{customer.leadStage}</td>
                  <td>{customer.assignedTo || "—"}</td>
                  <td>{customer.createdBy?.name || "—"}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="view-btn"
                        title="View"
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setShowDetails(true);
                        }}
                      >
                        <FaEye />
                      </button>

                      <button
                        className="edit-btn"
                        title="Edit"
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setShowEdit(true);
                        }}
                      >
                        <FaEdit />
                      </button>

                      <button
                        className="reassign-btn"
                        title="Reassign to User"
                        onClick={() => openReassign(customer)}
                        style={{
                          background: "#7c3aed",
                          color: "#fff",
                          border: "none",
                          borderRadius: 6,
                          padding: "6px 10px",
                          cursor: "pointer",
                          fontSize: 13,
                        }}
                      >
                        <FaUserEdit />
                      </button>

                      <button
                        className="delete-btn"
                        title="Delete"
                        onClick={() => deleteCustomer(customer._id)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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

      {/* ── REASSIGN MODAL ── */}
      {showReassign && reassignCustomer && (
        <div className="modal-overlay">
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 32,
              minWidth: 360,
              maxWidth: 440,
              boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
            }}
          >
            <h2 style={{ marginBottom: 6, fontSize: 20 }}>Reassign Customer</h2>
            <p style={{ color: "#6b7280", marginBottom: 20, fontSize: 14 }}>
              Reassigning{" "}
              <strong style={{ color: "#111" }}>{reassignCustomer.name}</strong>.
              The customer will move to the selected user's view.
            </p>

            <div style={{ marginBottom: 8 }}>
              <label
                style={{ fontWeight: 600, fontSize: 13, display: "block", marginBottom: 6 }}
              >
                Current Owner
              </label>
              <div
                style={{
                  padding: "8px 12px",
                  background: "#f3f4f6",
                  borderRadius: 6,
                  fontSize: 14,
                  color: "#374151",
                }}
              >
                {reassignCustomer.createdBy?.name || "—"}
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label
                style={{ fontWeight: 600, fontSize: 13, display: "block", marginBottom: 6, marginTop: 14 }}
              >
                Assign To
              </label>
              <select
                value={reassignUserId}
                onChange={(e) => setReassignUserId(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: 6,
                  border: "1.5px solid #d1d5db",
                  fontSize: 14,
                  outline: "none",
                }}
              >
                <option value="">— Select User —</option>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={handleReassign}
                disabled={reassigning}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  background: "#7c3aed",
                  color: "#fff",
                  border: "none",
                  borderRadius: 7,
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: reassigning ? "not-allowed" : "pointer",
                  opacity: reassigning ? 0.7 : 1,
                }}
              >
                {reassigning ? "Reassigning..." : "Confirm Reassign"}
              </button>
              <button
                onClick={() => {
                  setShowReassign(false);
                  setReassignCustomer(null);
                }}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  background: "#f3f4f6",
                  color: "#374151",
                  border: "none",
                  borderRadius: 7,
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreate && (
        <CreateCustomerModal
          refresh={fetchCustomers}
          closeModal={() => setShowCreate(false)}
        />
      )}

      {showEdit && (
        <EditCustomerModal
          customer={selectedCustomer}
          refresh={fetchCustomers}
          closeModal={() => setShowEdit(false)}
        />
      )}

      {showDetails && (
        <CustomerDetailsModal
          customer={selectedCustomer}
          closeModal={() => setShowDetails(false)}
        />
      )}
    </div>
  );
};

export default AdminCustomers;