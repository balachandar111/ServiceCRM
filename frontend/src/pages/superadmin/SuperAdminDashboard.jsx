import React, {
  useEffect,
  useState
} from "react";

import API from "../../services/api";

import {
  FaBuilding,
  FaUserTie,
  FaUsers,
  FaPhone,
  FaMoneyBill,
  FaChartLine
} from "react-icons/fa";

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
 AreaChart,
 Area,
 LineChart,
 Line
} from "recharts";

import "./SuperAdminDashboard.css";

const SuperAdminDashboard = () => {

const [organizations,setOrganizations] =
useState([]);

const [admins,setAdmins] =
useState([]);

const [selectedAdmin,setSelectedAdmin] =
useState("");

const [dashboardData,setDashboardData] =
useState(null);

const [adminUsers,setAdminUsers] =
useState([]);

const totalLeads =
dashboardData?.totalLeads || 0;

const activeLeads =
dashboardData?.activeLeads || 0;

const quotationShared =
dashboardData?.quotationShared || 0;

const closedLeads =
dashboardData?.closedLeads || 0;

const followUpCalls =
dashboardData?.callFollowups || 0;

const followUpPayment =
dashboardData?.paymentFollowups || 0;

const newCustomers =
dashboardData?.newCustomers || 0;

const oldCustomers =
dashboardData?.oldCustomers || 0;

useEffect(() => {

 fetchOrganizations();
 fetchAdmins();

}, []);

const pendingLeads =
adminUsers.filter(
 item =>
 item.leadStatus === "Pending"
).length;

const fetchOrganizations = async() => {

 try {

  const { data } =
  await API.get("/organizations");

  setOrganizations(data.data);

 }
 catch(error){

  console.log(error);

 }

};
const fetchAdmins = async() => {

 try {

  const { data } =
  await API.get("/admins/all-admins");

  setAdmins(data.data);

 }
 catch(error){

  console.log(error);

 }

};
const fetchAdminAnalytics = async(id)=>{

 try{

  const { data } =
  await API.get(
   `/admins/dashboard/${id}`
  );

  console.log(data);

  setDashboardData(
   data.data
  );

  setAdminUsers(
   data.data.users || []
  );

 }
 catch(error){

  console.log(error);

 }

};

const leadStageData = [
 {
  name: "Awareness",
  value: adminUsers.filter(
   u => u.leadStage === "Awareness"
  ).length
 },
 {
  name: "Interest",
  value: adminUsers.filter(
   u => u.leadStage === "Interest"
  ).length
 },
 {
  name: "Desire",
  value: adminUsers.filter(
   u => u.leadStage === "Desire"
  ).length
 },
 {
  name: "Closure",
  value: adminUsers.filter(
   u => u.leadStage === "Closure"
  ).length
 }
];

const priorityData = [
 {
  name: "High",
  value: adminUsers.filter(
   u => u.priority === "High"
  ).length
 },
 {
  name: "Medium",
  value: adminUsers.filter(
   u => u.priority === "Medium"
  ).length
 },
 {
  name: "Low",
  value: adminUsers.filter(
   u => u.priority === "Low"
  ).length
 }
];

const customerLevelData = [
 {
  name: "New",
  value: adminUsers.filter(
   u => u.customerLevel === "New"
  ).length
 },
 {
  name: "Old",
  value: adminUsers.filter(
   u => u.customerLevel === "Old"
  ).length
 }
];

const serviceData = [
 {
  name: "Service",
  value: adminUsers.filter(
   u => u.service === "Service"
  ).length
 },
 {
  name: "Sales",
  value: adminUsers.filter(
   u => u.service === "Sales"
  ).length
 }
];

const callTypeData = [
 {
  name: "AMC",
  value: adminUsers.filter(
   u => u.callType === "AMC"
  ).length
 },
 {
  name: "Breakdown",
  value: adminUsers.filter(
   u => u.callType === "Breakdown"
  ).length
 },
 {
  name: "Installation",
  value: adminUsers.filter(
   u => u.callType === "Installation"
  ).length
 }
];

const leadStatusData = [
 {
  name: "Waiting",
  value: adminUsers.filter(
   u => u.status === "Waiting for Internal"
  ).length
 },
 {
  name: "Quotation",
  value: adminUsers.filter(
   u => u.leadStatus === "Quotation Shared"
  ).length
 },
 {
  name: "Closed",
  value: adminUsers.filter(
   u => u.leadStatus === "Closed"
  ).length
 }
];

const COLORS = [
 "#2563EB",
 "#10B981",
 "#F59E0B",
 "#EF4444"
];

  return (

   <div>
     <div className="dashboard-header">
  <div>
    <h1>SuperAdmin Analytics Dashboard</h1>
    <p>Lead Management & Performance Overview</p>
  </div>
</div>
<div className="stats-grid">

<div className="stat-card">
<FaBuilding className="stat-icon"/>
<h3>Total Organizations</h3>
<h1>{organizations.length}</h1>
</div>

<div className="stat-card">
<FaUserTie className="stat-icon"/>
<h3>Total Admins</h3>
<h1>{admins.length}</h1>
</div>

<div className="stat-card">
  <FaUsers className="stat-icon"/>

  <h3>Total Pending Leads</h3>

  <h1>{pendingLeads}</h1>
</div>

</div>

<div className="admin-filter-card">

<h3>Select Admin</h3>

<select
value={selectedAdmin}
onChange={(e)=>{

 setSelectedAdmin(
  e.target.value
 );

 fetchAdminAnalytics(
  e.target.value
 );

}}
>

<option value="">
Select Admin
</option>

{
admins.map(admin => (

<option
key={admin._id}
value={admin._id}
>
{admin.name}
</option>

))
}

</select>

</div>
{
selectedAdmin &&
dashboardData && (

<div className="stats-grid">

<div className="stat-card">
<FaUsers/>
<h3>Total Leads</h3>
<h1>{totalLeads}</h1>
</div>

<div className="stat-card">
<FaPhone/>
<h3>Follow Up Calls</h3>
<h1>{followUpCalls}</h1>
</div>

<div className="stat-card">
<FaMoneyBill/>
<h3>Payment Followups</h3>
<h1>{followUpPayment}</h1>
</div>

<div className="stat-card">
<FaChartLine/>
<h3>Active Leads</h3>
<h1>{activeLeads}</h1>
</div>

<div className="stat-card">
<h3>Quotation Shared</h3>
<h1>{quotationShared}</h1>
</div>

<div className="stat-card">
<h3>Closed Leads</h3>
<h1>{closedLeads}</h1>
</div>

<div className="stat-card">
<h3>New Customers</h3>
<h1>{newCustomers}</h1>
</div>

<div className="stat-card">
<h3>Old Customers</h3>
<h1>{oldCustomers}</h1>
</div>

</div>

)
}

{
selectedAdmin &&
adminUsers.length > 0 && (

<div className="charts-grid">

<div className="chart-card">

<h3>Lead Stage Analytics</h3>

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
  (entry,index)=>(

   <Cell
    key={index}
    fill={
     COLORS[index]
    }
   />

  )
 )
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

<XAxis dataKey="name"/>

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

<h3>Customer Level</h3>

<ResponsiveContainer
 width="100%"
 height={300}
>

<BarChart
 data={customerLevelData}
>

<CartesianGrid
 strokeDasharray="3 3"
/>

<XAxis dataKey="name"/>

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

<h3>Service Analytics</h3>

<ResponsiveContainer
 width="100%"
 height={300}
>

<PieChart>

<Pie
 data={serviceData}
 dataKey="value"
 outerRadius={100}
 label
>

{
 serviceData.map(
  (entry,index)=>(

   <Cell
    key={index}
    fill={
     COLORS[index]
    }
   />

  )
 )
}

</Pie>

<Tooltip/>

</PieChart>

</ResponsiveContainer>

</div>

<div className="chart-card">

<h3>Call Type Analytics</h3>

<ResponsiveContainer
 width="100%"
 height={300}
>

<AreaChart
 data={callTypeData}
>

<CartesianGrid
 strokeDasharray="3 3"
/>

<XAxis
 dataKey="name"
/>

<YAxis/>

<Tooltip/>

<Area
 type="monotone"
 dataKey="value"
 stroke="#7C3AED"
 fill="#C4B5FD"
/>

</AreaChart>

</ResponsiveContainer>

</div>
<div className="chart-card">

<h3>Lead Status Analytics</h3>

<ResponsiveContainer
 width="100%"
 height={300}
>

<LineChart
 data={leadStatusData}
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
 type="monotone"
 dataKey="value"
 stroke="#EF4444"
 strokeWidth={4}
/>

</LineChart>

</ResponsiveContainer>

</div>

</div>

)
}
    
   </div>

  );

};

export default SuperAdminDashboard;