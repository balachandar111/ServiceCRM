import React, {
 useEffect,
 useState
} from "react";

import API from "../../services/api";

import {
 FaUsers,
 FaPhone,
 FaMoneyBill,
 FaChartLine,
 FaCheckCircle,
 FaUserPlus,
 FaUserFriends,
  FaBell
}
from "react-icons/fa";

import {
 ResponsiveContainer,
 PieChart,
 Pie,
 Cell,
 Tooltip,
 BarChart,
 Bar,
 XAxis,
 YAxis,
 CartesianGrid,
 LineChart,
 Line
}
from "recharts";
import "./CustomerAnalytics.css"


const COLORS = [
 "#2563EB",
 "#10B981",
 "#F59E0B",
 "#EF4444",
 "#8B5CF6",
 "#06B6D4"
];

const CustomerAnalytics = () => {

 const [customers,setCustomers] =
 useState([]);

 useEffect(()=>{

  fetchCustomers();

 },[]);

 

 const fetchCustomers =
 async()=>{

  try{

   const { data } =
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
 
 const [fromDate,setFromDate] =
useState("");

const [toDate,setToDate] =
useState("");
const filteredCustomers =
customers.filter(customer=>{

 if(!fromDate && !toDate)
 return true;

 const created =
 new Date(customer.createdAt);

 const from =
 fromDate
 ? new Date(fromDate)
 : null;

 const to =
 toDate
 ? new Date(toDate)
 : null;

 if(from && created < from)
 return false;

 if(to){

  to.setHours(
   23,59,59,999
  );

  if(created > to)
  return false;
 }

 return true;

});

 const totalCustomers =
 filteredCustomers.length;

 const activeLeads =
 filteredCustomers.filter(
  item =>
  item.status !== "Closed"
 ).length;

 const quotationShared =
 filteredCustomers.filter(
  item =>
  item.leadStatus ===
  "Quotation Shared"
 ).length;

 const closedLeads =
 filteredCustomers.filter(
  item =>
  item.leadStatus ===
  "Closed"
 ).length;

 const followUpCalls =
 filteredCustomers.filter(
  item =>
  item.followUpType ===
  "Calls"
 ).length;

 const followUpPayments =
 filteredCustomers.filter(
  item =>
  item.followUpType ===
  "Payment"
 ).length;

 const newCustomers =
 filteredCustomers.filter(
  item =>
  item.customerLevel ===
  "New"
 ).length;

 const oldCustomers =
 filteredCustomers.filter(
  item =>
  item.customerLevel ===
  "Old"
 ).length;

 const today = new Date();

const todayString =
today.toISOString()
.slice(0,10);

const todayReminders =
filteredCustomers.filter(
 customer =>

 customer.followUpDate &&
 customer.followUpDate
 .slice(0,10) ===
 todayString

).length;

 const leadStageData = [

  {
   name:"Awareness",
   value:
  filteredCustomers.filter(
    x=>x.leadStage==="Awareness"
   ).length
  },

  {
   name:"Interest",
   value:
   filteredCustomers.filter(
    x=>x.leadStage==="Interest"
   ).length
  },

  {
   name:"Desire",
   value:
   filteredCustomers.filter(
    x=>x.leadStage==="Desire"
   ).length
  },

  {
   name:"Closure",
   value:
   filteredCustomers.filter(
    x=>x.leadStage==="Closure"
   ).length
  }

 ];

 const priorityData = [

  {
   name:"Low",
   value:
   filteredCustomers.filter(
    x=>x.priority==="Low"
   ).length
  },

  {
   name:"Medium",
   value:
   filteredCustomers.filter(
    x=>x.priority==="Medium"
   ).length
  },

  {
   name:"High",
   value:
   filteredCustomers.filter(
    x=>x.priority==="High"
   ).length
  }

 ];

 const sourceData = [

  {
   name:"Website",
   value:
   filteredCustomers.filter(
    x=>x.source==="Website"
   ).length
  },

  {
   name:"Referral",
   value:
   filteredCustomers.filter(
    x=>x.source==="Referral"
   ).length
  },

  {
   name:"Expo",
   value:
   filteredCustomers.filter(
    x=>x.source==="Expo"
   ).length
  },

  {
   name:"Social",
   value:
   filteredCustomers.filter(
    x=>x.source==="Social media"
   ).length
  }

 ];

 const serviceData = [

  {
   name:"Service",
   value:
   filteredCustomers.filter(
    x=>x.service==="Service"
   ).length
  },

  {
   name:"Product",
   value:
   filteredCustomers.filter(
    x=>x.service==="Product"
   ).length
  },

  {
   name:"Solution",
   value:
   filteredCustomers.filter(
    x=>x.service==="Solution"
   ).length
  }

 ];

 const customerLevelData = [

  {
   name:"New",
   value:newCustomers
  },

  {
   name:"Old",
   value:oldCustomers
  }

 ];
 const monthlyTrendData = [];

const monthMap = {};

filteredCustomers.forEach(customer => {

 const date = new Date(
  customer.createdAt
 );

 const month =
 date.toLocaleString(
  "default",
  {
   month:"short"
  }
 );

 const year =
 date.getFullYear();

 const key =
 `${month}-${year}`;

 monthMap[key] =
 (monthMap[key] || 0) + 1;

});

Object.keys(monthMap).forEach(
 key => {

  monthlyTrendData.push({

   month:key,

   customers:
   monthMap[key]

  });

 }
);

 return(

<div className="analytics-page">

<div className="analytics-header">


 <h1>
  Customer Analytics
 </h1>

 <p>
  CRM Performance Overview
 </p>

</div>

<div className="analytics-filter">

 <div>

  <label>
   From Date
  </label>

  <input
   type="date"
   value={fromDate}
   onChange={(e)=>
    setFromDate(
     e.target.value
    )
   }
  />

 </div>

 <div>

  <label>
   To Date
  </label>

  <input
   type="date"
   value={toDate}
   onChange={(e)=>
    setToDate(
     e.target.value
    )
   }
  />

 </div>

 <button
  className="clear-filter"
  onClick={()=>{
   setFromDate("");
   setToDate("");
  }}
 >
  Clear
 </button>

</div>


<div className="stats-grid">
    

 <div className="stat-card">
  <FaUsers />
  <h4>Total Customers</h4>
  <h2>{totalCustomers}</h2>
 </div>

 <div className="stat-card">
  <FaChartLine />
  <h4>Active Leads</h4>
  <h2>{activeLeads}</h2>
 </div>

 <div className="stat-card">
  <FaCheckCircle />
  <h4>Quotation Shared</h4>
  <h2>{quotationShared}</h2>
 </div>

 <div className="stat-card">
  <FaCheckCircle />
  <h4>Closed Leads</h4>
  <h2>{closedLeads}</h2>
 </div>

 <div className="stat-card">
  <FaPhone />
  <h4>Follow Up Calls</h4>
  <h2>{followUpCalls}</h2>
 </div>

 <div className="stat-card">
  <FaMoneyBill />
  <h4>Payment Followups</h4>
  <h2>{followUpPayments}</h2>
 </div>

 <div className="stat-card">
  <FaUserPlus />
  <h4>New Customers</h4>
  <h2>{newCustomers}</h2>
 </div>

 <div className="stat-card">
  <FaUserFriends />
  <h4>Old Customers</h4>
  <h2>{oldCustomers}</h2>
 </div>
 <div className="stat-card reminder-card">

 <FaBell />

 <h4>
  Today's Reminders
 </h4>

 <h2>
  {todayReminders}
 </h2>

</div>

</div>

<div className="charts-grid">

<div className="chart-card">

<h3>Lead Stage</h3>

<ResponsiveContainer
 width="100%"
 height={300}
>

<PieChart>

<Pie
 data={leadStageData}
 dataKey="value"
 outerRadius={100}
 label
>

{
 leadStageData.map(
 (item,index)=>(

<Cell
 key={index}
 fill={COLORS[index]}
/>

 ))
}

</Pie>

<Tooltip/>

</PieChart>

</ResponsiveContainer>

</div>

<div className="chart-card">

<h3>Priority Analytics</h3>

<ResponsiveContainer
 width="100%"
 height={300}
>

<BarChart
 data={priorityData}
>

<CartesianGrid
 strokeDasharray="3 3"
/>

<XAxis
 dataKey="name"
/>

<YAxis/>

<Tooltip/>

<Bar
 dataKey="value"
 fill="#2563EB"
/>

</BarChart>

</ResponsiveContainer>

</div>

<div className="chart-card">

<h3>Lead Source</h3>

<ResponsiveContainer
 width="100%"
 height={300}
>

<PieChart>

<Pie
 data={sourceData}
 dataKey="value"
 outerRadius={100}
 label
>

{
 sourceData.map(
 (item,index)=>(

<Cell
 key={index}
 fill={COLORS[index]}
/>

 ))
}

</Pie>

<Tooltip/>

</PieChart>

</ResponsiveContainer>

</div>

<div className="chart-card">

<h3>Service Analytics</h3>

<ResponsiveContainer
 width="100%"
 height={300}
>

<BarChart
 data={serviceData}
>

<CartesianGrid
 strokeDasharray="3 3"
/>

<XAxis
 dataKey="name"
/>

<YAxis/>

<Tooltip/>

<Bar
 dataKey="value"
 fill="#10B981"
/>

</BarChart>

</ResponsiveContainer>

</div>

<div className="chart-card">

<h3>Customer Level</h3>

<ResponsiveContainer
 width="100%"
 height={300}
>

<LineChart
 data={customerLevelData}
>

<CartesianGrid
 strokeDasharray="3 3"
/>

<XAxis
 dataKey="name"
/>

<YAxis/>

<Tooltip/>

<Line
 dataKey="value"
 stroke="#EF4444"
 strokeWidth={4}
/>

</LineChart>

</ResponsiveContainer>

</div>
<div className="chart-card">

 <h3>
  Monthly Customer Trend
 </h3>

 <ResponsiveContainer
  width="100%"
  height={300}
 >

  <LineChart
   data={monthlyTrendData}
  >

   <CartesianGrid
    strokeDasharray="3 3"
   />

   <XAxis
    dataKey="month"
   />

   <YAxis />

   <Tooltip />

   <Line
    type="monotone"
    dataKey="customers"
    stroke="#2563EB"
    strokeWidth={4}
   />

  </LineChart>

 </ResponsiveContainer>

</div>

</div>

</div>

 );

};

export default CustomerAnalytics;