import React,
{
 useState,
 useEffect
}
from "react";

import API
from "../../services/api";


const EditUser = ({
 user,
 refresh,
 closeModal
}) => {

 const [form,setForm] =
 useState({

  name:"",
  company:"",
  phoneNumber:"",
  email:"",

  username:"",

  service:"Service",

  status:"Waiting for Internal",

  customerLevel:"New",

  callType:"AMC",

  leadStatus:"Quotation Shared",

  loginStatus:"ACTIVE",

  followUpType:"Payment",

  followUpDate:"",

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
  },
  leadStage: "Awareness",

priority: "Medium",

source: "Website",

assignedTo: "",

solution: "",

product: "",

sector: "",

remark: "",

 });

 useEffect(()=>{

  if(user){

   setForm({

    ...form,

    ...user,

    followUpType:
    user.followUpType || "Payment",

    followUpDate:
    user.followUpDate
    ? user.followUpDate.split("T")[0]
    : "",

    quotationShared:
    user.quotationShared || {

     whatsappShared:false,
     emailShared:false,

     gstType:"GST",

     quotationNumber:""

    },

    closedDetails:
    user.closedDetails || {

     engineers:[],

     fieldEngineer:"",

     outsourceName:"",
     outsourceDate:"",

     internalName:"",
     internalDate:"",

     invoiceNumber:""

    }

   });

  }

 },[user]);

 const handleChange=(e)=>{

  setForm({

   ...form,

   [e.target.name]:
   e.target.value

  });

 };

 const handleQuotation=(e)=>{

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

 const handleClosed=(e)=>{

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

 const toggleEngineer=(eng)=>{

  let engineers =
  [...form.closedDetails.engineers];

  if(
   engineers.includes(eng)
  ){

   engineers =
   engineers.filter(
    item=>item!==eng
   );

  }
  else{

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

 const updateLead =
 async(e)=>{

  e.preventDefault();

  try{

   await API.put(

    `/users/${user._id}`,

    form

   );

   alert(
    "Lead Updated Successfully"
   );

   refresh();

   closeModal();

  }
  catch(error){

   alert(

    error.response?.data?.message ||

    "Update Failed"

   );

  }

 };

 return(

  <div className="modal-overlay">

   <div className="modal-container">

    <div className="modal-header">

     <h2>
      Edit Lead
     </h2>

     <button
      type="button"
      className="close-btn"
      onClick={closeModal}
     >
      ✕
     </button>

    </div>

  <form
 className="create-form"
 onSubmit={updateLead}
>

{/* BASIC INFORMATION */}

<div className="form-section">

 <h3>Basic Information</h3>

 <div className="form-grid">
<div className="form-grid">

  <div className="form-group">
    <label>Lead Name</label>
    <input
      name="name"
      value={form.name || ""}
      onChange={handleChange}
    />
  </div>

  <div className="form-group">
    <label>Company</label>
    <input
      name="company"
      value={form.company || ""}
      onChange={handleChange}
    />
  </div>

  <div className="form-group">
    <label>Phone Number</label>
    <input
      name="phoneNumber"
      value={form.phoneNumber || ""}
      onChange={handleChange}
    />
  </div>

  <div className="form-group">
    <label>Email</label>
    <input
      name="email"
      value={form.email || ""}
      onChange={handleChange}
    />
  </div>

</div>

 </div>

</div>
<div className="form-section">

 <h3>Customer Information</h3>

 <div className="form-grid">

 <div className="form-group">
    <label>Lead Stage</label>
    <select
      name="leadStage"
      value={form.leadStage || ""}
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
  
  </div>

   <div className="form-group">
    <label>Priority</label>
    <select
      name="priority"
      value={form.priority || ""}
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
  </div>

    <div className="form-group">
    <label>Lead Source</label>
    <select
      name="source"
      value={form.source || ""}
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
  </div>

  <div className="form-group">
    <label>Assigned To</label>
    <input
      name="assignedTo"
      value={form.assignedTo || ""}
      onChange={handleChange}
    />
  </div>

  <div className="form-group">
    <label>Sector</label>
    <input
      name="sector"
      value={form.sector || ""}
      onChange={handleChange}
    />
  </div>

 </div>

</div>

{/* LEAD DETAILS */}

<div className="form-section">

 <h3>Lead Details</h3>

 <div className="form-grid">

 <div className="form-group">
    <label>Service Type</label>
    <select
      name="service"
      value={form.service || ""}
      onChange={handleChange}
    >
   <option>Service</option>
   <option>Service + Product</option>
   <option>Product</option>
   <option>Solution</option>
  </select>
  </div>

    <div className="form-group">
    <label>Status</label>
    <select
      name="status"
      value={form.status || ""}
      onChange={handleChange}
    >
   <option>Waiting for Internal</option>
   <option>Waiting for External</option>
   <option>Waiting for Customer</option>
  </select>
</div>
  <div className="form-group">
    <label>Customer Level</label>
    <select
      name="customerLevel"
      value={form.customerLevel || ""}
      onChange={handleChange}
    >
   <option>New</option>
   <option>Old</option>
  </select>
  </div>

  <div className="form-group">
    <label>Call Type</label>
    <select
      name="callType"
      value={form.callType || ""}
      onChange={handleChange}
    >
   <option>AMC</option>
   <option>Service</option>
   <option>Sale</option>
   <option>Presales</option>
  </select>
  </div>

   <div className="form-group">
    <label>Lead Status</label>
    <select
      name="leadStatus"
      value={form.leadStatus || ""}
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

   <div className="form-group">
    <label>Login Status</label>
    <select
      name="loginStatus"
      value={form.loginStatus || ""}
      onChange={handleChange}
    >
   <option value="ACTIVE">
    ACTIVE
   </option>

   <option value="INACTIVE">
    INACTIVE
   </option>
  </select>
</div>
 </div>

</div>


{/* FOLLOW UP */}

<div className="form-section">

 <h3>Follow Up</h3>

 <div className="form-grid">

 <div className="form-group">
    <label>Follow Up Type</label>
    <select
      name="followUpType"
      value={form.followUpType || ""}
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
  </div>
  <div className="form-group">
    <label>Follow Up Date</label>
    <input
      type="date"
      name="followUpDate"
      value={form.followUpDate || ""}
      onChange={handleChange}
    />
  </div>

 </div>

</div>


{/* QUOTATION SHARED */}

{
 form.leadStatus === "Quotation Shared" && (

  <div className="form-section">

   <h3>Quotation Shared Details</h3>

   <div className="checkbox-row">

    <label>
     <input
      type="checkbox"
      name="whatsappShared"
      checked={
       form.quotationShared?.whatsappShared || false
      }
      onChange={handleQuotation}
     />
     WhatsApp Shared
    </label>

    <label>
     <input
      type="checkbox"
      name="emailShared"
      checked={
       form.quotationShared?.emailShared || false
      }
      onChange={handleQuotation}
     />
     Email Shared
    </label>

   </div>

   <div className="form-grid">

   <div className="form-group">
  <label>GST Type</label>
  <select
    name="gstType"
    value={form.quotationShared?.gstType || "GST"}
    onChange={handleQuotation}
  >
     <option value="GST">
      GST
     </option>

     <option value="NO GST">
      NO GST
     </option>
    </select>
    </div>
<div className="form-group">
  <label>Quotation Number</label>
  <input
    name="quotationNumber"
    value={form.quotationShared?.quotationNumber || ""}
    onChange={handleQuotation}
  />
</div>

   </div>

  </div>

 )
}


{/* CLOSED DETAILS */}

{
 form.leadStatus === "Closed" && (

  <div className="form-section">

   <h3>Closed Details</h3>

   <div className="checkbox-row">

    {
     [
      "Engineer 1",
      "Engineer 2",
      "Engineer 3"
     ].map((eng)=>(

      <label key={eng}>

       <input
        type="checkbox"
        checked={
         form.closedDetails?.engineers?.includes(eng)
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

   <div className="form-group">
  <label>Field Engineer</label>
  <input
    name="fieldEngineer"
    value={form.closedDetails?.fieldEngineer || ""}
    onChange={handleClosed}
  />
</div>

<div className="form-group">
  <label>Invoice Number</label>
  <input
    name="invoiceNumber"
    value={form.closedDetails?.invoiceNumber || ""}
    onChange={handleClosed}
  />
</div>

<div className="form-group">
  <label>Outsource Name</label>
  <input
    name="outsourceName"
    value={form.closedDetails?.outsourceName || ""}
    onChange={handleClosed}
  />
</div>

<div className="form-group">
  <label>Outsource Date</label>
  <input
    type="date"
    name="outsourceDate"
    value={form.closedDetails?.outsourceDate || ""}
    onChange={handleClosed}
  />
</div>

<div className="form-group">
  <label>Internal Name</label>
  <input
    name="internalName"
    value={form.closedDetails?.internalName || ""}
    onChange={handleClosed}
  />
</div>

<div className="form-group">
  <label>Internal Date</label>
  <input
    type="date"
    name="internalDate"
    value={form.closedDetails?.internalDate || ""}
    onChange={handleClosed}
  />
</div>   </div>

  </div>

 )
}
<div className="form-section">

  <h3>Remarks</h3>

  <div className="form-group">

    <label>Customer Remarks</label>

    <textarea
      name="remark"
      value={form.remark || ""}
      onChange={handleChange}
    />

  </div>

</div>

<button
 type="submit"
 className="save-btn"
>
 Update Lead
</button>

</form>

   </div>

  </div>

 );

};

export default EditUser;