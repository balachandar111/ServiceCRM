import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const API_URL =
import.meta.env.VITE_API_URL;

import {
 FaUser,
 FaLock,
 FaUserShield,
 FaSignInAlt
} from "react-icons/fa";

import "./Login.css";

const Login = () => {

 const navigate = useNavigate();

 const [formData,setFormData] =
 useState({

  role:"SUPER_ADMIN",
  username:"",
  password:""

 });

 const handleChange=(e)=>{

  setFormData({

   ...formData,

   [e.target.name]:
   e.target.value

  });

 };

 const handleSubmit =
 async(e)=>{

  e.preventDefault();

  try{

   let url="";

  if(formData.role==="SUPER_ADMIN"){
 url = `${API_URL}/auth/login`;
}

   else if(formData.role==="ADMIN"){
 url = `${API_URL}/admins/login`;
}

  else{
 url = `${API_URL}/users/login`;
}

   const { data } =
   await axios.post(

    url,

    {
     username:
     formData.username,

     password:
     formData.password
    }

   );

   localStorage.setItem(
    "token",
    data.token
   );

   localStorage.setItem(
    "role",
    formData.role
   );

   localStorage.setItem(
    "user",
    JSON.stringify(
     data.user
    )
   );

   navigate("/dashboard");

  }
  catch(error){

   alert(

    error.response?.data?.message ||

    "Login Failed"

   );

  }

 };

 return(

  <div className="login-page">

   <div className="login-card">

    <div className="login-header">

  <div className="login-logo-container">

    <img
      src="https://res.cloudinary.com/ds4i8pujs/image/upload/v1782639671/logo_thhekj.jpg"
      alt="Express PC"
      className="login-logo"
    />

  </div>

  <h2>Welcome to Express PC</h2>

  <p className="login-subtitle">
    Manage Leads • Customers • Support
  </p>

  <span className="login-signin">
    Sign in to your account
  </span>

</div>

    <form
     onSubmit={handleSubmit}
    >

     <div className="input-group">

      <FaUserShield
       className="input-icon"
      />

      <select
       name="role"
       value={formData.role}
       onChange={handleChange}
      >

       <option value="SUPER_ADMIN">
        Super Admin
       </option>

       <option value="ADMIN">
        Admin
       </option>

       <option value="USER">
        User
       </option>

      </select>

     </div>

     <div className="input-group">

      <FaUser
       className="input-icon"
      />

      <input
       type="text"
       name="username"
       placeholder="Username"
       value={formData.username}
       onChange={handleChange}
       required
      />

     </div>

     <div className="input-group">

      <FaLock
       className="input-icon"
      />

      <input
       type="password"
       name="password"
       placeholder="Password"
       value={formData.password}
       onChange={handleChange}
       required
      />

     </div>

     <button
      type="submit"
      className="login-btn"
     >

      <FaSignInAlt />

      Login

     </button>

    </form>

    <div className="footer-text">
     CRM Management System
    </div>

   </div>

  </div>

 );

};

export default Login;