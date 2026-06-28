import React,
{
 useEffect,
 useState
}
from "react";

import API
from "../../services/api";

import CreateOrganization
from "./CreateOrganization";
import "./Adminlist.css";

import EditOrganization
from "./EditOrganization";

const OrganizationList = () => {

 const [
  organizations,
  setOrganizations
 ] = useState([]);

 const [
  search,
  setSearch
 ] = useState("");

 const [
  showCreate,
  setShowCreate
 ] = useState(false);

 const [
  showEdit,
  setShowEdit
 ] = useState(false);

 const [
  selectedOrg,
  setSelectedOrg
 ] = useState(null);

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

  }
  catch(error){

   console.log(error);

  }

 };

 useEffect(()=>{

  fetchOrganizations();

 },[]);

 const deleteOrganization =
 async(id)=>{

  const confirmDelete =
  window.confirm(
   "Delete Organization?"
  );

  if(!confirmDelete)
  return;

  try{

   await API.delete(
    `/organizations/${id}`
   );

   alert(
    "Organization Deleted"
   );

   fetchOrganizations();

  }
  catch(error){

   console.log(error);

  }

 };

 const filteredData =
 organizations.filter(
  org=>

   org.orgName
   ?.toLowerCase()

   .includes(
    search.toLowerCase()
   )
 );

 return(

  <div className="page">

   <div className="page-header">

    <div>

     <h2>
      Organizations
     </h2>

     <p>
      Manage Organizations
     </p>

    </div>

    <button
     className="add-btn"
     onClick={()=>
      setShowCreate(true)
     }
    >

     + Create Organization

    </button>

   </div>

   <input

    type="text"

    placeholder="Search..."

    className="search-box"

    value={search}

    onChange={(e)=>
     setSearch(
      e.target.value
     )
    }

   />

   <table
    className="crm-table"
   >

    <thead>

     <tr>

      <th>
       Name
      </th>

      <th>
       Code
      </th>

      <th>
       Type
      </th>

      <th>
       Size
      </th>

      <th>
       Actions
      </th>

     </tr>

    </thead>

    <tbody>

     {
      filteredData.map(
       (org)=>(
        <tr
         key={org._id}
        >

         <td>
          {org.orgName}
         </td>

         <td>
          {org.orgCode}
         </td>

         <td>
          {org.companyType}
         </td>

         <td>
          {org.companySize}
         </td>

         <td>

          <button

           className="edit-btn"

           onClick={()=>{

            setSelectedOrg(org);

            setShowEdit(true);

           }}

          >

           Edit

          </button>

          <button

           className="delete-btn"

           onClick={()=>

            deleteOrganization(
             org._id
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

    <CreateOrganization

     closeModal={()=>
      setShowCreate(false)
     }

     refresh={
      fetchOrganizations
     }

    />
   }

   {
    showEdit &&

    <EditOrganization

     organization={
      selectedOrg
     }

     closeModal={()=>
      setShowEdit(false)
     }

     refresh={
      fetchOrganizations
     }

    />
   }

  </div>

 );

};

export default OrganizationList;