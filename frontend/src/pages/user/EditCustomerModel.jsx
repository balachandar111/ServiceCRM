import React, { useState, useEffect } from "react";
import API from "../../services/api";
import "./EditCustomerModel.css";

const EditCustomerModal = ({ customer, refresh, closeModal, apiEndpoint = "/customers" }) => {
  const role = localStorage.getItem("role");

  const [users, setUsers] = useState([]);
  const [allCustomers, setAllCustomers] = useState([]);
  const [customerSearch, setCustomerSearch] = useState(
    customer?.closedDetails?.outsourceName || ""
  );

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await API.get("/users");
        setUsers((data.data || []).filter((u) => u.role === "USER"));
      } catch (error) {
        console.log(error);
      }
    };
    const fetchCustomers = async () => {
      try {
        const { data } = await API.get("/customers");
        setAllCustomers(data.data || data || []);
      } catch (error) {
        console.log(error);
      }
    };
    fetchUsers();
    fetchCustomers();
  }, []);

  const currentOwnerId = customer?.createdBy?._id || customer?.createdBy || "";

  const [form, setForm] = useState({
    name: customer?.name || "",
    company: customer?.company || "",
    phoneNumber: customer?.phoneNumber || "",
    email: customer?.email || "",
    service: customer?.service || "Service",
    serviceNumber: customer?.serviceNumber || "",
    status: customer?.status || "Waiting for Internal",
    customerLevel: customer?.customerLevel || "New",
    callType: customer?.callType || "AMC",
    leadStatus: customer?.leadStatus || "Quotation Shared",
    followUpType: customer?.followUpType || "Payment",
    followUpDate: customer?.followUpDate
      ? customer.followUpDate.substring(0, 16)
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
      outsourceCustomerId: customer?.closedDetails?.outsourceCustomerId || "",
      outsourceDate: customer?.closedDetails?.outsourceDate
        ? customer.closedDetails.outsourceDate.substring(0, 10)
        : "",
      internalName: customer?.closedDetails?.internalName || "",
      internalDate: customer?.closedDetails?.internalDate
        ? customer.closedDetails.internalDate.substring(0, 10)
        : "",
      invoiceNumber: customer?.closedDetails?.invoiceNumber || "",
      closedType: customer?.closedDetails?.closedType || "",
      bottomLine: customer?.closedDetails?.bottomLine || "",
      bottomLineAllocation: {
        accountManagerName: customer?.closedDetails?.bottomLineAllocation?.accountManagerName || "",
        accountManagerAmount: customer?.closedDetails?.bottomLineAllocation?.accountManagerAmount || "",
        backendSupportName: customer?.closedDetails?.bottomLineAllocation?.backendSupportName || "",
        backendSupportAmount: customer?.closedDetails?.bottomLineAllocation?.backendSupportAmount || "",
        serviceDeliveryName: customer?.closedDetails?.bottomLineAllocation?.serviceDeliveryName || "",
        serviceDeliveryAmount: customer?.closedDetails?.bottomLineAllocation?.serviceDeliveryAmount || "",
      },
    },
  });

  // Derive initial closedSourceType from saved data
  const [closedSourceType, setClosedSourceType] = useState(
    customer?.closedDetails?.closedType || ""
  );
  const [showSourcePopup, setShowSourcePopup] = useState(false);

  // Bottomline allocation popup
  const [showBottomLinePopup, setShowBottomLinePopup] = useState(false);
  const [bottomLineInput, setBottomLineInput] = useState(
    customer?.closedDetails?.bottomLine || ""
  );

  const originalAssignedTo = customer?.assignedTo || "";

  const [dropdowns, setDropdowns] = useState({
    service: ["Service", "Product", "Solution", "Service + Product"],
    status: ["Waiting for Internal", "Waiting for External", "Waiting for Customer"],
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

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "leadStatus" && value === "Closed" && !closedSourceType) {
      setForm((prev) => ({ ...prev, leadStatus: "Closed" }));
      setShowSourcePopup(true);
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSourceChoice = (type) => {
    setClosedSourceType(type);
    setShowSourcePopup(false);
    setForm((prev) => ({
      ...prev,
      closedDetails: { ...prev.closedDetails, closedType: type },
    }));
  };

  const handleAssignedTo = (e) => {
    const selectedId = e.target.value;
    const selectedUser = users.find((u) => u._id === selectedId);
    setForm((prev) => ({
      ...prev,
      assignedToUserId: selectedId,
      assignedTo: selectedUser ? selectedUser.name : "",
    }));
  };

  const handleQuotation = (e) => {
    const { name, value, checked, type } = e.target;
    setForm((prev) => ({
      ...prev,
      quotationShared: {
        ...prev.quotationShared,
        [name]: type === "checkbox" ? checked : value,
      },
    }));
  };

  const handleClosed = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      closedDetails: { ...prev.closedDetails, [name]: value },
    }));
  };

  const handleBottomLineChange = (e) => {
    setBottomLineInput(e.target.value);
  };

  const handleOpenBottomLinePopup = () => {
    const amount = parseFloat(bottomLineInput);
    if (!bottomLineInput || isNaN(amount) || amount <= 0) {
      alert("Please enter a valid Bottom Line amount first.");
      return;
    }
    setShowBottomLinePopup(true);
  };

  const handleBottomLineAllocation = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      closedDetails: {
        ...prev.closedDetails,
        bottomLineAllocation: {
          ...prev.closedDetails.bottomLineAllocation,
          [name]: value,
        },
      },
    }));
  };

  const saveBottomLinePopup = () => {
    const amount = parseFloat(bottomLineInput);
    const accountManagerAmount = (amount * 0.30).toFixed(2);
    const backendSupportAmount = (amount * 0.20).toFixed(2);
    const serviceDeliveryAmount = (amount * 0.10).toFixed(2);

    setForm((prev) => ({
      ...prev,
      closedDetails: {
        ...prev.closedDetails,
        bottomLine: bottomLineInput,
        bottomLineAllocation: {
          ...prev.closedDetails.bottomLineAllocation,
          accountManagerAmount,
          backendSupportAmount,
          serviceDeliveryAmount,
        },
      },
    }));
    setShowBottomLinePopup(false);
  };

  const toggleEngineer = (eng) => {
    let engineers = [...form.closedDetails.engineers];
    if (engineers.includes(eng)) {
      engineers = engineers.filter((item) => item !== eng);
    } else {
      engineers.push(eng);
    }
    setForm((prev) => ({
      ...prev,
      closedDetails: { ...prev.closedDetails, engineers },
    }));
  };

  const handleOutsourceCustomer = (c) => {
    setForm((prev) => ({
      ...prev,
      closedDetails: {
        ...prev.closedDetails,
        outsourceName: c.name,
        outsourceCustomerId: c._id,
      },
    }));
    setCustomerSearch(c.name);
  };

  const filteredCustomers = allCustomers.filter(
    (c) =>
      c.name?.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.company?.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const updateCustomer = async (e) => {
    e.preventDefault();

    if (!form.leadStatus) { alert("Lead Status is required"); return; }
    if (!form.service) { alert("Service is required"); return; }
    if (form.service === "Service" && !form.serviceNumber.trim()) { alert("Service Number is required"); return; }
    if (!form.status) { alert("Status is required"); return; }
    if (!form.callType) { alert("Call Type is required"); return; }

    if (form.leadStatus === "Quotation Shared") {
      if (!form.quotationShared.quotationNumber || !form.quotationShared.quotationNumber.trim()) {
        alert("Quotation Number is required");
        return;
      }
      if (!form.quotationShared.gstType) {
        alert("GST Type is required");
        return;
      }
    }

    if (form.leadStatus === "Closed") {
      if (!closedSourceType) {
        alert("Please select Internal Source or Outsource");
        setShowSourcePopup(true);
        return;
      }
      if (!form.closedDetails.engineers || form.closedDetails.engineers.length === 0) {
        alert("Please select at least one Engineer");
        return;
      }
      if (!form.closedDetails.fieldEngineer || !form.closedDetails.fieldEngineer.trim()) {
        alert("Field Engineer Name is required");
        return;
      }
      if (!form.closedDetails.invoiceNumber || !form.closedDetails.invoiceNumber.trim()) {
        alert("Invoice Number is required");
        return;
      }
      if (!form.closedDetails.bottomLine || !String(form.closedDetails.bottomLine).trim()) {
        alert("Bottom Line amount is required");
        return;
      }
      if (!form.closedDetails.bottomLineAllocation.accountManagerName.trim()) {
        alert("Account Manager name is required");
        return;
      }
      if (!form.closedDetails.bottomLineAllocation.backendSupportName.trim()) {
        alert("Backend Support name is required");
        return;
      }
      if (!form.closedDetails.bottomLineAllocation.serviceDeliveryName.trim()) {
        alert("Service and Delivery name is required");
        return;
      }

      if (closedSourceType === "internal") {
        if (!form.closedDetails.internalName || !form.closedDetails.internalName.trim()) {
          alert("Internal Source Name is required");
          return;
        }
        if (!form.closedDetails.internalDate) {
          alert("Internal Source Date is required");
          return;
        }
      }

      if (closedSourceType === "outsource") {
        if (!form.closedDetails.outsourceCustomerId || !form.closedDetails.outsourceName) {
          alert("Please select an Outsource customer from the search list");
          return;
        }
        if (!form.closedDetails.outsourceDate) {
          alert("Outsource Date is required");
          return;
        }
      }
    }

    try {
      const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";
      const assignedToChanged = form.assignedTo !== originalAssignedTo;
      const bodyToSave = { ...form };

      if (!isAdmin && assignedToChanged) {
        bodyToSave.assignedTo = originalAssignedTo;
        delete bodyToSave.assignedToUserId;
      }

      await API.put(`${apiEndpoint}/${customer._id}`, bodyToSave);

      if (!isAdmin && assignedToChanged) {
        await API.post("/approvals", {
          customerId: customer._id,
          previousAssignedTo: originalAssignedTo,
          requestedAssignedTo: form.assignedTo,
        });
        alert("Customer updated.\n\nAssigned To change sent to admin for approval.");
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

  // Computed allocation values for display
  const blAmount = parseFloat(bottomLineInput) || 0;
  const computed = {
    accountManager: (blAmount * 0.30).toFixed(2),
    backendSupport:  (blAmount * 0.20).toFixed(2),
    serviceDelivery: (blAmount * 0.10).toFixed(2),
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container customer-modal">
        <div className="modal-header">
          <h2>Edit Customer</h2>
          <button className="close-btn" onClick={closeModal}>✕</button>
        </div>

        <form className="customer-form" onSubmit={updateCustomer}>

          {/* CUSTOMER */}
          <div className="form-section">
            <h3>Customer Information</h3>
            <div className="form-grid">
              <div className="input-group">
                <label>Name <span className="required-star">*</span></label>
                <input placeholder="Name" name="name" value={form.name} onChange={handleChange} required />
              </div>
              <div className="input-group">
                <label>Company</label>
                <input placeholder="Company" name="company" value={form.company} onChange={handleChange} />
              </div>
              <div className="input-group">
                <label>Phone Number</label>
                <input placeholder="Phone Number" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} />
              </div>
              <div className="input-group">
                <label>Email</label>
                <input placeholder="Email" name="email" value={form.email} onChange={handleChange} />
              </div>
            </div>
          </div>

          {/* LEAD */}
          <section className="form-section">
            <h3>Lead Information</h3>
            <div className="form-grid">

              <div className="input-group">
                <label>Service <span className="required-star">*</span></label>
                <div className="dropdown-actions">
                  <select name="service" value={form.service} onChange={handleChange} required>
                    {dropdowns.service.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                  <button type="button" className="mini-add-btn" onClick={() => openAddPopup("service")}>+</button>
                </div>
              </div>

              {form.service === "Service" && (
                <div className="input-group">
                  <label>Service Number <span className="required-star">*</span></label>
                  <input
                    name="serviceNumber"
                    value={form.serviceNumber}
                    onChange={handleChange}
                    placeholder="Enter Service Number"
                    required
                  />
                </div>
              )}

              <div className="input-group">
                <label>Status <span className="required-star">*</span></label>
                <select name="status" value={form.status} onChange={handleChange} required>
                  <option>Waiting for Internal</option>
                  <option>Waiting for External</option>
                  <option>Waiting for Customer</option>
                </select>
              </div>

              <div className="input-group">
                <label>Customer Level</label>
                <select name="customerLevel" value={form.customerLevel} onChange={handleChange}>
                  <option>New</option>
                  <option>Old</option>
                </select>
              </div>

              <div className="input-group">
                <label>Call Type <span className="required-star">*</span></label>
                <div className="dropdown-actions">
                  <select name="callType" value={form.callType} onChange={handleChange} required>
                    {dropdowns.callType.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                  <button type="button" className="mini-add-btn" onClick={() => openAddPopup("callType")}>+</button>
                </div>
              </div>

              <div className="input-group">
                <label>Lead Stage</label>
                <select name="leadStage" value={form.leadStage} onChange={handleChange}>
                  <option>Awareness</option>
                  <option>Interest</option>
                  <option>Desire</option>
                  <option>Closure</option>
                </select>
              </div>

              <div className="input-group">
                <label>Priority</label>
                <select name="priority" value={form.priority} onChange={handleChange}>
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>

              <div className="input-group">
                <label>Source</label>
                <div className="dropdown-actions">
                  <select name="source" value={form.source} onChange={handleChange}>
                    {dropdowns.source.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                  <button type="button" className="mini-add-btn" onClick={() => openAddPopup("source")}>+</button>
                </div>
              </div>

              <div className="input-group">
                <label>Lead Status <span className="required-star">*</span></label>
                <select name="leadStatus" value={form.leadStatus} onChange={handleChange} required>
                  <option value="Quotation Shared">Quotation Shared</option>
                  <option value="Closed">Closed</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>

            </div>
          </section>

          {/* FOLLOWUP */}
          <div className="form-section">
            <h3>Follow Up</h3>
            <div className="form-grid">
              <div className="input-group">
                <label>Follow Up Type</label>
                <select name="followUpType" value={form.followUpType} onChange={handleChange}>
                  <option>Payment</option>
                  <option>Calls</option>
                  <option>Both</option>
                </select>
              </div>
              <div className="input-group">
                <label>Follow Up Date &amp; Time</label>
                <input
                  type="datetime-local"
                  name="followUpDate"
                  value={form.followUpDate}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* QUOTATION */}
          {form.leadStatus === "Quotation Shared" && (
            <div className="form-section">
              <h3>Quotation Details</h3>
              <div className="checkbox-row">
                <label>
                  <input type="checkbox" name="whatsappShared"
                    checked={form.quotationShared.whatsappShared} onChange={handleQuotation} />
                  WhatsApp Shared
                </label>
                <label>
                  <input type="checkbox" name="emailShared"
                    checked={form.quotationShared.emailShared} onChange={handleQuotation} />
                  Email Shared
                </label>
              </div>
              <div className="form-grid">
                <div className="input-group">
                  <label>GST Type <span className="required-star">*</span></label>
                  <select name="gstType" value={form.quotationShared.gstType} onChange={handleQuotation} required>
                    <option value="GST">GST</option>
                    <option value="NO GST">NO GST</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>Quotation Number <span className="required-star">*</span></label>
                  <input placeholder="Quotation Number" name="quotationNumber"
                    value={form.quotationShared.quotationNumber} onChange={handleQuotation} required />
                </div>
              </div>
            </div>
          )}

          {/* CLOSED DETAILS */}
          {form.leadStatus === "Closed" && closedSourceType && (
            <div className="form-section">
              <h3>
                Closed Details —&nbsp;
                <span className={`closed-type-badge ${closedSourceType}`}>
                  {closedSourceType === "internal" ? "Internal Source" : "Outsource"}
                </span>
                <button
                  type="button"
                  className="change-source-btn"
                  onClick={() => { setShowSourcePopup(true); setClosedSourceType(""); }}
                >
                  Change
                </button>
              </h3>

              <div className="checkbox-row">
                <label style={{ width: "100%", fontWeight: 600, marginBottom: 4 }}>
                  Select Engineer(s) <span className="required-star">*</span>
                </label>
                {["Engineer 1", "Engineer 2", "Engineer 3"].map((eng) => (
                  <label key={eng}>
                    <input type="checkbox"
                      checked={form.closedDetails.engineers.includes(eng)}
                      onChange={() => toggleEngineer(eng)} />
                    {eng}
                  </label>
                ))}
              </div>

              <div className="form-grid">
                <div className="input-group">
                  <label>Field Engineer Name <span className="required-star">*</span></label>
                  <input placeholder="Field Engineer Name" name="fieldEngineer"
                    value={form.closedDetails.fieldEngineer} onChange={handleClosed} required />
                </div>
                <div className="input-group">
                  <label>Invoice Number <span className="required-star">*</span></label>
                  <input placeholder="Invoice Number" name="invoiceNumber"
                    value={form.closedDetails.invoiceNumber} onChange={handleClosed} required />
                </div>

                {/* INTERNAL SOURCE fields */}
                {closedSourceType === "internal" && (
                  <>
                    <div className="input-group">
                      <label>Internal Source Name <span className="required-star">*</span></label>
                      <input placeholder="Internal Source Name" name="internalName"
                        value={form.closedDetails.internalName} onChange={handleClosed} required />
                    </div>
                    <div className="input-group">
                      <label>Date <span className="required-star">*</span></label>
                      <input type="date" name="internalDate"
                        value={form.closedDetails.internalDate} onChange={handleClosed} required />
                    </div>
                  </>
                )}

                {/* OUTSOURCE fields */}
                {closedSourceType === "outsource" && (
                  <>
                    <div className="input-group outsource-customer-group">
                      <label>Outsource Name <span className="required-star">*</span> <span className="required-hint">(select from customers)</span></label>
                      <div className="outsource-search-wrapper">
                        <input
                          type="text"
                          placeholder="Search customer..."
                          value={customerSearch}
                          onChange={(e) => {
                            setCustomerSearch(e.target.value);
                            setForm((prev) => ({
                              ...prev,
                              closedDetails: { ...prev.closedDetails, outsourceName: "", outsourceCustomerId: "" },
                            }));
                          }}
                          className="outsource-search-input"
                        />
                        {customerSearch && !form.closedDetails.outsourceCustomerId && (
                          <div className="outsource-dropdown">
                            {filteredCustomers.length === 0 ? (
                              <div className="outsource-no-result">No customers found</div>
                            ) : (
                              filteredCustomers.slice(0, 8).map((c) => (
                                <div key={c._id} className="outsource-option"
                                  onClick={() => handleOutsourceCustomer(c)}>
                                  <span className="outsource-opt-name">{c.name}</span>
                                  {c.company && <span className="outsource-opt-company">{c.company}</span>}
                                </div>
                              ))
                            )}
                          </div>
                        )}
                        {form.closedDetails.outsourceCustomerId && (
                          <div className="outsource-selected-badge">
                            ✓ {form.closedDetails.outsourceName}
                            <button type="button" onClick={() => {
                              setCustomerSearch("");
                              setForm((prev) => ({
                                ...prev,
                                closedDetails: { ...prev.closedDetails, outsourceName: "", outsourceCustomerId: "" },
                              }));
                            }}>✕</button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="input-group">
                      <label>Date <span className="required-star">*</span></label>
                      <input type="date" name="outsourceDate"
                        value={form.closedDetails.outsourceDate} onChange={handleClosed} required />
                    </div>
                  </>
                )}

                {/* BOTTOM LINE — shown for both internal and outsource */}
                <div className="input-group">
                  <label>Bottom Line (Amount) <span className="required-star">*</span></label>
                  <div className="bottomline-row">
                    <input
                      type="number"
                      placeholder="Enter Bottom Line Amount"
                      value={bottomLineInput}
                      onChange={handleBottomLineChange}
                      min="0"
                      step="0.01"
                    />
                    <button
                      type="button"
                      className="bottomline-allocate-btn"
                      onClick={handleOpenBottomLinePopup}
                    >
                      Allocate
                    </button>
                  </div>
                </div>

                {/* Show allocation summary once names are saved */}
                {form.closedDetails.bottomLineAllocation?.accountManagerName && (
                  <div className="input-group bottomline-summary">
                    <label>Allocation Summary</label>
                    <div className="allocation-summary-grid">
                      <div className="alloc-row">
                        <span className="alloc-label">Account Manager</span>
                        <span className="alloc-name">{form.closedDetails.bottomLineAllocation.accountManagerName}</span>
                        <span className="alloc-amount">₹{form.closedDetails.bottomLineAllocation.accountManagerAmount} <span className="alloc-pct">(30%)</span></span>
                      </div>
                      <div className="alloc-row">
                        <span className="alloc-label">Backend Support</span>
                        <span className="alloc-name">{form.closedDetails.bottomLineAllocation.backendSupportName}</span>
                        <span className="alloc-amount">₹{form.closedDetails.bottomLineAllocation.backendSupportAmount} <span className="alloc-pct">(20%)</span></span>
                      </div>
                      <div className="alloc-row">
                        <span className="alloc-label">Service & Delivery</span>
                        <span className="alloc-name">{form.closedDetails.bottomLineAllocation.serviceDeliveryName}</span>
                        <span className="alloc-amount">₹{form.closedDetails.bottomLineAllocation.serviceDeliveryAmount} <span className="alloc-pct">(10%)</span></span>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* ADDITIONAL */}
          <div className="form-section">
            <h3>Additional Information</h3>
            <div className="form-grid">
              {(role === "ADMIN" || role === "SUPER_ADMIN") ? (
                <div className="input-group">
                  <label>
                    Assign To User
                    <span style={{ fontSize: 11, color: "#6b7280", marginLeft: 6, fontWeight: 400 }}>
                      (customer moves to this user's view)
                    </span>
                  </label>
                  <select value={form.assignedToUserId} onChange={handleAssignedTo}>
                    <option value="">— Unassigned (Admin owns) —</option>
                    {users.map((u) => (
                      <option key={u._id} value={u._id}>{u.name}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="input-group">
                  <label>
                    Assigned To
                    {form.assignedTo !== originalAssignedTo && (
                      <span style={{ marginLeft: 8, fontSize: 11, color: "#f59e0b", fontWeight: 600 }}>
                        ⚠ Requires admin approval
                      </span>
                    )}
                  </label>
                  <select name="assignedTo" value={form.assignedTo} onChange={handleChange}>
                    <option value="">— Unassigned —</option>
                    {users.map((u) => (
                      <option key={u._id} value={u.name}>{u.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="input-group">
                <label>Sector</label>
                <input placeholder="Sector" name="sector" value={form.sector} onChange={handleChange} />
              </div>
              <div className="input-group">
                <label>Expense</label>
                <input placeholder="Expense" name="expense" value={form.expense} onChange={handleChange} />
              </div>
            </div>
            <textarea rows="4" placeholder="Remarks" name="remark" value={form.remark} onChange={handleChange} />
          </div>

          <div className="form-buttons">
            <button type="submit" className="save-btn1">Update Customer</button>
            <button type="button" className="cancel-btn1" onClick={closeModal}>Cancel</button>
          </div>
        </form>

        {/* SOURCE TYPE POPUP */}
        {showSourcePopup && (
          <div className="source-popup-overlay">
            <div className="source-popup">
              <h3>Select Closed Source Type</h3>
              <p>Please choose how this deal was closed:</p>
              <div className="source-options">
                <button type="button" className="source-option-btn internal"
                  onClick={() => handleSourceChoice("internal")}>
                  <span className="source-icon">🏢</span>
                  <span className="source-label">Internal Source</span>
                  <span className="source-desc">Closed by internal team</span>
                </button>
                <button type="button" className="source-option-btn outsource"
                  onClick={() => handleSourceChoice("outsource")}>
                  <span className="source-icon">🤝</span>
                  <span className="source-label">Outsource</span>
                  <span className="source-desc">Closed via external partner</span>
                </button>
              </div>
              <button type="button" className="source-popup-cancel"
                onClick={() => {
                  setShowSourcePopup(false);
                  if (!closedSourceType) {
                    setForm((prev) => ({ ...prev, leadStatus: "Quotation Shared" }));
                  }
                }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* BOTTOM LINE ALLOCATION POPUP */}
        {showBottomLinePopup && (
          <div className="source-popup-overlay">
            <div className="source-popup bottomline-popup">
              <h3>Bottom Line Allocation</h3>
              <p className="bottomline-total-label">
                Total Amount: <strong>₹{parseFloat(bottomLineInput).toLocaleString()}</strong>
              </p>

              <div className="bottomline-alloc-list">

                {/* Account Manager */}
                <div className="bottomline-alloc-item">
                  <div className="alloc-header">
                    <span className="alloc-role">Account Manager</span>
                    <span className="alloc-pct-badge">30% — ₹{computed.accountManager}</span>
                  </div>
                  <input
                    type="text"
                    name="accountManagerName"
                    placeholder="Enter Account Manager Name"
                    value={form.closedDetails.bottomLineAllocation.accountManagerName}
                    onChange={handleBottomLineAllocation}
                  />
                </div>

                {/* Backend Support */}
                <div className="bottomline-alloc-item">
                  <div className="alloc-header">
                    <span className="alloc-role">Backend Support</span>
                    <span className="alloc-pct-badge">20% — ₹{computed.backendSupport}</span>
                  </div>
                  <input
                    type="text"
                    name="backendSupportName"
                    placeholder="Enter Backend Support Name"
                    value={form.closedDetails.bottomLineAllocation.backendSupportName}
                    onChange={handleBottomLineAllocation}
                  />
                </div>

                {/* Service and Delivery */}
                <div className="bottomline-alloc-item">
                  <div className="alloc-header">
                    <span className="alloc-role">Service and Delivery</span>
                    <span className="alloc-pct-badge">10% — ₹{computed.serviceDelivery}</span>
                  </div>
                  <input
                    type="text"
                    name="serviceDeliveryName"
                    placeholder="Enter Service & Delivery Name"
                    value={form.closedDetails.bottomLineAllocation.serviceDeliveryName}
                    onChange={handleBottomLineAllocation}
                  />
                </div>

              </div>

              <div className="popup-buttons" style={{ marginTop: 20 }}>
                <button
                  type="button"
                  className="save-option-btn"
                  onClick={saveBottomLinePopup}
                >
                  Save Allocation
                </button>
                <button
                  type="button"
                  className="cancel-option-btn"
                  onClick={() => setShowBottomLinePopup(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ADD OPTION POPUP */}
        {showOptionPopup && (
          <div className="option-popup-overlay">
            <div className="option-popup">
              <h3>Add Option</h3>
              <p>Field : <b>{selectedField}</b></p>
              <input value={newOption} onChange={(e) => setNewOption(e.target.value)}
                placeholder="Enter New Option" />
              <div className="popup-buttons">
                <button type="button" className="save-option-btn" onClick={addNewOption}>Save</button>
                <button type="button" className="cancel-option-btn"
                  onClick={() => setShowOptionPopup(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditCustomerModal;