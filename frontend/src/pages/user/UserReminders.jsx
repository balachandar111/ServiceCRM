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

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;

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

<CustomerDetailsModal

 customer={customerForm}

 closeModal={()=>
 setShowCustomerPopup(false)
}

 onEdit={()=>{
  setShowCustomerPopup(false);
  setEditMode(true);
 }}

 onDelete={()=>
 deleteCustomer(
  customerForm._id
 )
}

/>

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