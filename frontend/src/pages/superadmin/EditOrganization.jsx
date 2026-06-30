import React,
{
 useState
}
from "react";

import API
from "../../services/api";

import "./AdminOrgForms.css";

const EditOrganization =
({
 organization,
 closeModal,
 refresh
}) => {

 const [form,
 setForm] =
 useState({

  orgName:
  organization.orgName,

  companyType:
  organization.companyType,

  companySize:
  organization.companySize,

  logo:
  organization.logo

 });

 const handleChange =
 (e)=>{

  setForm({

   ...form,

   [e.target.name]:
   e.target.value

  });

 };

 const updateOrganization =
 async (e)=>{

  e.preventDefault();

  try{

   await API.put(

    `/organizations/${organization._id}`,

    form

   );

   alert(
    "Updated Successfully"
   );

   refresh();

   closeModal();

  }
  catch(error){

   console.log(error);

  }

 };

 return(

  <div
   className="modal-overlay"
  >

   <div className="modal">

 <div className="popup-header">

 <h2>
  Edit Organization
 </h2>

 <button
  type="button"
  className="close-popup-btn"
  onClick={closeModal}
 >
  ✕
 </button>

</div>

    <form
     onSubmit={
      updateOrganization
     }
    >

     <input
      name="orgName"
      value={form.orgName}
      onChange={handleChange}
     />

     <input
      name="companyType"
      value={form.companyType}
      onChange={handleChange}
     />

     <input
      name="companySize"
      value={form.companySize}
      onChange={handleChange}
     />

     <input
      name="logo"
      value={form.logo}
      onChange={handleChange}
     />

     <button  className="save-btn">

      Update

     </button>

    </form>

   </div>

  </div>

 );

};

export default EditOrganization;