import React, { useEffect, useState } from "react";
import API from "../../services/api";

const Approvals = () => {
  const [approvals, setApprovals] = useState([]);
  const [statusFilter, setStatusFilter] = useState("Pending");
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    fetchApprovals();
  }, [statusFilter]);

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/approvals", {
        params: statusFilter ? { status: statusFilter } : {},
      });
      setApprovals(data.data || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const approveRequest = async (id) => {
    if (!window.confirm("Approve this reassignment?")) return;
    setBusyId(id);
    try {
      const { data } = await API.put(`/approvals/${id}/approve`);
      alert(data.message || "Reassignment Approved Successfully");
      fetchApprovals();
    } catch (error) {
      alert(error.response?.data?.message || "Approval Failed");
    } finally {
      setBusyId(null);
    }
  };

  const rejectRequest = async (id) => {
    if (!window.confirm("Reject this reassignment?")) return;
    setBusyId(id);
    try {
      await API.put(`/approvals/${id}/reject`);
      alert("Reassignment Rejected");
      fetchApprovals();
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

  return (
    <div className="approvals-page">
      <div className="page-header">
        <div>
          <h1>Reassignment Approvals</h1>
          <p>
            Review "Assigned To" change requests raised by users while editing a
            customer
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
              <th>Requested By</th>
              <th>From</th>
              <th>To</th>
              <th>Status</th>
              <th>Requested On</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: 30 }}>
                  Loading...
                </td>
              </tr>
            ) : approvals.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: 30 }}>
                  No Approval Requests Found
                </td>
              </tr>
            ) : (
              approvals.map((item) => (
                <tr key={item._id}>
                  <td>
                    {item.customer?.name || item.customerName || "—"}
                    {item.customer?.company
                      ? ` (${item.customer.company})`
                      : ""}
                  </td>

                  <td>{item.requestedBy?.name || "—"}</td>

                  <td>{item.previousAssignedTo || "Unassigned"}</td>
                  <td>{item.requestedAssignedTo || "Unassigned"}</td>

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
                          onClick={() => approveRequest(item._id)}
                        >
                          Approve
                        </button>

                        <button
                          className="reject-btn"
                          disabled={busyId === item._id}
                          onClick={() => rejectRequest(item._id)}
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <span className="reviewed-note">
                        {item.reviewedBy?.name
                          ? `By ${item.reviewedBy.name}`
                          : "—"}
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

export default Approvals;
