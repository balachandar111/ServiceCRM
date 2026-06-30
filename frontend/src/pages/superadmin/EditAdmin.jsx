import React,
{
 useState
}
from "react";

import API
from "../../services/api";

import "./AdminOrgForms.css";

const EditAdmin =
({
 admin,
 refresh,
 closeModal
}) => {

 const [form,
 setForm] =
 useState({

  name:
  admin.name,

  company:
  admin.company,

  email:
  admin.email,

  phone:
  admin.phone

 });

 const handleChange =
 (e)=>{

  setForm({

   ...form,

   [e.target.name]:
   e.target.value

  });

 };

 const updateAdmin =
 async(e)=>{

  e.preventDefault();

  try{

   await API.put(

    `/admins/${admin._id}`,

    form

   );

   refresh();

   closeModal();

   alert(
    "Admin Updated"
   );

  }catch(error){

   console.log(error);

  }

 };

 return(

  <div className="modal-overlay">

   <div className="modal">

   <div className="popup-header">

 <h2>
  Edit Admin
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
      updateAdmin
     }
    >

     <input

      name="name"

      value={form.name}

      onChange={
       handleChange
      }

     />

     <input

      name="company"

      value={form.company}

      onChange={
       handleChange
      }

     />

     <input

      name="email"

      value={form.email}

      onChange={
       handleChange
      }

     />

     <input

      name="phone"

      value={form.phone}

      onChange={
       handleChange
      }

     />

     <div style={{ display: "flex", gap: "10px" }}>

      <button  className="save-btn">

       Update Admin

      </button>

      <button
       type="button"
       className="cancel-btn"
       onClick={closeModal}
      >

       Exit

      </button>

     </div>

    </form>

   </div>

  </div>

 );

};

export default EditAdmin;