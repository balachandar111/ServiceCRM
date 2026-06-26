import React, { useState, useEffect } from "react";
import API from "../../services/api";
import "./EditCustomerModel.css";

const EditCustomerModal = ({ customer, refresh, closeModal }) => {
  const role = localStorage.getItem("role");
  const loggedInUser = JSON.parse(localStorage.getItem("user") || "null");

  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await API.get("/users");
        setUsers((data.data || []).filter((u) => u.role === "USER"));
      } catch (error) {
        console.log(error);
      }
    };
    fetchUsers();
  }, []);

  const [dropdowns, setDropdowns] = useState({
    service: ["Service", "Product", "Solution", "Service + Product"],
    status: [
      "Waiting for Internal",
      "Waiting for External",
      "Waiting for Customer",
    ],
    customerLevel: ["New", "Old"],
    callType: ["AMC", "Service", "Sale", "Presales"],
    leadStage: ["Awareness", "Interest", "Desire", "Closure"],
    priority: ["Low", "Medium", "High"],
    source: ["Website", "Referral", "Expo", "Social Media"],
    followUpType: ["Payment", "Calls", "Both"],
  });

  const [showOptionPopup, setShowOptionPopup] = useState(false);
  const [selectedField, setSelectedField] = useState("");
  const [newOption, setNewOption] = useState("");

  const openAddPopup = (field) => {
    setSelectedField(field);
    setNewOption("");
    setShowOptionPopup(true);
  };

  const addNewOption = () => {
    if (!newOption.trim()) return;
    setDropdowns((prev) => ({
      ...prev,
      [selectedField]: [...prev[selectedField], newOption],
    }));
    setShowOptionPopup(false);
  };

  const deleteOption = (field, value) => {
    if (!window.confirm(`Delete ${value}?`)) return;
    setDropdowns((prev) => ({
      ...prev,
      [field]: prev[field].filter((item) => item !== value),
    }));
  };

  // Determine the current owner user id
  const currentOwnerId = customer?.createdBy?._id || customer?.createdBy || "";

  const [form, setForm] = useState({
    name: customer?.name || "",
    company: customer?.company || "",
    phoneNumber: customer?.phoneNumber || "",
    email: customer?.email || "",
    service: customer?.service || "Service",
    status: customer?.status || "Waiting for Internal",
    customerLevel: customer?.customerLevel || "New",
    callType: customer?.callType || "AMC",
    leadStatus: customer?.leadStatus || "Quotation Shared",
    followUpType: customer?.followUpType || "Payment",
    followUpDate: customer?.followUpDate
      ? customer.followUpDate.substring(0, 10)
      : "",
    leadStage: customer?.leadStage || "Awareness",
    priority: customer?.priority || "Medium",
    source: customer?.source || "Website",
    assignedTo: customer?.assignedTo || "",
    assignedToUserId: currentOwnerId || "",
    sector: customer?.sector || "",
    expense: customer?.expense || "",
    remark: customer?.remark || "",
    quotationShared: {
      whatsappShared: customer?.quotationShared?.whatsappShared || false,
      emailShared: customer?.quotationShared?.emailShared || false,
      gstType: customer?.quotationShared?.gstType || "GST",
      quotationNumber: customer?.quotationShared?.quotationNumber || "",
    },
    closedDetails: {
      engineers: customer?.closedDetails?.engineers || [],
      fieldEngineer: customer?.closedDetails?.fieldEngineer || "",
      outsourceName: customer?.closedDetails?.outsourceName || "",
      outsourceDate: customer?.closedDetails?.outsourceDate
        ? customer.closedDetails.outsourceDate.substring(0, 10)
        : "",
      internalName: customer?.closedDetails?.internalName || "",
      internalDate: customer?.closedDetails?.internalDate
        ? customer.closedDetails.internalDate.substring(0, 10)
        : "",
      invoiceNumber: customer?.closedDetails?.invoiceNumber || "",
    },
  });

  // Track original assignedTo (for USER role approval flow)
  const originalAssignedTo = customer?.assignedTo || "";

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Admin assigns to a user — updates both assignedTo (name) and assignedToUserId (_id)
  const handleAssignedTo = (e) => {
    const selectedId = e.target.value;
    const selectedUser = users.find((u) => u._id === selectedId);
    setForm({
      ...form,
      assignedToUserId: selectedId,
      assignedTo: selectedUser ? selectedUser.name : "",
    });
  };

  const handleQuotation = (e) => {
    const { name, value, checked, type } = e.target;
    setForm({
      ...form,
      quotationShared: {
        ...form.quotationShared,
        [name]: type === "checkbox" ? checked : value,
      },
    });
  };

  const handleClosed = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      closedDetails: { ...form.closedDetails, [name]: value },
    });
  };

  const toggleEngineer = (eng) => {
    let engineers = [...form.closedDetails.engineers];
    if (engineers.includes(eng)) {
      engineers = engineers.filter((item) => item !== eng);
    } else {
      engineers.push(eng);
    }
    setForm({
      ...form,
      closedDetails: { ...form.closedDetails, engineers },
    });
  };

  const updateCustomer = async (e) => {
    e.preventDefault();

    try {
      const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";
      const assignedToChanged = form.assignedTo !== originalAssignedTo;

      const bodyToSave = { ...form };

      if (isAdmin) {
        // Admin: apply assignedTo + update createdBy immediately (no approval)
        // assignedToUserId is already in form, backend will use it to update createdBy
      } else {
        // USER role: if assignedTo changed, send approval request; revert in the save
        if (assignedToChanged) {
          bodyToSave.assignedTo = originalAssignedTo;
        }
        delete bodyToSave.assignedToUserId;
      }

      await API.put(`/customers/${customer._id}`, bodyToSave);

      if (!isAdmin && assignedToChanged) {
        await API.post("/approvals", {
          customerId: customer._id,
          previousAssignedTo: originalAssignedTo,
          requestedAssignedTo: form.assignedTo,
        });
        alert(
          "Customer updated successfully.\n\nYour request to change 'Assigned To' has been sent to the admin for approval."
        );
      } else {
        alert("Customer Updated Successfully");
      }

      refresh();
      closeModal();
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Update Failed");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container customer-modal">
        <div className="modal-header">
          <h2>Edit Customer</h2>
          <button className="close-btn" onClick={closeModal}>
            ✕
          </button>
        </div>

        <form className="customer-form" onSubmit={updateCustomer}>
          {/* CUSTOMER */}
          <div className="form-section">
            <h3>Customer Information</h3>
            <div className="form-grid">
              <input
                placeholder="Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
              <input
                placeholder="Company"
                name="company"
                value={form.company}
                onChange={handleChange}
              />
              <input
                placeholder="Phone Number"
                name="phoneNumber"
                value={form.phoneNumber}
                onChange={handleChange}
              />
              <input
                placeholder="Email"
                name="email"
                value={form.email}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* LEAD */}
          <section className="form-section">
            <h3>Lead Information</h3>
            <div className="form-grid">
              <div className="input-group">
                <label>Service</label>
                <div className="dropdown-wrapper">
                  <div className="dropdown-actions">
                    <select
                      name="service"
                      value={form.service}
                      onChange={handleChange}
                    >
                      {dropdowns.service.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="mini-add-btn"
                      onClick={() => openAddPopup("service")}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className="input-group">
                <label>Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option>Waiting for Internal</option>
                  <option>Waiting for External</option>
                  <option>Waiting for Customer</option>
                </select>
              </div>

              <div className="input-group">
                <label>Customer Level</label>
                <select
                  name="customerLevel"
                  value={form.customerLevel}
                  onChange={handleChange}
                >
                  <option>New</option>
                  <option>Old</option>
                </select>
              </div>

              <div className="input-group">
                <label>Call Type</label>
                <div className="dropdown-actions">
                  <select
                    name="callType"
                    value={form.callType}
                    onChange={handleChange}
                  >
                    {dropdowns.callType.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="mini-add-btn"
                    onClick={() => openAddPopup("callType")}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="input-group">
                <label>Lead Stage</label>
                <select
                  name="leadStage"
                  value={form.leadStage}
                  onChange={handleChange}
                >
                  <option>Awareness</option>
                  <option>Interest</option>
                  <option>Desire</option>
                  <option>Closure</option>
                </select>
              </div>

              <div className="input-group">
                <label>Priority</label>
                <select
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>

              {/* SOURCE */}
              <div className="input-group">
                <label>Source</label>
                <div className="dropdown-actions">
                  <select
                    name="source"
                    value={form.source}
                    onChange={handleChange}
                  >
                    {dropdowns.source.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="mini-add-btn"
                    onClick={() => openAddPopup("source")}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="input-group">
                <label>Lead Status</label>
                <select
                  name="leadStatus"
                  value={form.leadStatus}
                  onChange={handleChange}
                >
                  <option value="Quotation Shared">Quotation Shared</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>
          </section>

          {/* FOLLOWUP */}
          <div className="form-section">
            <h3>Follow Up</h3>
            <div className="form-grid">
              <select
                name="followUpType"
                value={form.followUpType}
                onChange={handleChange}
              >
                <option>Payment</option>
                <option>Calls</option>
                <option>Both</option>
              </select>
              <input
                type="date"
                name="followUpDate"
                value={form.followUpDate}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* QUOTATION */}
          {form.leadStatus === "Quotation Shared" && (
            <div className="form-section">
              <h3>Quotation Details</h3>
              <div className="checkbox-row">
                <label>
                  <input
                    type="checkbox"
                    name="whatsappShared"
                    checked={form.quotationShared.whatsappShared}
                    onChange={handleQuotation}
                  />
                  WhatsApp Shared
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="emailShared"
                    checked={form.quotationShared.emailShared}
                    onChange={handleQuotation}
                  />
                  Email Shared
                </label>
              </div>
              <div className="form-grid">
                <select
                  name="gstType"
                  value={form.quotationShared.gstType}
                  onChange={handleQuotation}
                >
                  <option value="GST">GST</option>
                  <option value="NO GST">NO GST</option>
                </select>
                <input
                  placeholder="Quotation Number"
                  name="quotationNumber"
                  value={form.quotationShared.quotationNumber}
                  onChange={handleQuotation}
                />
              </div>
            </div>
          )}

          {/* CLOSED */}
          {form.leadStatus === "Closed" && (
            <div className="form-section">
              <h3>Closed Details</h3>
              <div className="checkbox-row">
                {["Engineer 1", "Engineer 2", "Engineer 3"].map((eng) => (
                  <label key={eng}>
                    <input
                      type="checkbox"
                      checked={form.closedDetails.engineers.includes(eng)}
                      onChange={() => toggleEngineer(eng)}
                    />
                    {eng}
                  </label>
                ))}
              </div>
              <div className="form-grid">
                <input
                  placeholder="Field Engineer"
                  name="fieldEngineer"
                  value={form.closedDetails.fieldEngineer}
                  onChange={handleClosed}
                />
                <input
                  placeholder="Invoice Number"
                  name="invoiceNumber"
                  value={form.closedDetails.invoiceNumber}
                  onChange={handleClosed}
                />
                <input
                  placeholder="Outsource Name"
                  name="outsourceName"
                  value={form.closedDetails.outsourceName}
                  onChange={handleClosed}
                />
                <input
                  type="date"
                  name="outsourceDate"
                  value={form.closedDetails.outsourceDate}
                  onChange={handleClosed}
                />
                <input
                  placeholder="Internal Name"
                  name="internalName"
                  value={form.closedDetails.internalName}
                  onChange={handleClosed}
                />
                <input
                  type="date"
                  name="internalDate"
                  value={form.closedDetails.internalDate}
                  onChange={handleClosed}
                />
              </div>
            </div>
          )}

          {/* ADDITIONAL */}
          <div className="form-section">
            <h3>Additional Information</h3>
            <div className="form-grid">

              {/* ── ADMIN: Assign To User dropdown ── */}
              {(role === "ADMIN" || role === "SUPER_ADMIN") ? (
                <div className="input-group">
                  <label>
                    Assign To User
                    <span style={{ fontSize: 11, color: "#6b7280", marginLeft: 6, fontWeight: 400 }}>
                      (customer moves to this user's view)
                    </span>
                  </label>
                  <select
                    value={form.assignedToUserId}
                    onChange={handleAssignedTo}
                  >
                    <option value="">— Unassigned (Admin owns) —</option>
                    {users.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                /* ── USER: regular assignedTo with approval notice ── */
                <div className="input-group">
                  <label>
                    Assigned To
                    {form.assignedTo !== originalAssignedTo && (
                      <span
                        style={{
                          marginLeft: 8,
                          fontSize: 11,
                          color: "#f59e0b",
                          fontWeight: 600,
                        }}
                      >
                        ⚠ Requires admin approval
                      </span>
                    )}
                  </label>
                  <select
                    name="assignedTo"
                    value={form.assignedTo}
                    onChange={handleChange}
                  >
                    <option value="">— Unassigned —</option>
                    {users.map((u) => (
                      <option key={u._id} value={u.name}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <input
                placeholder="Sector"
                name="sector"
                value={form.sector}
                onChange={handleChange}
              />

              <input
                placeholder="Expense"
                name="expense"
                value={form.expense}
                onChange={handleChange}
              />
            </div>

            <textarea
              rows="4"
              placeholder="Remarks"
              name="remark"
              value={form.remark}
              onChange={handleChange}
            />
          </div>

          <div className="form-buttons">
            <button type="submit" className="save-btn1">
              Update Customer
            </button>
            <button type="button" className="cancel-btn1" onClick={closeModal}>
              Cancel
            </button>
          </div>
        </form>

        {/* ADD OPTION POPUP */}
        {showOptionPopup && (
          <div className="option-popup-overlay">
            <div className="option-popup">
              <h3>Add Option</h3>
              <p>
                Field : <b>{selectedField}</b>
              </p>
              <input
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                placeholder="Enter New Option"
              />
              <div className="popup-buttons">
                <button
                  type="button"
                  className="save-option-btn"
                  onClick={addNewOption}
                >
                  Save
                </button>
                <button
                  type="button"
                  className="cancel-option-btn"
                  onClick={() => setShowOptionPopup(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditCustomerModal;