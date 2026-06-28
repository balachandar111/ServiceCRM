import React, { useEffect, useState } from "react";
import API from "../../services/api";
import "./CustomerDetailsModal.css";

const CustomerDetailsModal = ({
  customer,
  closeModal,
  onEdit,
  onDelete,
}) => {
  const [incentiveApproval, setIncentiveApproval] = useState(null);

  useEffect(() => {
    if (customer?._id && customer.leadStatus === "Closed") {
      API.get(`/approvals/customer/${customer._id}`)
        .then(({ data }) => setIncentiveApproval(data.data || null))
        .catch(() => {});
    }
  }, [customer]);

  if (!customer) return null;

  const approvalBadge = (status) => {
    const styles = {
      Approved: { background: "#dcfce7", color: "#16a34a" },
      Rejected: { background: "#fee2e2", color: "#dc2626" },
      Pending:  { background: "#fef9c3", color: "#92400e" },
    };
    return styles[status] || styles.Pending;
  };

  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="details-modal" onClick={(e) => e.stopPropagation()}>

        <div className="modal-header">
          <h2>Customer Details</h2>
          <button className="close-btn" onClick={closeModal}>✕</button>
        </div>

        <div className="details-body">

          {/* CUSTOMER INFO */}
          <div className="details-section">
            <h3>Customer Information</h3>
            <div className="details-grid">
              <div><label>Name</label><p>{customer.name}</p></div>
              <div><label>Company</label><p>{customer.company || "-"}</p></div>
              <div><label>Phone Number</label><p>{customer.phoneNumber || "-"}</p></div>
              <div><label>Email</label><p>{customer.email || "-"}</p></div>
            </div>
          </div>

          {/* LEAD INFO */}
          <div className="details-section">
            <h3>Lead Information</h3>
            <div className="details-grid">
              <div><label>Service</label><p>{customer.service}</p></div>
              <div><label>Service Number</label><p>{customer.serviceNumber || "-"}</p></div>
              <div><label>Status</label><p>{customer.status}</p></div>
              <div><label>Customer Level</label><p>{customer.customerLevel}</p></div>
              <div><label>Call Type</label><p>{customer.callType}</p></div>
              <div><label>Lead Status</label>
                <p>
                  {customer.leadStatus === "Pending" ? (
                    <span style={{ display:"inline-block", padding:"2px 10px", borderRadius:12, fontSize:13, fontWeight:600, background:"#fef9c3", color:"#92400e" }}>
                      Pending
                    </span>
                  ) : customer.leadStatus}
                </p>
              </div>
              <div><label>Lead Stage</label><p>{customer.leadStage}</p></div>
              <div><label>Priority</label><p>{customer.priority}</p></div>
              <div><label>Source</label><p>{customer.source}</p></div>
            </div>
          </div>

          {/* FOLLOWUP */}
          <div className="details-section">
            <h3>Follow Up Details</h3>
            <div className="details-grid">
              <div><label>Follow Up Type</label><p>{customer.followUpType}</p></div>
              <div>
                <label>Follow Up Date &amp; Time</label>
                <p>{customer.followUpDate ? new Date(customer.followUpDate).toLocaleString() : "-"}</p>
              </div>
            </div>
          </div>

          {/* QUOTATION */}
          {customer.leadStatus === "Quotation Shared" && (
            <div className="details-section">
              <h3>Quotation Details</h3>
              <div className="details-grid">
                <div><label>WhatsApp Shared</label><p>{customer.quotationShared?.whatsappShared ? "Yes" : "No"}</p></div>
                <div><label>Email Shared</label><p>{customer.quotationShared?.emailShared ? "Yes" : "No"}</p></div>
                <div><label>GST Type</label><p>{customer.quotationShared?.gstType || "-"}</p></div>
                <div><label>Quotation Number</label><p>{customer.quotationShared?.quotationNumber || "-"}</p></div>
              </div>
            </div>
          )}

          {/* CLOSED DETAILS */}
          {customer.leadStatus === "Closed" && (
            <div className="details-section">
              <h3>
                Closed Details
                {customer.closedDetails?.closedType && (
                  <span
                    style={{
                      marginLeft: 10, fontSize: 12, padding: "3px 10px", borderRadius: 12,
                      background: customer.closedDetails.closedType === "internal" ? "#dbeafe" : "#fef3c7",
                      color: customer.closedDetails.closedType === "internal" ? "#1d4ed8" : "#92400e",
                    }}
                  >
                    {customer.closedDetails.closedType === "internal" ? "Internal Source" : "Outsource"}
                  </span>
                )}
              </h3>

              <div className="details-grid">
                <div><label>Engineers</label><p>{customer.closedDetails?.engineers?.join(", ") || "-"}</p></div>
                <div><label>Field Engineer</label><p>{customer.closedDetails?.fieldEngineer || "-"}</p></div>
                <div><label>Invoice Number</label><p>{customer.closedDetails?.invoiceNumber || "-"}</p></div>

                {customer.closedDetails?.closedType === "outsource" && (
                  <>
                    <div><label>Outsource Name</label><p>{customer.closedDetails?.outsourceName || "-"}</p></div>
                    <div>
                      <label>Outsource Date</label>
                      <p>{customer.closedDetails?.outsourceDate ? new Date(customer.closedDetails.outsourceDate).toLocaleDateString() : "-"}</p>
                    </div>
                  </>
                )}

                {customer.closedDetails?.closedType === "internal" && (
                  <>
                    <div><label>Internal Name</label><p>{customer.closedDetails?.internalName || "-"}</p></div>
                    <div>
                      <label>Internal Date</label>
                      <p>{customer.closedDetails?.internalDate ? new Date(customer.closedDetails.internalDate).toLocaleDateString() : "-"}</p>
                    </div>
                  </>
                )}
              </div>

              {/* BOTTOM LINE ALLOCATION */}
              {customer.closedDetails?.bottomLine && (
                <div style={{ marginTop: 16 }}>
                  <h4 style={{ margin: "0 0 10px", fontSize: 14, color: "#374151" }}>
                    Bottom Line Allocation
                    <span style={{ marginLeft: 10, fontWeight: 400, color: "#6b7280" }}>
                      Total: ₹{parseFloat(customer.closedDetails.bottomLine).toLocaleString()}
                    </span>
                  </h4>
                  <div className="details-grid">
                    {customer.closedDetails.bottomLineAllocation?.accountManagerName && (
                      <div>
                        <label>Account Manager</label>
                        <p>
                          {customer.closedDetails.bottomLineAllocation.accountManagerName}
                          <span style={{ color: "#6b7280", fontSize: 12, marginLeft: 6 }}>
                            (₹{customer.closedDetails.bottomLineAllocation.accountManagerAmount})
                          </span>
                        </p>
                      </div>
                    )}
                    {customer.closedDetails.bottomLineAllocation?.backendSupportName && (
                      <div>
                        <label>Backend Support</label>
                        <p>
                          {customer.closedDetails.bottomLineAllocation.backendSupportName}
                          <span style={{ color: "#6b7280", fontSize: 12, marginLeft: 6 }}>
                            (₹{customer.closedDetails.bottomLineAllocation.backendSupportAmount})
                          </span>
                        </p>
                      </div>
                    )}
                    {customer.closedDetails.bottomLineAllocation?.serviceDeliveryName && (
                      <div>
                        <label>Service &amp; Delivery</label>
                        <p>
                          {customer.closedDetails.bottomLineAllocation.serviceDeliveryName}
                          <span style={{ color: "#6b7280", fontSize: 12, marginLeft: 6 }}>
                            (₹{customer.closedDetails.bottomLineAllocation.serviceDeliveryAmount})
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* INCENTIVE APPROVAL STATUS */}
              {incentiveApproval && (
                <div
                  style={{
                    marginTop: 16,
                    padding: "14px 18px",
                    borderRadius: 12,
                    border: "1px solid #e5e7eb",
                    background: "#f9fafb",
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                  }}
                >
                  <span style={{ fontSize: 20 }}>🎁</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#374151" }}>
                      Incentive Approval Status
                    </p>
                    {incentiveApproval.reviewedBy?.name && (
                      <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6b7280" }}>
                        Reviewed by {incentiveApproval.reviewedBy.name}
                        {incentiveApproval.reviewedAt
                          ? ` on ${new Date(incentiveApproval.reviewedAt).toLocaleDateString()}`
                          : ""}
                      </p>
                    )}
                    {incentiveApproval.status === "Pending" && (
                      <p style={{ margin: "2px 0 0", fontSize: 12, color: "#92400e" }}>
                        Awaiting super admin review
                      </p>
                    )}
                  </div>
                  <span
                    style={{
                      padding: "5px 14px",
                      borderRadius: 50,
                      fontSize: 12,
                      fontWeight: 700,
                      ...approvalBadge(incentiveApproval.status),
                    }}
                  >
                    {incentiveApproval.status}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* ADDITIONAL INFO */}
          <div className="details-section">
            <h3>Additional Information</h3>
            <div className="details-grid">
              <div>
                <label>Assigned To</label>
                <p>{customer.assignedTo?.name || customer.assignedTo || "-"}</p>
              </div>
              <div><label>Sector</label><p>{customer.sector || "-"}</p></div>
              <div><label>Expense</label><p>{customer.expense || 0}</p></div>
              <div>
                <label>Created Date</label>
                <p>{customer.createdAt ? new Date(customer.createdAt).toLocaleString() : "-"}</p>
              </div>
            </div>
            <div className="remarks-box">
              <label>Remarks</label>
              <p>{customer.remark || "No Remarks"}</p>
            </div>
          </div>

        </div>

        {(onEdit || onDelete) && (
          <div className="popup-actions" style={{ display: "flex", gap: 10, padding: "14px 20px 4px" }}>
            {onEdit && (
              <button type="button" className="edit-btn2" onClick={onEdit}>
                Update Customer
              </button>
            )}
            {onDelete && (
              <button type="button" className="delete-btn2" onClick={onDelete}>
                Delete Customer
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default CustomerDetailsModal;