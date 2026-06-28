// SuperAdminIncentive.jsx
// SuperAdmin can view and approve/reject ALL incentive approval requests
// across every admin and user in the system.

import React, { useEffect, useState } from "react";
import API from "../../services/api";

const SuperAdminIncentive = () => {
  const [approvals,    setApprovals]    = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading,      setLoading]      = useState(false);
  const [busyId,       setBusyId]       = useState(null);

  useEffect(() => {
    fetchIncentives();
  }, [statusFilter]);

  const fetchIncentives = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/superadmin-dashboard/incentive-approvals", {
        params: statusFilter ? { status: statusFilter } : {},
      });
      setApprovals(data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const approveIncentive = async (id) => {
    if (!window.confirm("Approve this incentive allocation?")) return;
    setBusyId(id);
    try {
      const { data } = await API.put(`/superadmin-dashboard/incentive-approvals/${id}/approve`);
      alert(data.message || "Incentive Approved");
      fetchIncentives();
    } catch (error) {
      alert(error.response?.data?.message || "Approval Failed");
    } finally {
      setBusyId(null);
    }
  };

  const rejectIncentive = async (id) => {
    if (!window.confirm("Reject this incentive allocation?")) return;
    setBusyId(id);
    try {
      await API.put(`/superadmin-dashboard/incentive-approvals/${id}/reject`);
      alert("Incentive Rejected");
      fetchIncentives();
    } catch (error) {
      alert(error.response?.data?.message || "Rejection Failed");
    } finally {
      setBusyId(null);
    }
  };

  const badgeClass = (status) => {
    if (status === "Approved") return "active-badge";
    if (status === "Rejected") return "inactive-badge";
    return "pending-badge";
  };

  const formatAllocation = (item) => {
    const alloc = item.customer?.closedDetails?.bottomLineAllocation;
    if (!alloc) return "—";
    const parts = [];
    if (alloc.accountManagerName)
      parts.push(`AM: ${alloc.accountManagerName} (₹${alloc.accountManagerAmount || 0})`);
    if (alloc.backendSupportName)
      parts.push(`BS: ${alloc.backendSupportName} (₹${alloc.backendSupportAmount || 0})`);
    if (alloc.serviceDeliveryName)
      parts.push(`SD: ${alloc.serviceDeliveryName} (₹${alloc.serviceDeliveryAmount || 0})`);
    return parts.join(" | ") || "—";
  };

  return (
    <div className="approvals-page">
      <div className="page-header">
        <div>
          <h1>Incentive Approvals</h1>
          <p>
            SuperAdmin — Review all bottom-line allocation requests raised when a customer deal is closed
          </p>
        </div>
      </div>

      <div className="filters">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>

        <button className="clear-btn" onClick={() => setStatusFilter("")}>
          Clear Filter
        </button>
      </div>

      <div className="table-wrapper">
        <table className="crm-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Bottom Line</th>
              <th>Allocation</th>
              <th>Requested By</th>
              <th>Admin</th>
              <th>Status</th>
              <th>Requested On</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", padding: 30 }}>
                  Loading...
                </td>
              </tr>
            ) : approvals.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", padding: 30 }}>
                  No Incentive Requests Found
                </td>
              </tr>
            ) : (
              approvals.map((item) => (
                <tr key={item._id}>
                  <td>
                    <strong>{item.customer?.name || item.customerName || "—"}</strong>
                    {item.customer?.company ? (
                      <div style={{ fontSize: 12, color: "#6b7280" }}>
                        {item.customer.company}
                      </div>
                    ) : null}
                  </td>

                  <td>
                    {item.customer?.closedDetails?.bottomLine
                      ? `₹${parseFloat(item.customer.closedDetails.bottomLine).toLocaleString()}`
                      : "—"}
                  </td>

                  <td style={{ fontSize: 12, maxWidth: 260, whiteSpace: "pre-wrap" }}>
                    {formatAllocation(item)}
                  </td>

                  <td>{item.requestedBy?.name || "—"}</td>

                  {/* Show which admin the requesting user belongs to */}
                  <td style={{ fontSize: 12, color: "#6b7280" }}>
                    {item.requestedBy?.createdBy?.name || "—"}
                  </td>

                  <td>
                    <span className={badgeClass(item.status)}>
                      {item.status}
                    </span>
                  </td>

                  <td>
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleString()
                      : "—"}
                  </td>

                  <td>
                    {item.status === "Pending" ? (
                      <>
                        <button
                          className="approve-btn"
                          disabled={busyId === item._id}
                          onClick={() => approveIncentive(item._id)}
                        >
                          Approve
                        </button>

                        <button
                          className="reject-btn"
                          disabled={busyId === item._id}
                          onClick={() => rejectIncentive(item._id)}
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <span className="reviewed-note">
                        {item.reviewedBy?.name
                          ? `By ${item.reviewedBy.name}`
                          : item.status}
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SuperAdminIncentive;