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

  




  </div>

</div>

 



  {/* Admin Stats */}



  {/* Charts */}



</div>
);

};

export default SuperAdminDashboard;
