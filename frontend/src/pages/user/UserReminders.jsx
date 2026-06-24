import React,{
 useEffect,
 useState
}
from "react";

import Calendar
from "react-calendar";

import "react-calendar/dist/Calendar.css";
import EditCustomerModal
from "./EditCustomerModel";

import API
from "../../services/api";

import CustomerDetailsModal
from "./CustomerDetailsModal";

import "./UserReminders.css";

const UserReminders = ()=>{

 const [customers,setCustomers] =
 useState([]);

 const [selectedDate,
 setSelectedDate] =
 useState(new Date());

 const [showCustomerPopup,setShowCustomerPopup] =
useState(false);
const deleteCustomer = async(id)=>{

 if(
  !window.confirm(
   "Delete Customer?"
  )
 ) return;

 try{

  await API.delete(
   `/customers/${id}`
  );

  fetchCustomers();

  setShowCustomerPopup(false);

 }
 catch(error){

  console.log(error);

 }

};

const [editMode,setEditMode] =
useState(false);

const [customerForm,setCustomerForm] =
useState({});

 const [selectedCustomer,
 setSelectedCustomer] =
 useState(null);

 const [showDetails,
 setShowDetails] =
 useState(false);

 useEffect(()=>{

  fetchCustomers();

 },[]);

 const fetchCustomers =
 async()=>{

  try{

   const {data} =
   await API.get(
    "/customers"
   );

   setCustomers(
    data.data || []
   );

  }
  catch(error){

   console.log(error);

  }

 };

 const formatDate =
 (date)=>{

  return date
  .toISOString()
  .split("T")[0];

 };

 const selectedCustomers =
 customers.filter(customer=>

 customer.followUpDate
 ?.slice(0,10) ===
 formatDate(
  selectedDate
 )

 );

 const today =
 new Date();

 const todayReminders =
 customers.filter(customer=>

 customer.followUpDate
 ?.slice(0,10) ===
 formatDate(today)

 );

 return(

<div className="reminder-page">

<div className="reminder-header">

<h1>
 Follow Up Reminders
</h1>

<p>
 View customer follow ups
</p>

</div>

{
 todayReminders.length > 0 &&

<div className="today-alert">

🔔 You have

{" "}
{todayReminders.length}

{" "}

follow-ups today

</div>
}

<div className="reminder-grid">

{/* CALENDAR */}

<div className="calendar-card">

<Calendar

 className=
 "modern-calendar"

 value={
  selectedDate
 }

 onChange={
  setSelectedDate
 }

 tileClassName={({
  date
 })=>{

  const formatted =
  formatDate(date);

  const hasReminder =
  customers.some(
   customer=>

   customer.followUpDate
   ?.slice(0,10)
   === formatted
  );

  return hasReminder
  ? "highlight-date"
  : null;

 }}

 />

</div>

{/* FOLLOWUPS */}

<div className="followup-card">

<div className="followup-header">

<h2>
 Follow Ups
</h2>

<span
 className="date-badge"
>

{
 selectedDate
 .toDateString()
}

</span>

</div>

{
 selectedCustomers.length === 0

 ?

<div
 className="empty-state"
>

No Follow Ups

</div>

:

selectedCustomers.map(
 customer=>(

<div

 key={customer._id}

 className="customer-box"

 onClick={() => {

 setSelectedCustomer(customer);

 setCustomerForm(customer);

 setShowCustomerPopup(true);

}}

>

<div>

<h3>
 {customer.name}
</h3>

<p>
 {customer.company}
</p>

<small>
 {customer.phoneNumber}
</small>

</div>

<div
 className="right-box"
>

<span
 className="priority-pill"
>

{
 customer.priority
}

</span>

<span
 className="stage-pill"
>

{
 customer.leadStage
}

</span>

</div>

</div>

))
}

</div>

</div>

{
showCustomerPopup &&
customerForm && (

<div className="popup-overlay">

<div className="customer-popup">

<div className="popup-header">

<h2>
Customer Details
</h2>

<button
className="close-btn2"
onClick={()=>
setShowCustomerPopup(false)
}
>
✕
</button>

</div>

<div className="popup-content">

<div className="detail-grid">

<div>
<label>Name</label>
<p>{customerForm.name}</p>
</div>

<div>
<label>Company</label>
<p>{customerForm.company}</p>
</div>

<div>
<label>Phone</label>
<p>{customerForm.phoneNumber}</p>
</div>

<div>
<label>Email</label>
<p>{customerForm.email}</p>
</div>

<div>
<label>Service</label>
<p>{customerForm.service}</p>
</div>

<div>
<label>Status</label>
<p>{customerForm.status}</p>
</div>

<div>
<label>Customer Level</label>
<p>{customerForm.customerLevel}</p>
</div>

<div>
<label>Call Type</label>
<p>{customerForm.callType}</p>
</div>

<div>
<label>Lead Status</label>
<p>{customerForm.leadStatus}</p>
</div>

<div>
<label>Lead Stage</label>
<p>{customerForm.leadStage}</p>
</div>

<div>
<label>Priority</label>
<p>{customerForm.priority}</p>
</div>

<div>
<label>Source</label>
<p>{customerForm.source}</p>
</div>

<div>
<label>Follow Up Type</label>
<p>{customerForm.followUpType}</p>
</div>

<div>
<label>Follow Up Date</label>
<p>
{
customerForm.followUpDate
? new Date(
customerForm.followUpDate
).toLocaleDateString()
: "-"
}
</p>
</div>

<div>
<label>Assigned To</label>
<p>{customerForm.assignedTo}</p>
</div>

<div>
<label>Sector</label>
<p>{customerForm.sector}</p>
</div>

<div>
<label>Expense</label>
<p>
{customerForm.expense}
</p>
</div>

</div>

<div className="remarks-box">

<label>
Remarks
</label>

<p>
{customerForm.remark}
</p>

</div>

{
customerForm.leadStatus ===
"Quotation Shared" && (

<div className="extra-section">

<h3>
Quotation Details
</h3>

<div className="detail-grid">

<div>
<label>
WhatsApp Shared
</label>
<p>
{
customerForm.quotationShared
?.whatsappShared
? "Yes"
: "No"
}
</p>
</div>

<div>
<label>
Email Shared
</label>
<p>
{
customerForm.quotationShared
?.emailShared
? "Yes"
: "No"
}
</p>
</div>

<div>
<label>
GST Type
</label>
<p>
{
customerForm.quotationShared
?.gstType
}
</p>
</div>

<div>
<label>
Quotation No
</label>
<p>
{
customerForm.quotationShared
?.quotationNumber
}
</p>
</div>

</div>

</div>

)
}

{
customerForm.leadStatus ===
"Closed" && (

<div className="extra-section">

<h3>
Closed Details
</h3>

<div className="detail-grid">

<div>
<label>
Field Engineer
</label>

<p>
{
customerForm.closedDetails
?.fieldEngineer
}
</p>

</div>

<div>
<label>
Invoice Number
</label>

<p>
{
customerForm.closedDetails
?.invoiceNumber
}
</p>

</div>

<div>
<label>
Outsource Name
</label>

<p>
{
customerForm.closedDetails
?.outsourceName
}
</p>

</div>

<div>
<label>
Internal Name
</label>

<p>
{
customerForm.closedDetails
?.internalName
}
</p>

</div>

</div>

</div>

)
}

<div className="popup-actions">

<button
className="edit-btn2"
onClick={()=>{
 setShowCustomerPopup(false);
 setEditMode(true);
}}
>
Update Customer
</button>

<button
className="delete-btn2"
onClick={()=>
deleteCustomer(
 customerForm._id
)
}
>
Delete Customer
</button>

</div>

</div>

</div>

</div>

)
}
{
editMode &&

<EditCustomerModal

 customer={customerForm}

 refresh={fetchCustomers}

 closeModal={()=>
 setEditMode(false)
}

/>

}

</div>

 );

};

export default UserReminders;