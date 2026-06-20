import React,
{
 useState,
 useEffect
}
from "react";

import API
from "../../services/api";


const EditUser = ({
 user,
 refresh,
 closeModal
}) => {

 const [form,setForm] =
 useState({

  name:"",
  company:"",
  phoneNumber:"",
  email:"",

  username:"",

  service:"Service",

  status:"Waiting for Internal",

  customerLevel:"New",

  callType:"AMC",

  leadStatus:"Quotation Shared",

  loginStatus:"ACTIVE",

  followUpType:"Payment",

  followUpDate:"",

  quotationShared:{
   whatsappShared:false,
   emailShared:false,
   gstType:"GST",
   quotationNumber:""
  },

  closedDetails:{
   engineers:[],
   fieldEngineer:"",

   outsourceName:"",
   outsourceDate:"",

   internalName:"",
   internalDate:"",

   invoiceNumber:""
  }

 });

 useEffect(()=>{

  if(user){

   setForm({

    ...form,

    ...user,

    followUpType:
    user.followUpType || "Payment",

    followUpDate:
    user.followUpDate
    ? user.followUpDate.split("T")[0]
    : "",

    quotationShared:
    user.quotationShared || {

     whatsappShared:false,
     emailShared:false,

     gstType:"GST",

     quotationNumber:""

    },

    closedDetails:
    user.closedDetails || {

     engineers:[],

     fieldEngineer:"",

     outsourceName:"",
     outsourceDate:"",

     internalName:"",
     internalDate:"",

     invoiceNumber:""

    }

   });

  }

 },[user]);

 const handleChange=(e)=>{

  setForm({

   ...form,

   [e.target.name]:
   e.target.value

  });

 };

 const handleQuotation=(e)=>{

  const {
   name,
   value,
   checked,
   type
  } = e.target;

  setForm({

   ...form,

   quotationShared:{

    ...form.quotationShared,

    [name]:
    type==="checkbox"
    ? checked
    : value

   }

  });

 };

 const handleClosed=(e)=>{

  const {
   name,
   value
  } = e.target;

  setForm({

   ...form,

   closedDetails:{

    ...form.closedDetails,

    [name]:value

   }

  });

 };

 const toggleEngineer=(eng)=>{

  let engineers =
  [...form.closedDetails.engineers];

  if(
   engineers.includes(eng)
  ){

   engineers =
   engineers.filter(
    item=>item!==eng
   );

  }
  else{

   engineers.push(eng);

  }

  setForm({

   ...form,

   closedDetails:{

    ...form.closedDetails,

    engineers

   }

  });

 };

 const updateLead =
 async(e)=>{

  e.preventDefault();

  try{

   await API.put(

    `/users/${user._id}`,

    form

   );

   alert(
    "Lead Updated Successfully"
   );

   refresh();

   closeModal();

  }
  catch(error){

   alert(

    error.response?.data?.message ||

    "Update Failed"

   );

  }

 };

 return(

  <div className="modal-overlay">

   <div className="modal-container">

    <div className="modal-header">

     <h2>
      Edit Lead
     </h2>

     <button
      type="button"
      className="close-btn"
      onClick={closeModal}
     >
      ✕
     </button>

    </div>

  <form
 className="create-form"
 onSubmit={updateLead}
>

{/* BASIC INFORMATION */}

<div className="form-section">

 <h3>Basic Information</h3>

 <div className="form-grid">

  <input
   name="name"
   value={form.name || ""}
   onChange={handleChange}
   placeholder="Lead Name"
  />

  <input
   name="company"
   value={form.company || ""}
   onChange={handleChange}
   placeholder="Company"
  />

  <input
   name="phoneNumber"
   value={form.phoneNumber || ""}
   onChange={handleChange}
   placeholder="Phone Number"
  />

  <input
   name="email"
   value={form.email || ""}
   onChange={handleChange}
   placeholder="Email"
  />

 </div>

</div>


{/* LEAD DETAILS */}

<div className="form-section">

 <h3>Lead Details</h3>

 <div className="form-grid">

  <select
   name="service"
   value={form.service || ""}
   onChange={handleChange}
  >
   <option>Service</option>
   <option>Service + Product</option>
   <option>Product</option>
   <option>Solution</option>
  </select>

  <select
   name="status"
   value={form.status || ""}
   onChange={handleChange}
  >
   <option>Waiting for Internal</option>
   <option>Waiting for External</option>
   <option>Waiting for Customer</option>
  </select>

  <select
   name="customerLevel"
   value={form.customerLevel || ""}
   onChange={handleChange}
  >
   <option>New</option>
   <option>Old</option>
  </select>

  <select
   name="callType"
   value={form.callType || ""}
   onChange={handleChange}
  >
   <option>AMC</option>
   <option>Service</option>
   <option>Sale</option>
   <option>Presales</option>
  </select>

  <select
   name="leadStatus"
   value={form.leadStatus || ""}
   onChange={handleChange}
  >
   <option value="Quotation Shared">
    Quotation Shared
   </option>

   <option value="Closed">
    Closed
   </option>
  </select>

  <select
   name="loginStatus"
   value={form.loginStatus || ""}
   onChange={handleChange}
  >
   <option value="ACTIVE">
    ACTIVE
   </option>

   <option value="INACTIVE">
    INACTIVE
   </option>
  </select>

 </div>

</div>


{/* FOLLOW UP */}

<div className="form-section">

 <h3>Follow Up</h3>

 <div className="form-grid">

  <select
   name="followUpType"
   value={form.followUpType || ""}
   onChange={handleChange}
  >
   <option value="Payment">
    Payment
   </option>

   <option value="Calls">
    Calls
   </option>

   <option value="Both">
    Both
   </option>
  </select>

  <input
   type="date"
   name="followUpDate"
   value={form.followUpDate || ""}
   onChange={handleChange}
  />

 </div>

</div>


{/* QUOTATION SHARED */}

{
 form.leadStatus === "Quotation Shared" && (

  <div className="form-section">

   <h3>Quotation Shared Details</h3>

   <div className="checkbox-row">

    <label>
     <input
      type="checkbox"
      name="whatsappShared"
      checked={
       form.quotationShared?.whatsappShared || false
      }
      onChange={handleQuotation}
     />
     WhatsApp Shared
    </label>

    <label>
     <input
      type="checkbox"
      name="emailShared"
      checked={
       form.quotationShared?.emailShared || false
      }
      onChange={handleQuotation}
     />
     Email Shared
    </label>

   </div>

   <div className="form-grid">

    <select
     name="gstType"
     value={
      form.quotationShared?.gstType || "GST"
     }
     onChange={handleQuotation}
    >
     <option value="GST">
      GST
     </option>

     <option value="NO GST">
      NO GST
     </option>
    </select>

    <input
     name="quotationNumber"
     value={
      form.quotationShared?.quotationNumber || ""
     }
     onChange={handleQuotation}
     placeholder="Quotation Number"
    />

   </div>

  </div>

 )
}


{/* CLOSED DETAILS */}

{
 form.leadStatus === "Closed" && (

  <div className="form-section">

   <h3>Closed Details</h3>

   <div className="checkbox-row">

    {
     [
      "Engineer 1",
      "Engineer 2",
      "Engineer 3"
     ].map((eng)=>(

      <label key={eng}>

       <input
        type="checkbox"
        checked={
         form.closedDetails?.engineers?.includes(eng)
        }
        onChange={() =>
         toggleEngineer(eng)
        }
       />

       {eng}

      </label>

     ))
    }

   </div>

   <div className="form-grid">

    <input
     name="fieldEngineer"
     value={
      form.closedDetails?.fieldEngineer || ""
     }
     onChange={handleClosed}
     placeholder="Field Engineer"
    />

    <input
     name="invoiceNumber"
     value={
      form.closedDetails?.invoiceNumber || ""
     }
     onChange={handleClosed}
     placeholder="Invoice Number"
    />

    <input
     name="outsourceName"
     value={
      form.closedDetails?.outsourceName || ""
     }
     onChange={handleClosed}
     placeholder="Outsource Name"
    />

    <input
     type="date"
     name="outsourceDate"
     value={
      form.closedDetails?.outsourceDate || ""
     }
     onChange={handleClosed}
    />

    <input
     name="internalName"
     value={
      form.closedDetails?.internalName || ""
     }
     onChange={handleClosed}
     placeholder="Internal Name"
    />

    <input
     type="date"
     name="internalDate"
     value={
      form.closedDetails?.internalDate || ""
     }
     onChange={handleClosed}
    />

   </div>

  </div>

 )
}


<button
 type="submit"
 className="save-btn"
>
 Update Lead
</button>

</form>

   </div>

  </div>

 );

};

export default EditUser;