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
   <div
    style={{
     padding:"30px"
    }}
   >
    Loading...
   </div>
  );

 }

 return (

  <div className="user-page">

   <h2>
    My Lead Details
   </h2>

   <div className="lead-card">

    <p>
     <strong>Name:</strong>
     {user.name}
    </p>

    <p>
     <strong>Company:</strong>
     {user.company}
    </p>

    <p>
     <strong>Phone:</strong>
     {user.phoneNumber}
    </p>

    <p>
     <strong>Email:</strong>
     {user.email}
    </p>
<p>
 <strong>Status:</strong>
 {user.status || "Not Assigned"}
</p>

<p>
 <strong>Customer Level:</strong>
 {user.customerLevel || "Not Assigned"}
</p>

<p>
 <strong>Call Type:</strong>
 {user.callType || "Not Assigned"}
</p>

<p>
 <strong>Service:</strong>
 {user.service || "Not Assigned"}
</p>
<p>
 <strong>Lead Stage:</strong>
 {user.leadStage || "Not Assigned"}
</p>

<p>
 <strong>Priority:</strong>
 {user.priority || "Medium"}
</p>

<p>
 <strong>Source:</strong>
 {user.source || "Website"}
</p>

<p>
 <strong>Assigned To:</strong>
 {user.assignedTo || "Not Assigned"}
</p>

<p>
 <strong>Solution:</strong>
 {user.solution || "-"}
</p>

<p>
 <strong>Product:</strong>
 {user.product || "-"}
</p>

<p>
 <strong>Sector:</strong>
 {user.sector || "-"}
</p>

<p>
 <strong>Remark:</strong>
 {user.remark || "-"}
</p>

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