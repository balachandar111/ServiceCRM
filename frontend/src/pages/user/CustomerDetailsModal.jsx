import React from "react";

import "./CustomerDetailsModal.css"
const CustomerDetailsModal = ({
 customer,
 closeModal
}) => {

 if(!customer) return null;

 return (

<div
 className="modal-overlay"
 onClick={closeModal}
>

<div
 className="details-modal"
 onClick={(e)=>
  e.stopPropagation()
 }
>

<div className="modal-header">

<h2>
 Customer Details
</h2>

<button
 className="close-btn"
 onClick={closeModal}
>
 ✕
</button>

</div>

<div className="details-body">

{/* CUSTOMER INFO */}

<div className="details-section">

<h3>
 Customer Information
</h3>

<div className="details-grid">

<div>
<label>Name</label>
<p>{customer.name}</p>
</div>

<div>
<label>Company</label>
<p>{customer.company || "-"}</p>
</div>

<div>
<label>Phone Number</label>
<p>{customer.phoneNumber || "-"}</p>
</div>

<div>
<label>Email</label>
<p>{customer.email || "-"}</p>
</div>

</div>

</div>

{/* LEAD INFO */}

<div className="details-section">

<h3>
 Lead Information
</h3>

<div className="details-grid">

<div>
<label>Service</label>
<p>{customer.service}</p>
</div>

<div>
<label>Status</label>
<p>{customer.status}</p>
</div>

<div>
<label>Customer Level</label>
<p>{customer.customerLevel}</p>
</div>

<div>
<label>Call Type</label>
<p>{customer.callType}</p>
</div>

<div>
<label>Lead Status</label>
<p>{customer.leadStatus}</p>
</div>

<div>
<label>Lead Stage</label>
<p>{customer.leadStage}</p>
</div>

<div>
<label>Priority</label>
<p>{customer.priority}</p>
</div>

<div>
<label>Source</label>
<p>{customer.source}</p>
</div>

</div>

</div>

{/* FOLLOWUP */}

<div className="details-section">

<h3>
 Follow Up Details
</h3>

<div className="details-grid">

<div>
<label>Follow Up Type</label>
<p>{customer.followUpType}</p>
</div>

<div>
<label>Follow Up Date</label>
<p>

{
 customer.followUpDate
 ? new Date(
    customer.followUpDate
   ).toLocaleDateString()
 : "-"
}

</p>
</div>

</div>

</div>

{/* QUOTATION */}

{
 customer.leadStatus ===
 "Quotation Shared"
 &&

<div className="details-section">

<h3>
 Quotation Details
</h3>

<div className="details-grid">

<div>
<label>WhatsApp Shared</label>
<p>
{
 customer.quotationShared
 ?.whatsappShared
 ? "Yes"
 : "No"
}
</p>
</div>

<div>
<label>Email Shared</label>
<p>
{
 customer.quotationShared
 ?.emailShared
 ? "Yes"
 : "No"
}
</p>
</div>

<div>
<label>GST Type</label>
<p>
{
 customer.quotationShared
 ?.gstType
 || "-"
}
</p>
</div>

<div>
<label>Quotation Number</label>
<p>
{
 customer.quotationShared
 ?.quotationNumber
 || "-"
}
</p>
</div>

</div>

</div>
}

{/* CLOSED DETAILS */}

{
 customer.leadStatus ===
 "Closed"
 &&

<div className="details-section">

<h3>
 Closed Details
</h3>

<div className="details-grid">

<div>
<label>Engineers</label>

<p>

{
 customer.closedDetails
 ?.engineers
 ?.join(", ")
 || "-"
}

</p>

</div>

<div>
<label>Field Engineer</label>
<p>
{
 customer.closedDetails
 ?.fieldEngineer
 || "-"
}
</p>
</div>

<div>
<label>Invoice Number</label>
<p>
{
 customer.closedDetails
 ?.invoiceNumber
 || "-"
}
</p>
</div>

<div>
<label>Outsource Name</label>
<p>
{
 customer.closedDetails
 ?.outsourceName
 || "-"
}
</p>
</div>

<div>
<label>Outsource Date</label>
<p>

{
 customer.closedDetails
 ?.outsourceDate

 ? new Date(
    customer.closedDetails
    .outsourceDate
   ).toLocaleDateString()

 : "-"
}

</p>
</div>

<div>
<label>Internal Name</label>
<p>
{
 customer.closedDetails
 ?.internalName
 || "-"
}
</p>
</div>

<div>
<label>Internal Date</label>
<p>

{
 customer.closedDetails
 ?.internalDate

 ? new Date(
    customer.closedDetails
    .internalDate
   ).toLocaleDateString()

 : "-"
}

</p>
</div>

</div>

</div>
}

{/* EXTRA */}

<div className="details-section">

<h3>
 Additional Information
</h3>

<div className="details-grid">

<div>
<label>Assigned To</label>

<p>

{
 customer.assignedTo?.name ||

 customer.assignedTo ||

 "-"

}

</p>

</div>

<div>
<label>Sector</label>
<p>
{
 customer.sector || "-"
}
</p>
</div>

<div>
<label>Expense</label>
<p>
{
 customer.expense || 0
}
</p>
</div>

<div>
<label>Created Date</label>

<p>

{
 customer.createdAt

 ? new Date(
    customer.createdAt
   ).toLocaleString()

 : "-"
}

</p>

</div>

</div>

<div className="remarks-box">

<label>
 Remarks
</label>

<p>
{
 customer.remark ||
 "No Remarks"
}
</p>

</div>

</div>

</div>

</div>

</div>

 );

};

export default CustomerDetailsModal;