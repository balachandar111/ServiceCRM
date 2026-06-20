import React, { useEffect, useState } from "react";
import API from "../../services/api";

const PendingLeads = () => {

 const [leads,setLeads] =
 useState([]);

 const fetchLeads =
 async()=>{

  try{

   const { data } =
   await API.get(
    "/users/pending"
   );

   setLeads(
    data.data
   );

  }
  catch(error){

   console.log(error);

  }

 };

 useEffect(()=>{

  fetchLeads();

 },[]);
 const approveLead = async(id)=>{

 try{

  await API.put(
   `/users/approve/${id}`
  );

  alert(
   "Lead Approved"
  );

  fetchLeads();

 }
 catch(error){

  console.log(error);

  alert(
   error.response?.data?.message
  );

 }

};

 return(

  <div className="page">

   <h2>
    Pending Leads
   </h2>

   <table className="crm-table">

    <thead>
     <tr>
      <th>Name</th>
      <th>Company</th>
      <th>Status</th>
      <th>Action</th>
     </tr>
    </thead>

    <tbody>

     {
      leads.map(lead=>(

       <tr key={lead._id}>

        <td>{lead.name}</td>

        <td>{lead.company}</td>

        <td>
         {lead.approvalStatus}
        </td>

        <td>

        <button
 className="approve-btn"
 onClick={()=>
  approveLead(
   lead._id
  )
 }
>
 Approve
</button>

        </td>

       </tr>

      ))
     }

    </tbody>

   </table>

  </div>

 );

};

export default PendingLeads;