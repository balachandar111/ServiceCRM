import React, { useState } from "react";
import API from "../../services/api";

const CreateUser = ({ refresh, closeModal }) => {
  // Initial Form State
  const [form, setForm] = useState({
    name: "",
    company: "",
    phoneNumber: "",
    email: "",
    username: "",
    password: "",
    service: "Service",
    status: "Waiting for Internal",
    customerLevel: "New",
    callType: "AMC",
    leadStatus: "Quotation Shared",
    
    loginStatus: "INACTIVE",
    followUpType: "Payment",
    followUpDate: "",
    quotationShared: {
      whatsappShared: false,
      emailShared: false,
      gstType: "GST",
      quotationNumber: "",
    },
    closedDetails: {
      engineers: [],
      fieldEngineer: "",
      outsourceName: "",
      outsourceDate: "",
      internalName: "",
      internalDate: "",
     invoiceNumber:""
    },
    leadStage:"Awareness",

priority:"Medium",

source:"Website",

assignedTo:"",

solution:"",

product:"",

sector:"",

remark:"",
  });

  // Handler for Flat/Top-level Fields
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // Handler for Nested Quotation Fields
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

  // Handler for Nested Closed Details Fields
  const handleClosed = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      closedDetails: {
        ...form.closedDetails,
        [name]: value,
      },
    });
  };

  // Handler for Toggling Engineers Array
  const toggleEngineer = (engineer) => {
    let engineers = [...form.closedDetails.engineers];
    if (engineers.includes(engineer)) {
      engineers = engineers.filter((item) => item !== engineer);
    } else {
      engineers.push(engineer);
    }
    setForm({
      ...form,
      closedDetails: {
        ...form.closedDetails,
        engineers,
      },
    });
  };

  // Form Submission
  const saveLead = async (e) => {
    e.preventDefault();
    try {
      await API.post("/users", form);
      alert("Lead Created Successfully");
      refresh();
      closeModal();
    } catch (error) {
      alert(error.response?.data?.message || "Create Failed");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        {/* Header */}
        <div className="modal-header">
          <h2>Create Lead</h2>
          <button type="button" className="close-btn" onClick={closeModal}>
            ✕
          </button>
        </div>

        {/* Form Body */}
      <form className="create-form" onSubmit={saveLead}>

  {/* BASIC DETAILS */}

  <div className="form-section">

    <h3>Basic Information</h3>

    <div className="form-grid">

      <input
        name="name"
        value={form.name}
        onChange={handleChange}
        placeholder="Lead Name"
        required
      />

      <input
        name="company"
        value={form.company}
        onChange={handleChange}
        placeholder="Company"
      />

      <input
        name="phoneNumber"
        value={form.phoneNumber}
        onChange={handleChange}
        placeholder="Phone Number"
      />

      <input
        name="email"
        value={form.email}
        onChange={handleChange}
        placeholder="Email"
      />

      <input
        name="username"
        value={form.username}
        onChange={handleChange}
        placeholder="Username"
        required
      />

      <input
        type="password"
        name="password"
        value={form.password}
        onChange={handleChange}
        placeholder="Password"
        required
      />

    </div>

  </div>
  <div className="form-section">

 <h3>Customer Information</h3>

 <div className="form-grid">

  <select
   name="leadStage"
   value={form.leadStage}
   onChange={handleChange}
  >

   <option value="Awareness">
    Awareness
   </option>

   <option value="Interest">
    Interest
   </option>

   <option value="Desire">
    Desire
   </option>

   <option value="Closure">
    Closure
   </option>

  </select>

  <select
   name="priority"
   value={form.priority}
   onChange={handleChange}
  >

   <option value="Low">
    Low
   </option>

   <option value="Medium">
    Medium
   </option>

   <option value="High">
    High
   </option>

  </select>

  <select
   name="source"
   value={form.source}
   onChange={handleChange}
  >

   <option value="Website">
    Website
   </option>

   <option value="Social media">
    Social Media
   </option>

   <option value="Expo">
    Expo
   </option>

   <option value="Referral">
    Referral
   </option>

  </select>

  <input
   type="text"
   name="assignedTo"
   value={form.assignedTo}
   onChange={handleChange}
   placeholder="Assigned To"
  />

  <input
   type="text"
   name="solution"
   value={form.solution}
   onChange={handleChange}
   placeholder="Solution"
  />

  <input
   type="text"
   name="product"
   value={form.product}
   onChange={handleChange}
   placeholder="Product"
  />

  <input
   type="text"
   name="sector"
   value={form.sector}
   onChange={handleChange}
   placeholder="Sector"
  />

 </div>

</div>

  {/* CRM DETAILS */}

  <div className="form-section">

    <h3>Lead Details</h3>

    <div className="form-grid">

      <select
        name="service"
        value={form.service}
        onChange={handleChange}
      >
        <option>Service</option>
        <option>Service + Product</option>
        <option>Product</option>
        <option>Solution</option>
      </select>

      <select
        name="status"
        value={form.status}
        onChange={handleChange}
      >
        <option>Waiting for Internal</option>
        <option>Waiting for External</option>
        <option>Waiting for Customer</option>
      </select>

      <select
        name="customerLevel"
        value={form.customerLevel}
        onChange={handleChange}
      >
        <option>New</option>
        <option>Old</option>
      </select>

      <select
        name="callType"
        value={form.callType}
        onChange={handleChange}
      >
        <option>AMC</option>
        <option>Service</option>
        <option>Sale</option>
        <option>Presales</option>
      </select>

      <select
        name="leadStatus"
        value={form.leadStatus}
        onChange={handleChange}
      >
        <option value="Quotation Shared">
          Quotation Shared
        </option>

        <option value="Closed">
          Closed
        </option>
      </select>

    </div>

  </div>

  {/* FOLLOW UP */}

  <div className="form-section">

    <h3>Follow Up</h3>

    <div className="form-grid">

      <select
        name="followUpType"
        value={form.followUpType}
        onChange={handleChange}
      >
        <option value="Payment">
          Payment
        </option>

        <option value="Calls">
          Calls
        </option>

        <option value="Both">
          Both
        </option>
      </select>

      <input
        type="date"
        name="followUpDate"
        value={form.followUpDate}
        onChange={handleChange}
      />

    </div>

  </div>

  {/* QUOTATION SHARED */}

  {
    form.leadStatus === "Quotation Shared" && (

      <div className="form-section quotation-card">

        <h3>Quotation Shared Details</h3>

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
            <option value="GST">
              GST
            </option>

            <option value="NO GST">
              NO GST
            </option>
          </select>

          <input
            name="quotationNumber"
            value={form.quotationShared.quotationNumber}
            onChange={handleQuotation}
            placeholder="Quotation Number"
          />

        </div>

      </div>

    )
  }

  {/* CLOSED DETAILS */}

  {
    form.leadStatus === "Closed" && (

      <div className="form-section closed-card">

        <h3>Closed Details</h3>

        <div className="checkbox-row">

          {
            [
              "Engineer 1",
              "Engineer 2",
              "Engineer 3"
            ].map((eng) => (

              <label key={eng}>

                <input
                  type="checkbox"
                  checked={
                    form.closedDetails.engineers.includes(eng)
                  }
                  onChange={() =>
                    toggleEngineer(eng)
                  }
                />

                {eng}

              </label>

            ))
          }

        </div>

        <div className="form-grid">

          <input
            name="fieldEngineer"
            value={form.closedDetails.fieldEngineer}
            onChange={handleClosed}
            placeholder="Field Engineer"
          />

          <input
            name="invoiceNumber"
            value={form.closedDetails.invoiceNumber}
            onChange={handleClosed}
            placeholder="Invoice Number"
          />

          <input
            name="outsourceName"
            value={form.closedDetails.outsourceName}
            onChange={handleClosed}
            placeholder="Outsource Name"
          />

          <input
            type="date"
            name="outsourceDate"
            value={form.closedDetails.outsourceDate}
            onChange={handleClosed}
          />

          <input
            name="internalName"
            value={form.closedDetails.internalName}
            onChange={handleClosed}
            placeholder="Internal Name"
          />

          <input
            type="date"
            name="internalDate"
            value={form.closedDetails.internalDate}
            onChange={handleClosed}
          />

        </div>

      </div>

    )
  }
  <div className="form-section">

 <h3>Remarks</h3>

 <textarea

  name="remark"

  value={form.remark}

  onChange={handleChange}

  placeholder="Enter Customer Remarks"

 />

</div>

  <button
    type="submit"
    className="save-btn"
  >
    Save Lead
  </button>

</form>
      </div>
    </div>
  );
};

export default CreateUser;