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
    <>

<div className="lead-card">

  <div className="section-title">
    Customer & Lead Information
  </div>

 

  <div className="details-grid">

    <div className="detail-item">
      <label>Name</label>
      <p>{user.name}</p>
    </div>

    <div className="detail-item">
      <label>Company</label>
      <p>{user.company}</p>
    </div>

    <div className="detail-item">
      <label>Phone Number</label>
      <p>{user.phoneNumber}</p>
    </div>

    <div className="detail-item">
      <label>Email</label>
      <p>{user.email}</p>
    </div>

    <div className="detail-item">
      <label>Customer Level</label>
      <p>{user.customerLevel || "-"}</p>
    </div>

    <div className="detail-item">
      <label>Lead Stage</label>
      <p>{user.leadStage || "-"}</p>
    </div>

    <div className="detail-item">
      <label>Status</label>
      <p>{user.status || "-"}</p>
    </div>

    <div className="detail-item">
      <label>Call Type</label>
      <p>{user.callType || "-"}</p>
    </div>

    <div className="detail-item">
      <label>Service</label>
      <p>{user.service || "-"}</p>
    </div>

    <div className="detail-item">
      <label>Priority</label>
      <p>{user.priority || "-"}</p>
    </div>

    <div className="detail-item">
      <label>Follow Up</label>
      <p>{user.followUpType || "-"}</p>
    </div>

    <div className="detail-item">
      <label>Follow Up Date</label>
      <p>
        {user.followUpDate
          ? new Date(
              user.followUpDate
            ).toLocaleDateString()
          : "-"}
      </p>
    </div>

  </div>

  <div className="action-area">
    <button
      className="edit-btn"
      onClick={() => setShowEdit(true)}
    >
      Update Status
    </button>
  </div>

</div>
{
 showEdit && (

  <UserStatusModal
   user={user}
   refresh={fetchProfile}
   closeModal={() =>
    setShowEdit(false)
   }
  />

 )
}</>

);

};

export default UserDashboard;