import React,
{
 useState
}
from "react";

import API
from "../../services/api";
import "./SmartCalculator.css";

const SmartCalculator = ()=>{

 const [form,setForm] =
 useState({

  companyName:"",
  orderNo:""

 });

 const [file,setFile] =
 useState(null);

 const submitData =
 async(e)=>{

  e.preventDefault();

  try{

   const fd =
   new FormData();

   fd.append(
    "companyName",
    form.companyName
   );

   fd.append(
    "orderNo",
    form.orderNo
   );

   fd.append(
    "file",
    file
   );

   const res =
   await API.post(

    "/smartcalculator/create",

    fd,

    {

     headers:{
      "Content-Type":
      "multipart/form-data"
     }

    }

   );

   alert(
    res.data.message
   );

  }
  catch(error){

   console.log(error);

   alert(
    "Upload Failed"
   );

  }

 };

 return(

  <div className="card">

   <h2>
    Smart Calculator
   </h2>

 <form onSubmit={submitData}>

  <div className="form-group">
    <label>Company Name</label>
    <input
      type="text"
      value={form.companyName}
      onChange={(e)=>
        setForm({
          ...form,
          companyName:e.target.value
        })
      }
      required
    />
  </div>

  <div className="form-group">
    <label>Order Number</label>
    <input
      type="text"
      value={form.orderNo}
      onChange={(e)=>
        setForm({
          ...form,
          orderNo:e.target.value
        })
      }
      required
    />
  </div>

  <div className="form-group">
    <label>Upload PNG / PDF</label>
    <input
      type="file"
      accept=".png,.pdf"
      onChange={(e)=>
        setFile(e.target.files[0])
      }
      required
    />
  </div>

  {file && (
    <div className="file-preview">
      Selected File: {file.name}
    </div>
  )}

  <button
    type="submit"
    className="upload-btn"
  >
    Upload
  </button>

</form>

  </div>

 );

};

export default SmartCalculator;