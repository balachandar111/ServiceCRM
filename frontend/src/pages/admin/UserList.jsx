import React, {
 useEffect,
 useState
} from "react";

import API from "../../services/api";

import CreateUser from "./CreateUser";
import EditUser from "./EditUser";



const UserList = () => {

 const [users, setUsers] =
 useState([]);

 const [search, setSearch] =
 useState("");

 const [showCreate,
 setShowCreate] =
 useState(false);

 const [showEdit,
 setShowEdit] =
 useState(false);

 const [selectedUser,
 setSelectedUser] =
 useState(null);

 const fetchUsers =
 async () => {

  try {

   const { data } =
   await API.get(
    "/users"
   );

   setUsers(
    data.data || []
   );

  }
  catch (error) {

   console.log(error);

  }

 };

 useEffect(() => {

  fetchUsers();

 }, []);

 const deleteUser =
 async (id) => {

  if (
   !window.confirm(
    "Delete User?"
   )
  ) return;

  try {

   await API.delete(
    `/users/${id}`
   );

   fetchUsers();

  }
  catch (error) {

   console.log(error);

  }

 };

 const toggleStatus =
 async (id) => {

  try {

   await API.put(
    `/users/status/${id}`
   );

   fetchUsers();

  }
  catch (error) {

   console.log(error);

  }

 };

 const filteredUsers =
 users.filter(user =>

  user.name
   ?.toLowerCase()
   .includes(
    search.toLowerCase()
   )

 );

 return (

  <div className="user-page">

   <div className="user-header">

    <h2>
     User Management
    </h2>

    <button
     className="create-btn"
     onClick={() =>
      setShowCreate(true)
     }
    >
     + Create User
    </button>

   </div>

   <input

    type="text"

    className="search-box"

    placeholder="Search User"

    value={search}

    onChange={(e) =>
     setSearch(
      e.target.value
     )
    }

   />

   <div className="table-wrapper">

    <table className="crm-table">

     <thead>

      <tr>

       <th>Name</th>

       <th>Company</th>

       <th>Phone</th>

       <th>Service</th>

       <th>Status</th>

       <th>Lead Status</th>

       <th>Follow Up</th>

       <th>Approval</th>

       <th>Login</th>

       <th>Actions</th>

      </tr>

     </thead>

     <tbody>

      {
       filteredUsers.length > 0 ?

       filteredUsers.map(
        user => (

         <tr
          key={user._id}
         >

          <td>
           {user.name}
          </td>

          <td>
           {user.company}
          </td>

          <td>
           {user.phoneNumber}
          </td>

          <td>
           {user.service}
          </td>

          <td>
           {user.status}
          </td>

          <td>
           {user.leadStatus}
          </td>

          <td>

           {user.followUpType}

           <br />

           {
            user.followUpDate &&
            new Date(
             user.followUpDate
            ).toLocaleDateString()
           }

          </td>

          <td>

           <span
            className={
             user.approvalStatus ===
             "APPROVED"
              ?
              "approved"
              :
              "pending"
            }
           >

            {
             user.approvalStatus ||
             "PENDING"
            }

           </span>

          </td>

          <td>

           <span
            className={

             user.loginStatus ===
             "ACTIVE"

             ?

             "active-badge"

             :

             "inactive-badge"

            }
           >

            {user.loginStatus}

           </span>

          </td>

          <td>

           <button

            className="edit-btn"

            onClick={() => {

             setSelectedUser(
              user
             );

             setShowEdit(
              true
             );

            }}

           >
            Edit
           </button>

           <button

            className="toggle-btn"

            onClick={() =>
             toggleStatus(
              user._id
             )
            }

           >
            Toggle
           </button>

           <button

            className="delete-btn"

            onClick={() =>
             deleteUser(
              user._id
             )
            }

           >
            Delete
           </button>

          </td>

         </tr>

        )
       )

       :

       <tr>

        <td
         colSpan="10"
         style={{
          textAlign:"center"
         }}
        >

         No Users Found

        </td>

       </tr>

      }

     </tbody>

    </table>

   </div>

   {
    showCreate &&

    <CreateUser

     refresh={
      fetchUsers
     }

     closeModal={() =>
      setShowCreate(
       false
      )
     }

    />
   }

   {
    showEdit &&

    <EditUser

     user={
      selectedUser
     }

     refresh={
      fetchUsers
     }

     closeModal={() =>
      setShowEdit(
       false
      )
     }

    />
   }

  </div>

 );

};

export default UserList;