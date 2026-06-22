import React, {
 useEffect,
 useState
} from "react";

import API from "../../services/api";

import {
 FaUsers,
 FaPhone,
 FaMoneyBill,
 FaChartLine
}

from "react-icons/fa";
const COLORS = [
  "#2563EB",
  "#7C3AED",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#06B6D4"
];
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
  Line,
  AreaChart,
  Area
} from "recharts";

import "./AdminDashboard.css";

const AdminDashboard = () => {

 const [users,setUsers] =
 useState([]);
const [fromDate,setFromDate] =
useState("");

const [toDate,setToDate] =
useState("");
const filteredUsers = users.filter((user) => {

  if (!fromDate && !toDate) return true;

  const createdDate = new Date(user.createdAt);

  const from = fromDate
    ? new Date(fromDate)
    : null;

  const to = toDate
    ? new Date(toDate)
    : null;

  if (from && createdDate < from) {
    return false;
  }

  if (to) {
    to.setHours(23, 59, 59, 999);

    if (createdDate > to) {
      return false;
    }
  }

  return true;
});
 const fetchUsers =
 async()=>{

  try{

   const { data } =
   await API.get("/users");

   setUsers(data.data);

  }
  catch(error){

   console.log(error);

  }

 };

 useEffect(()=>{

  fetchUsers();

 },[]);
 const leadStageData = [

  {
    name: "Awareness",
    value: filteredUsers.filter(
      item => item.leadStage === "Awareness"
    ).length
  },

  {
    name: "Interest",
    value: filteredUsers.filter(
      item => item.leadStage === "Interest"
    ).length
  },

  {
    name: "Desire",
    value: filteredUsers.filter(
      item => item.leadStage === "Desire"
    ).length
  },

  {
    name: "Closure",
    value: filteredUsers.filter(
      item => item.leadStage === "Closure"
    ).length
  }

];
const priorityData = [

  {
    name: "Low",
    value: filteredUsers.filter(
      item => item.priority === "Low"
    ).length
  },

  {
    name: "Medium",
    value: filteredUsers.filter(
      item => item.priority === "Medium"
    ).length
  },

  {
    name: "High",
    value: filteredUsers.filter(
      item => item.priority === "High"
    ).length
  }

];
const serviceData = [

  {
    name: "Service",
    value: filteredUsers.filter(
      item => item.service === "Service"
    ).length
  },

  {
    name: "Service + Product",
    value: filteredUsers.filter(
      item => item.service === "Service + Product"
    ).length
  },

  {
    name: "Product",
    value: filteredUsers.filter(
      item => item.service === "Product"
    ).length
  },

  {
    name: "Solution",
    value: filteredUsers.filter(
      item => item.service === "Solution"
    ).length
  }

];
const statusData = [

  {
    name: "Waiting Internal",
    value: filteredUsers.filter(
      item => item.status === "Waiting for Internal"
    ).length
  },

  {
    name: "Waiting External",
    value: filteredUsers.filter(
      item => item.status === "Waiting for External"
    ).length
  },

  {
    name: "Waiting Customer",
    value: filteredUsers.filter(
      item => item.status === "Waiting for Customer"
    ).length
  }

];
const customerLevelData = [

  {
    name: "New",
    value: filteredUsers.filter(
      item => item.customerLevel === "New"
    ).length
  },

  {
    name: "Old",
    value: filteredUsers.filter(
      item => item.customerLevel === "Old"
    ).length
  }

];
const callTypeData = [

  {
    name: "AMC",
    value: filteredUsers.filter(
      item => item.callType === "AMC"
    ).length
  },

  {
    name: "Service",
    value: filteredUsers.filter(
      item => item.callType === "Service"
    ).length
  },

  {
    name: "Sale",
    value: filteredUsers.filter(
      item => item.callType === "Sale"
    ).length
  },

  {
    name: "Presales",
    value: filteredUsers.filter(
      item => item.callType === "Presales"
    ).length
  }

];
const leadStatusData = [

  {
    name: "Quotation Shared",
    value: filteredUsers.filter(
      item =>
      item.leadStatus ===
      "Quotation Shared"
    ).length
  },

  {
    name: "Closed",
    value: filteredUsers.filter(
      item =>
      item.leadStatus ===
      "Closed"
    ).length
  }

];

 const totalLeads = filteredUsers.length;
const followUpCalls =
filteredUsers.filter(
 item => item.followUpType === "Calls"
).length;

 const followUpPayment =
filteredUsers.filter(
 item => item.followUpType === "Payment"
).length;

const activeLeads =
filteredUsers.filter(
 item => item.loginStatus === "ACTIVE"
).length;

const quotationShared =
filteredUsers.filter(
 item => item.leadStatus === "Quotation Shared"
).length;

const closedLeads =
filteredUsers.filter(
 item => item.leadStatus === "Closed"
).length;

const newCustomers =
filteredUsers.filter(
 item => item.customerLevel === "New"
).length;

const oldCustomers =
filteredUsers.filter(
 item => item.customerLevel === "Old"
).length;

 return(

 <div >



  <div className="dashboard-header">
  <div>
    <h1>Admin Analytics Dashboard</h1>
    <p>Lead Management & Performance Overview</p>
  </div>
</div>
 
   <div className="date-filter-container">

 <div className="date-filter-box">

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

 <div className="date-filter-box">

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
 className="clear-filter-btn"
 onClick={() => {
   setFromDate("");
   setToDate("");
 }}
>
 Clear
</button>

</div>

   <div className="stats-grid">
    

    <div className="stat-card">

     <FaUsers
      className="stat-icon"
     />

     <h4>
      Total Leads
     </h4>

     <h2>
      {totalLeads}
     </h2>

    </div>

    <div className="stat-card">

     <FaPhone
      className="stat-icon"
     />

     <h4>
      Follow Up Calls
     </h4>

     <h2>
      {followUpCalls}
     </h2>

    </div>

    <div className="stat-card">

     <FaMoneyBill
      className="stat-icon"
     />

     <h4>
      Follow Up Payment
     </h4>

     <h2>
      {followUpPayment}
     </h2>

    </div>

    <div className="stat-card">

     <FaChartLine
      className="stat-icon"
     />

     <h4>
      Active Leads
     </h4>

     <h2>
      {activeLeads}
     </h2>

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
 <h4>New Customers</h4>
 <h2>{newCustomers}</h2>
</div>

<div className="stat-card">
 <h4>Old Customers</h4>
 <h2>{oldCustomers}</h2>
</div>
   </div>
  
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

      <Tooltip />

    </PieChart>

  </ResponsiveContainer>

</div>

  {/* Priority */}
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

      <YAxis />

      <Tooltip />

      <Bar
        dataKey="value"
        fill="#2563EB"
      />

    </BarChart>

  </ResponsiveContainer>

</div>

  {/* Service */}
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

      <Tooltip />

    </PieChart>

  </ResponsiveContainer>

</div>

  {/* Customer Level */}
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

      <XAxis
        dataKey="name"
      />

      <YAxis />

      <Tooltip />

      <Bar
        dataKey="value"
        fill="#10B981"
      />

    </BarChart>

  </ResponsiveContainer>

</div>

  {/* Call Type */}
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

      <YAxis />

      <Tooltip />

      <Area
        type="monotone"
        dataKey="value"
        stroke="#7C3AED"
        fill="#C4B5FD"
      />

    </AreaChart>

  </ResponsiveContainer>

</div>

  {/* Lead Status */}
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

      <YAxis />

      <Tooltip />

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

  </div>
  

 );

};

export default AdminDashboard;