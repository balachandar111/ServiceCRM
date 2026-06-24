import React, { useState } from "react";
import API from "../../services/api";
import "./EditCustomerModel.css";

const EditCustomerModal = ({
 customer,
 refresh,
 closeModal
}) => {

 const [form,setForm] = useState({

  name:customer?.name || "",
  company:customer?.company || "",
  phoneNumber:customer?.phoneNumber || "",
  email:customer?.email || "",

  service:customer?.service || "Service",
  status:customer?.status || "Waiting for Internal",
  customerLevel:customer?.customerLevel || "New",
  callType:customer?.callType || "AMC",

  leadStatus:
  customer?.leadStatus ||
  "Quotation Shared",

  followUpType:
  customer?.followUpType ||
  "Payment",

  followUpDate:
  customer?.followUpDate
   ? customer.followUpDate
      .substring(0,10)
   : "",

  leadStage:
  customer?.leadStage ||
  "Awareness",

  priority:
  customer?.priority ||
  "Medium",

  source:
  customer?.source ||
  "Website",

  assignedTo:
  customer?.assignedTo || "",

  sector:
  customer?.sector || "",

  expense:
  customer?.expense || "",

  remark:
  customer?.remark || "",

  quotationShared:{

   whatsappShared:
   customer?.quotationShared
   ?.whatsappShared || false,

   emailShared:
   customer?.quotationShared
   ?.emailShared || false,

   gstType:
   customer?.quotationShared
   ?.gstType || "GST",

   quotationNumber:
   customer?.quotationShared
   ?.quotationNumber || ""

  },

  closedDetails:{

   engineers:
   customer?.closedDetails
   ?.engineers || [],

   fieldEngineer:
   customer?.closedDetails
   ?.fieldEngineer || "",

   outsourceName:
   customer?.closedDetails
   ?.outsourceName || "",

   outsourceDate:
   customer?.closedDetails
   ?.outsourceDate
    ? customer.closedDetails
       .outsourceDate
       .substring(0,10)
    : "",

   internalName:
   customer?.closedDetails
   ?.internalName || "",

   internalDate:
   customer?.closedDetails
   ?.internalDate
    ? customer.closedDetails
       .internalDate
       .substring(0,10)
    : "",

   invoiceNumber:
   customer?.closedDetails
   ?.invoiceNumber || ""

  }

 });

 const handleChange = (e)=>{

  setForm({

   ...form,

   [e.target.name]:
   e.target.value

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

  let engineers =
  [...form.closedDetails.engineers];

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

 const updateCustomer =
 async(e)=>{

  e.preventDefault();

  try{

   await API.put(

    `/customers/${customer._id}`,

    form

   );

   alert(
    "Customer Updated Successfully"
   );

   refresh();

   closeModal();

  }
  catch(error){

   console.log(error);

   alert(
    error.response?.data?.message ||
    "Update Failed"
   );

  }

 };

 return(

<div className="modal-overlay">

<div className="modal-container customer-modal">

<div className="modal-header">

<h2>Edit Customer</h2>

<button
 className="close-btn"
 onClick={closeModal}
>
 ✕
</button>

</div>

<form
 className="customer-form"
 onSubmit={updateCustomer}
>



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

<div className="form-section">

<h3>Lead Information</h3>

<div className="form-grid">

<select
 name="service"
 value={form.service}
 onChange={handleChange}
>
 <option>Service</option>
 <option>Product</option>
 <option>Solution</option>
 <option>Service + Product</option>
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
 name="leadStage"
 value={form.leadStage}
 onChange={handleChange}
>
 <option>Awareness</option>
 <option>Interest</option>
 <option>Desire</option>
 <option>Closure</option>
</select>

<select
 name="priority"
 value={form.priority}
 onChange={handleChange}
>
 <option>Low</option>
 <option>Medium</option>
 <option>High</option>
</select>

<select
 name="source"
 value={form.source}
 onChange={handleChange}
>
 <option>Website</option>
 <option>Referral</option>
 <option>Expo</option>
 <option>Social media</option>
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

{
 form.leadStatus ===
 "Quotation Shared"
 &&

<div className="form-section">

<h3>Quotation Details</h3>

<div className="checkbox-row">

<label>

<input
 type="checkbox"
 name="whatsappShared"
 checked={
 form.quotationShared.whatsappShared
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
 form.quotationShared.emailShared
 }
 onChange={handleQuotation}
/>

Email Shared

</label>

</div>

<div className="form-grid">

<select
 name="gstType"
 value={
 form.quotationShared.gstType
 }
 onChange={handleQuotation}
>
 <option value="GST">GST</option>
 <option value="NO GST">NO GST</option>
</select>

<input
 placeholder="Quotation Number"
 name="quotationNumber"
 value={
 form.quotationShared.quotationNumber
 }
 onChange={handleQuotation}
/>

</div>

</div>
}

{/* CLOSED */}

{
 form.leadStatus ===
 "Closed"
 &&

<div className="form-section">

<h3>Closed Details</h3>

<div className="checkbox-row">

{
[
 "Engineer 1",
 "Engineer 2",
 "Engineer 3"
]
.map(eng=>(

<label key={eng}>

<input
 type="checkbox"
 checked={
 form.closedDetails.engineers.includes(
 eng
 )
 }
 onChange={()=>
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
 placeholder="Field Engineer"
 name="fieldEngineer"
 value={
 form.closedDetails.fieldEngineer
 }
 onChange={handleClosed}
/>

<input
 placeholder="Invoice Number"
 name="invoiceNumber"
 value={
 form.closedDetails.invoiceNumber
 }
 onChange={handleClosed}
/>

<input
 placeholder="Outsource Name"
 name="outsourceName"
 value={
 form.closedDetails.outsourceName
 }
 onChange={handleClosed}
/>

<input
 type="date"
 name="outsourceDate"
 value={
 form.closedDetails.outsourceDate
 }
 onChange={handleClosed}
/>

<input
 placeholder="Internal Name"
 name="internalName"
 value={
 form.closedDetails.internalName
 }
 onChange={handleClosed}
/>

<input
 type="date"
 name="internalDate"
 value={
 form.closedDetails.internalDate
 }
 onChange={handleClosed}
/>

</div>

</div>
}

{/* EXTRA */}

<div className="form-section">

<h3>Additional Information</h3>

<div className="form-grid">

<input
 placeholder="Assigned To"
 name="assignedTo"
 value={form.assignedTo}
 onChange={handleChange}
/>

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

<button
 type="submit"
 className="save-btn1"
>
 Update Customer
</button>

<button
 type="button"
 className="cancel-btn1"
 onClick={closeModal}
>
 Cancel
</button>

</div>

</form>


</div>

</div>

 );

};

export default EditCustomerModal;