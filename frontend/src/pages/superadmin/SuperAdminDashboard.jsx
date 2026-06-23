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
 fetchOverallDashboard();

}, []);
const fetchOverallDashboard = async() => {

 try{

  const { data } =
  await API.get(
   "/admins/overall-dashboard"
  );

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

const pendingLeads =
adminUsers.filter(
 user =>
 user.approvalStatus === "Pending"
).length;

const approvedLeads =
adminUsers.filter(
 user =>
 user.approvalStatus === "Approved"
).length;

const rejectedLeads =
adminUsers.filter(
 user =>
 user.approvalStatus === "Rejected"
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
<div className="super-admin-dashboard">

  {/* Header */}
 <div className="superadmin-section">

  <h2 className="section-title">
    Super Admin Overview
  </h2>

  <div className="stats-grid">

    <div className="stat-card super-card">
      <FaBuilding className="stat-icon" />
      <div>
        <h4>Organizations</h4>
        <h2>{organizations.length}</h2>
      </div>
    </div>

    <div className="stat-card super-card">
      <FaUserTie className="stat-icon" />
      <div>
        <h4>Admins</h4>
        <h2>{admins.length}</h2>
      </div>
    </div>

  

   <div className="stat-card super-card">
  <FaChartLine className="stat-icon" />
  <div>
    <h4>Pending Leads</h4>
    <h2>{pendingLeads}</h2>
  </div>
</div>



  </div>

</div>

  {/* Admin Selector */}
    <h2 className="section-title">
    Admin Overview
  </h2>

<div className="filter-card">

  <h3>
    Select Admin Analytics
  </h3>

  <select
    value={selectedAdmin}
    onChange={(e)=>{

      const id =
      e.target.value;

      setSelectedAdmin(id);

      if(id){

        fetchAdminAnalytics(id);

      }else{

        fetchOverallDashboard();

      }

    }}
  >

    <option value="">
      Overall Dashboard
    </option>

    {admins.map(admin=>(
      <option
        key={admin._id}
        value={admin._id}
      >
        {admin.name}
      </option>
    ))}

  </select>

</div>

  {/* Admin Stats */}

{dashboardData && (

<div className="stats-grid">

 <div className="stat-card">
  <h4>Total Leads</h4>
  <h2>{totalLeads}</h2>
 </div>

 <div className="stat-card">
  <h4>Active Leads</h4>
  <h2>{activeLeads}</h2>
 </div>

 <div className="stat-card">
  <h4>Quotation Shared</h4>
  <h2>{quotationShared}</h2>
 </div>

 <div className="stat-card">
  <h4>Closed Leads</h4>
  <h2>{closedLeads}</h2>
 </div>

 <div className="stat-card">
  <h4>Follow-up Calls</h4>
  <h2>{followUpCalls}</h2>
 </div>

 <div className="stat-card">
  <h4>Payment Follow-up</h4>
  <h2>{followUpPayment}</h2>
 </div>

 <div className="stat-card">
  <h4>New Customers</h4>
  <h2>{newCustomers}</h2>
 </div>

 <div className="stat-card">
  <h4>Old Customers</h4>
  <h2>{oldCustomers}</h2>
 </div>

</div>

)}

  {/* Charts */}

 {
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
