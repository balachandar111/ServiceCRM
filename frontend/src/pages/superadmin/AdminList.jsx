import React,
{
 useEffect,
 useState
}
from "react";
import "./Adminlist.css";

import API
from "../../services/api";

import CreateAdmin
from "./CreateAdmin";

import EditAdmin
from "./EditAdmin";

const AdminList = () => {

 const [admins,setAdmins] =
 useState([]);

 const [organizations,
 setOrganizations] =
 useState([]);

 const [showCreate,
 setShowCreate] =
 useState(false);

 const [showEdit,
 setShowEdit] =
 useState(false);

 const [selectedAdmin,
 setSelectedAdmin] =
 useState(null);

 const fetchAdmins =
 async ()=>{

  try{

   const { data } =
   await API.get("/admins");

   setAdmins(data.data);

  }catch(error){

   console.log(error);

  }

 };

 const fetchOrganizations =
 async ()=>{

  try{

   const { data } =
   await API.get(
    "/organizations"
   );

   setOrganizations(
    data.data
   );

  }catch(error){

   console.log(error);

  }

 };

 useEffect(()=>{

  fetchAdmins();

  fetchOrganizations();

 },[]);

 const deleteAdmin =
 async(id)=>{

  if(
   !window.confirm(
    "Delete Admin?"
   )
  ) return;

  try{

   await API.delete(
    `/admins/${id}`
   );

   fetchAdmins();

  }catch(error){

   console.log(error);

  }

 };

 const changeStatus =
 async(id)=>{

  try{

   await API.put(
    `/admins/status/${id}`
   );

   fetchAdmins();

  }catch(error){

   console.log(error);

  }

 };

 return(

  <div className="page">

   <div className="page-header">

    <h2>
     Admin Management
    </h2>

    <button
     className="add-btn"
     onClick={()=>
      setShowCreate(true)
     }
    >

     + Create Admin

    </button>

   </div>

   <table
    className="crm-table"
   >

    <thead>

     <tr>

      <th>Name</th>

      <th>Username</th>

      <th>Company</th>

      <th>Email</th>

      <th>Status</th>

      <th>Actions</th>

     </tr>

    </thead>

    <tbody>

     {
      admins.map(
       (admin)=>(
        <tr
         key={admin._id}
        >

         <td>
          {admin.name}
         </td>

         <td>
          {admin.username}
         </td>

         <td>
          {admin.company}
         </td>

         <td>
          {admin.email}
         </td>

         <td>

          <span
           className={
            admin.status ===
            "ACTIVE"
            ?
            "active-badge"
            :
            "inactive-badge"
           }
          >

           {admin.status}

          </span>

         </td>

         <td>

          <button

           className="edit-btn"

           onClick={()=>{

            setSelectedAdmin(
             admin
            );

            setShowEdit(true);

           }}

          >

           Edit

          </button>

          <button

           className="status-btn"

           onClick={()=>

            changeStatus(
             admin._id
            )

           }

          >

           {
            admin.status ===
            "ACTIVE"

            ?

            "Deactivate"

            :

            "Activate"
           }

          </button>

          <button

           className="delete-btn"

           onClick={()=>

            deleteAdmin(
             admin._id
            )

           }

          >

           Delete

          </button>

         </td>

        </tr>
       )
      )
     }

    </tbody>

   </table>

   {
    showCreate &&

    <CreateAdmin

     organizations={
      organizations
     }

     refresh={
      fetchAdmins
     }

     closeModal={()=>

      setShowCreate(false)

     }

    />
   }

   {
    showEdit &&

    <EditAdmin

     admin={
      selectedAdmin
     }

     refresh={
      fetchAdmins
     }

     closeModal={()=>

      setShowEdit(false)

     }

    />
   }

  </div>

 );

};

export default AdminList;