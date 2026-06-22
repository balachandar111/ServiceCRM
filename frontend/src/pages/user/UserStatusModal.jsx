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

 status:user?.status || "",

 customerLevel:user?.customerLevel || "",

 callType:user?.callType || "",

 leadStage:user?.leadStage || "Awareness",

 priority:user?.priority || "Medium",

 source:user?.source || "Website",

 assignedTo:user?.assignedTo || "",

 solution:user?.solution || "",

 product:user?.product || "",

 sector:user?.sector || "",

 remark:user?.remark || ""

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
     <label>Lead Stage</label>

<select
 name="leadStage"
 value={form.leadStage}
 onChange={handleChange}
>
 <option value="Awareness">
  Awareness
 </option>

 <option value="Interest">
  Interest
 </option>

 <option value="Desire">
  Desire
 </option>

 <option value="Closure">
  Closure
 </option>
</select>

<label>Priority</label>

<select
 name="priority"
 value={form.priority}
 onChange={handleChange}
>
 <option value="Low">
  Low
 </option>

 <option value="Medium">
  Medium
 </option>

 <option value="High">
  High
 </option>
</select>

<label>Source</label>

<select
 name="source"
 value={form.source}
 onChange={handleChange}
>
 <option value="Website">
  Website
 </option>

 <option value="Social media">
  Social Media
 </option>

 <option value="Expo">
  Expo
 </option>

 <option value="Referral">
  Referral
 </option>
</select>

<input
 type="text"
 name="assignedTo"
 value={form.assignedTo}
 onChange={handleChange}
 placeholder="Assigned To"
/>

<input
 type="text"
 name="solution"
 value={form.solution}
 onChange={handleChange}
 placeholder="Solution"
/>

<input
 type="text"
 name="product"
 value={form.product}
 onChange={handleChange}
 placeholder="Product"
/>

<input
 type="text"
 name="sector"
 value={form.sector}
 onChange={handleChange}
 placeholder="Sector"
/>

<textarea
 name="remark"
 value={form.remark}
 onChange={handleChange}
 placeholder="Remark"
/>

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