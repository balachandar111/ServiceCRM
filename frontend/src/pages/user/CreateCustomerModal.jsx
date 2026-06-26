import React, { useState, useEffect } from "react";
import API from "../../services/api";

import "./CreateCustomerModal.css"

const CreateCustomerModal = ({
 refresh,
 closeModal
}) => {

 const role = localStorage.getItem("role");

 const [users,setUsers] =
 useState([]);

 useEffect(()=>{

  const fetchUsers = async()=>{

   try{

    const {data} =
    await API.get("/users");

    setUsers(
     (data.data || []).filter(
      u => u.role === "USER"
     )
    );

   }
   catch(error){

    console.log(error);

   }

  };

  fetchUsers();

 },[]);

 const [form,setForm] = useState({

  name:"",
  company:"",
  phoneNumber:"",
  email:"",

  service:"Service",
  status:"Waiting for Internal",
  customerLevel:"New",
  callType:"AMC",

  leadStatus:"Quotation Shared",

  followUpType:"Payment",
  followUpDate:"",

  leadStage:"Awareness",
  priority:"Medium",

  source:"Website",

  assignedTo:"",
  assignedToUserId:"",
  sector:"",
  expense:"",
  remark:"",

  quotationShared:{
   whatsappShared:false,
   emailShared:false,
   gstType:"GST",
   quotationNumber:""
  },

  closedDetails:{
   engineers:[],
   fieldEngineer:"",
   outsourceName:"",
   outsourceDate:"",
   internalName:"",
   internalDate:"",
   invoiceNumber:""
  }

 });
 const [dropdowns,setDropdowns] = useState({

 service:[
  "Service",
  "Product",
  "Solution",
  "Service + Product"
 ],

 status:[
  "Waiting for Internal",
  "Waiting for External",
  "Waiting for Customer"
 ],

 customerLevel:[
  "New",
  "Old"
 ],

 callType:[
  "AMC",
  "Service",
  "Sale",
  "Presales"
 ],

 leadStage:[
  "Awareness",
  "Interest",
  "Desire",
  "Closure"
 ],

 priority:[
  "Low",
  "Medium",
  "High"
 ],

 source:[
  "Website",
  "Referral",
  "Expo",
  "Social Media"
 ],

 followUpType:[
  "Payment",
  "Calls",
  "Both"
 ]

});
const [showOptionPopup,setShowOptionPopup] =
useState(false);

const [selectedField,setSelectedField] =
useState("");

const [newOption,setNewOption] =
useState("");
const openAddPopup = (field)=>{

 setSelectedField(field);

 setNewOption("");

 setShowOptionPopup(true);

};
const addNewOption = ()=>{

 if(!newOption.trim()) return;

 setDropdowns(prev=>({

  ...prev,

  [selectedField]:[
   ...prev[selectedField],
   newOption
  ]

 }));

 setShowOptionPopup(false);

};
const deleteOption = (
 field,
 value
)=>{

 if(
  !window.confirm(
   `Delete ${value}?`
  )
 ) return;

 setDropdowns(prev=>({

  ...prev,

  [field]:
  prev[field].filter(
   item=>item!==value
  )

 }));

};

 const handleChange = (e)=>{

  setForm({

   ...form,

   [e.target.name]:
   e.target.value

  });

 };

 // Handle user assignment — stores both name and id
 const handleAssignedTo = (e) => {
  const selectedId = e.target.value;
  const selectedUser = users.find(u => u._id === selectedId);
  setForm({
   ...form,
   assignedToUserId: selectedId,
   assignedTo: selectedUser ? selectedUser.name : "",
  });
 };

 const handleQuotation = (e)=>{

  const {
   name,
   value,
   checked,
   type
  } = e.target;

  setForm({

   ...form,

   quotationShared:{

    ...form.quotationShared,

    [name]:
    type==="checkbox"
    ? checked
    : value

   }

  });

 };

 const handleClosed = (e)=>{

  const {
   name,
   value
  } = e.target;

  setForm({

   ...form,

   closedDetails:{

    ...form.closedDetails,

    [name]:value

   }

  });

 };

 const toggleEngineer = (eng)=>{

  let engineers = [
   ...form.closedDetails.engineers
  ];

  if(
   engineers.includes(eng)
  ){

   engineers =
   engineers.filter(
    item=>item!==eng
   );

  }else{

   engineers.push(eng);

  }

  setForm({

   ...form,

   closedDetails:{

    ...form.closedDetails,

    engineers

   }

  });

 };

 const saveCustomer =
 async(e)=>{

  e.preventDefault();

  try{

   await API.post(
    "/customers",
    form
   );

   alert(
    "Customer Created Successfully"
   );

   refresh();
   closeModal();

  }
  catch(error){

   console.log(error);

   alert(
    error.response?.data?.message ||
    "Create Failed"
   );

  }

 };

return (
  <div className="modal-overlay">
    <div className="customer-modal">

      {/* HEADER */}
      <div className="modal-header">
        <h2>Create Customer</h2>

        <button
          type="button"
          className="close-btn"
          onClick={closeModal}
        >
          ✕
        </button>
      </div>

      <form
        className="customer-form"
        onSubmit={saveCustomer}
      >

        {/* CUSTOMER INFO */}

        <section className="form-section">

          <h3>Customer Information</h3>

          <div className="form-grid">

            <div className="input-group">
              <label>Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label>Company</label>
              <input
                name="company"
                value={form.company}
                onChange={handleChange}
              />
            </div>

            <div className="input-group">
              <label>Phone Number</label>
              <input
                name="phoneNumber"
                value={form.phoneNumber}
                onChange={handleChange}
              />
            </div>

            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
              />
            </div>

          </div>

        </section>

        {/* LEAD INFORMATION */}

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

{
 dropdowns.service.map(
 item=>(
  <option
   key={item}
   value={item}
  >
   {item}
  </option>
 )
)

}

</select>

<button
 type="button"
 className="mini-add-btn"
 onClick={()=>
  openAddPopup(
   "service"
  )
 }
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

   {
    dropdowns.callType.map(item=>(
     <option
      key={item}
      value={item}
     >
      {item}
     </option>
    ))
   }

  </select>

  <button
   type="button"
   className="mini-add-btn"
   onClick={()=>
    openAddPopup("callType")
   }
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

   {
    dropdowns.source.map(item=>(
     <option
      key={item}
      value={item}
     >
      {item}
     </option>
    ))
   }

  </select>

  <button
   type="button"
   className="mini-add-btn"
   onClick={()=>
    openAddPopup("source")
   }
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
                <option value="Quotation Shared">
                  Quotation Shared
                </option>

                <option value="Closed">
                  Closed
                </option>
              </select>
            </div>

          </div>

        </section>

        {/* FOLLOWUP */}

        <section className="form-section">

          <h3>Follow Up Information</h3>

          <div className="form-grid">

            <div className="input-group">
              <label>Follow Up Type</label>

              <select
                name="followUpType"
                value={form.followUpType}
                onChange={handleChange}
              >
                <option>Payment</option>
                <option>Calls</option>
                <option>Both</option>
              </select>
            </div>

            <div className="input-group">
              <label>Follow Up Date</label>

              <input
                type="date"
                name="followUpDate"
                value={form.followUpDate}
                onChange={handleChange}
              />
            </div>

          </div>

        </section>

        {/* QUOTATION DETAILS */}

        {form.leadStatus === "Quotation Shared" && (
          <section className="form-section">

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

              <div className="input-group">
                <label>GST Type</label>

                <select
                  name="gstType"
                  value={form.quotationShared.gstType}
                  onChange={handleQuotation}
                >
                  <option value="GST">GST</option>
                  <option value="NO GST">NO GST</option>
                </select>
              </div>

              <div className="input-group">
                <label>Quotation Number</label>

                <input
                  name="quotationNumber"
                  value={form.quotationShared.quotationNumber}
                  onChange={handleQuotation}
                />
              </div>

            </div>

          </section>
        )}

        {/* CLOSED DETAILS */}

        {form.leadStatus === "Closed" && (
          <section className="form-section">

            <h3>Closed Details</h3>

            {/* Engineers */}

            <div className="checkbox-row">

              {[
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
                    onChange={() => toggleEngineer(eng)}
                  />
                  {eng}
                </label>
              ))}

            </div>

            {/* Closed Fields */}

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

            </div>

          </section>
        )}

        {/* ADDITIONAL */}

        <section className="form-section">

          <h3>Additional Information</h3>

          <div className="form-grid">

            {/* Assign To User — admin/super_admin only */}
            {(role === "ADMIN" || role === "SUPER_ADMIN") && (
              <div className="input-group">
                <label>
                  Assign To User
                  <span style={{ fontSize: 11, color: "#6b7280", marginLeft: 6, fontWeight: 400 }}>
                    (customer will appear in selected user's view)
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
            )}

            {/* Fallback for regular users (shouldn't show, but safety net) */}
            {role !== "ADMIN" && role !== "SUPER_ADMIN" && (
              <select
                name="assignedTo"
                value={form.assignedTo}
                onChange={handleChange}
              >
                <option value="">Unassigned</option>
                {users.map((u) => (
                  <option key={u._id} value={u.name}>
                    {u.name}
                  </option>
                ))}
              </select>
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

        </section>

        {/* BUTTONS */}

        <div className="form-buttons">

          <button
            type="submit"
            className="save-btn"
          >
            Create Customer
          </button>

          <button
            type="button"
            className="cancel-btn"
            onClick={closeModal}
          >
            Cancel
          </button>

        </div>

      </form>
{
 showOptionPopup &&

<div className="option-popup-overlay">

<div className="option-popup">

<h3>

 Add Option

</h3>

<p>

Field :

 <b>
  {selectedField}
 </b>

</p>

<input

 value={newOption}

 onChange={(e)=>
  setNewOption(
   e.target.value
  )
 }

 placeholder="Enter New Option"

/>

<div
 className="popup-buttons"
>

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
 onClick={()=>{

  setShowOptionPopup(
   false
  );

 }}
>

 Cancel

</button>

</div>

</div>

</div>

}
    </div>
  </div>
  
);


};

export default CreateCustomerModal;