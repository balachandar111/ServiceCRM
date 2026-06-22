import React, {
 useEffect,
 useState
} from "react";

import API from "../../services/api";
import UserStatusModal from "./UserStatusModal";
import "./UserDashboard.css";

const UserDashboard = () => {

 const [user, setUser] =
 useState(null);

 const [showEdit,
 setShowEdit] =
 useState(false);

 const fetchProfile =
 async () => {

  try {

   const { data } =
   await API.get(
    "/users/profile"
   );

   setUser(data.data);

  } catch (error) {

   console.log(error);

  }

 };

 useEffect(() => {

  fetchProfile();

 }, []);

 if (!user) {

  return (
   <div className="loading">
    Loading...
   </div>
  );

 }

 return (

  <div className="user-page">

   <div className="page-header">

    <h2>
     My Lead Details
    </h2>

   

   </div>

   <div className="lead-card">

    {/* Left Side */}

    <div className="lead-column">

     <h3>
      Customer Information
     </h3>

     <div className="info-row">
      <span>Name</span>
      <strong>{user.name}</strong>
     </div>

     <div className="info-row">
      <span>Company</span>
      <strong>{user.company}</strong>
     </div>

     <div className="info-row">
      <span>Phone</span>
      <strong>{user.phoneNumber}</strong>
     </div>

     <div className="info-row">
      <span>Email</span>
      <strong>{user.email}</strong>
     </div>

     <div className="info-row">
      <span>Customer Level</span>
      <strong>
       {user.customerLevel || "-"}
      </strong>
     </div>

    </div>

    {/* Right Side */}

    <div className="lead-column">

     <h3>
      Lead Information
     </h3>

     <div className="info-row">
      <span>Status</span>
      <strong>
       {user.status || "-"}
      </strong>
     </div>

     <div className="info-row">
      <span>Call Type</span>
      <strong>
       {user.callType || "-"}
      </strong>
     </div>

     <div className="info-row">
      <span>Service</span>
      <strong>
       {user.service || "-"}
      </strong>
     </div>

     <div className="info-row">
      <span>Lead Stage</span>
      <strong>
       {user.leadStage || "-"}
      </strong>
     </div>

     <div className="info-row">
      <span>Priority</span>
      <strong>
       {user.priority || "-"}
      </strong>
     </div>

    </div>
     <button
     className="edit-btn"
     onClick={() =>
      setShowEdit(true)
     }
    >
     Update Status
    </button>

   </div>

   {
    showEdit && (

     <UserStatusModal

      user={user}

      refresh={
       fetchProfile
      }

      closeModal={() =>
       setShowEdit(false)
      }

     />

    )
   }

  </div>

 );

};

export default UserDashboard;