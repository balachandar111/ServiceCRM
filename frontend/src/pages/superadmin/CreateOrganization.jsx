import React,
{
 useState
}
from "react";

import API
from "../../services/api";

import "./AdminOrgForms.css";

const CreateOrganization =
({
 closeModal,
 refresh
}) => {

 const [form,
 setForm] =
 useState({

  orgName:"",
  orgCode:"",
  companyType:"",
  companySize:"",
  logo:""

 });

 const handleChange =
 (e)=>{

  setForm({

   ...form,

   [e.target.name]:
   e.target.value

  });

 };

 const handleSubmit =
 async (e)=>{

  e.preventDefault();

  try{

   await API.post(

    "/organizations",

    form

   );

   alert(
    "Organization Created"
   );

   refresh();

   closeModal();

  }
  catch(error){

   alert(
    error.response?.data?.message
   );
  }

 };

 return(

  <div
   className="modal-overlay"
  >

   <div className="modal">

   <div className="popup-header">

 <h2>
  Create Organization
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
      handleSubmit
     }
    >

     <input
      type="text"
      name="orgName"
      placeholder="Organization Name"
      onChange={handleChange}
      required
     />

     <input
      type="text"
      name="orgCode"
      placeholder="Organization Code"
      onChange={handleChange}
      required
     />

     <input
      type="text"
      name="companyType"
      placeholder="Company Type"
      onChange={handleChange}
     />

     <input
      type="text"
      name="companySize"
      placeholder="Company Size"
      onChange={handleChange}
     />

     <input
      type="text"
      name="logo"
      placeholder="Logo URL"
      onChange={handleChange}
     />

     <button
      className="save-btn"
     >

      Save

     </button>

    </form>

   </div>

  </div>

 );

};

export default CreateOrganization;