import React,
{
 useState
}
from "react";

import API
from "../../services/api";

const UserStatusModal = ({
 user,
 refresh,
 closeModal
}) => {

 const [form,setForm] =
 useState({

  status:
  user?.status || "",

  customerLevel:
  user?.customerLevel || "",

  callType:
  user?.callType || ""

 });

 const handleChange =
 (e)=>{

  setForm({

   ...form,

   [e.target.name]:
   e.target.value

  });

 };

 const updateStatus =
 async(e)=>{

  e.preventDefault();

  try{

   await API.put(

    "/users/my-status",

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

   alert(

    error.response?.data?.message ||

    "Update Failed"

   );

  }

 };

 return(

  <div
   className="modal-overlay"
   onClick={closeModal}
  >

   <div
    className="modal-container"
    onClick={(e)=>
     e.stopPropagation()
    }
   >

    <div
     className="modal-header"
    >

     <h2>
      Update Lead
     </h2>

     <button
      className="close-btn"
      onClick={closeModal}
     >
      ✕
     </button>

    </div>

    <form
     className="create-form"
     onSubmit={
      updateStatus
     }
    >

     <label>
      Status
     </label>

     <select
      name="status"
      value={form.status}
      onChange={
       handleChange
      }
     >

      <option value="Waiting for Internal">
       Waiting for Internal
      </option>

      <option value="Waiting for External">
       Waiting for External
      </option>

      <option value="Waiting for Customer">
       Waiting for Customer
      </option>

     </select>

     <label>
      Customer Level
     </label>

     <select
      name="customerLevel"
      value={
       form.customerLevel
      }
      onChange={
       handleChange
      }
     >

      <option value="New">
       New
      </option>

      <option value="Old">
       Old
      </option>

     </select>

     <label>
      Call Type
     </label>

     <select
      name="callType"
      value={
       form.callType
      }
      onChange={
       handleChange
      }
     >

      <option value="AMC">
       AMC
      </option>

      <option value="Service">
       Service
      </option>

      <option value="Sale">
       Sale
      </option>

      <option value="Presales">
       Presales
      </option>

     </select>

     <div
      className="form-buttons"
     >

      <button
       type="submit"
       className="save-btn"
      >
       Update
      </button>

      <button
       type="button"
       className="cancel-btn"
       onClick={closeModal}
      >
       Close
      </button>

     </div>

    </form>

   </div>

  </div>

 );

};

export default UserStatusModal;