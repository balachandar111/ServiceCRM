import React,
{
 useState
}
from "react";

import API
from "../../services/api";

const CreateAdmin =
({
 organizations,
 refresh,
 closeModal
}) => {

 const [form,
 setForm] =
 useState({

  organizationId:"",

  name:"",
  company:"",
  username:"",
  email:"",
  phone:"",
  password:"",
  profile:""

 });

 const handleChange =
 (e)=>{

  setForm({

   ...form,

   [e.target.name]:
   e.target.value

  });

 };

 const createAdmin =
 async(e)=>{

  e.preventDefault();

  try{

   await API.post(
    "/admin",
    form
   );

   refresh();

   closeModal();

   alert(
    "Admin Created"
   );

  }catch(error){

   alert(
    error.response?.data?.message
   );
  }

 };

 return(

  <div className="modal-overlay">

   <div className="modal">

    <div className="popup-header">

  <h2>
   Create Admin
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
      createAdmin
     }
    >

     <select

      name="organizationId"

      onChange={
       handleChange
      }

      required
     >

      <option value="">
       Select Organization
      </option>

      {
       organizations.map(
        (org)=>(
         <option

          key={org._id}

          value={org._id}
         >

          {org.orgName}

         </option>
        )
       )
      }

     </select>

     <input
      name="name"
      placeholder="Name"
      onChange={handleChange}
      required
     />

     <input
      name="company"
      placeholder="Company"
      onChange={handleChange}
      required
     />

     <input
      name="username"
      placeholder="Username"
      onChange={handleChange}
      required
     />

     <input
      name="email"
      placeholder="Email"
      onChange={handleChange}
      required
     />

     <input
      name="phone"
      placeholder="Phone"
      onChange={handleChange}
     />

     <input
      type="password"
      name="password"
      placeholder="Password"
      onChange={handleChange}
      required
     />

     <button  className="save-btn">

      Save Admin

     </button>

    </form>

   </div>

  </div>

 );

};

export default CreateAdmin;