import React, {
 useEffect,
 useState
} from "react";

import API from "../../services/api";

import CreateUser from "./CreateUser";
import EditUser from "./EditUser";
import "./UserList.css"

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const UserList = () => {

 const [users, setUsers] =
 useState([]);

const [showCalculator,setShowCalculator] =
useState(false);

const [calculatorData,setCalculatorData] =
useState([]);

const fetchCalculatorData = async(user)=>{

 try{

  const { data } =
  await API.get(
   "/smartcalculator/all"
  );

  console.log(data);

  setCalculatorData(data.data);

 }
 catch(error){

  console.log(error);

 }

};

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
 const downloadExcel = () => {

 const worksheet =
 XLSX.utils.json_to_sheet(
  filteredUsers
 );

 const workbook =
 XLSX.utils.book_new();

 XLSX.utils.book_append_sheet(
  workbook,
  worksheet,
  "Users"
 );

 const excelBuffer =
 XLSX.write(
  workbook,
  {
   bookType:"xlsx",
   type:"array"
  }
 );

 const file =
 new Blob(
  [excelBuffer],
  {
   type:
   "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  }
 );

 saveAs(
  file,
  "Users.xlsx"
 );

};

const handleFileUpload =
async(e)=>{

 const file =
 e.target.files[0];

 if(!file) return;

 const formData =
 new FormData();

 formData.append(
  "file",
  file
 );

 try{

  await API.post(
   "/users/bulk-upload",
   formData,
   {
    headers:{
     "Content-Type":
     "multipart/form-data"
    }
   }
  );

  alert(
   "Users Uploaded Successfully"
  );

  fetchUsers();

 }
 catch(error){

  console.log(error);

 }

};



 const [search,setSearch] = useState("");

const [serviceFilter,setServiceFilter] =
useState("");

const [priorityFilter,setPriorityFilter] =
useState("");

const [stageFilter,setStageFilter] =
useState("");

const [sourceFilter,setSourceFilter] =
useState("");

const [currentPage,setCurrentPage] =
useState(1);

const usersPerPage = 10;

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

const filteredUsers = users.filter(user => {

 const matchSearch =

(user.name || "")
.toLowerCase()
.includes(search.toLowerCase())

||

(user.company || "")
.toLowerCase()
.includes(search.toLowerCase())

||

(user.phoneNumber || "")
.toLowerCase()
.includes(search.toLowerCase())

||

(user.email || "")
.toLowerCase()
.includes(search.toLowerCase());

 const matchService =
 serviceFilter
 ? user.service === serviceFilter
 : true;

 const matchPriority =
 priorityFilter
 ? user.priority === priorityFilter
 : true;

 const matchStage =
 stageFilter
 ? user.leadStage === stageFilter
 : true;

 const matchSource =
 sourceFilter
 ? user.source === sourceFilter
 : true;

 return (
  matchSearch &&
  matchService &&
  matchPriority &&
  matchStage &&
  matchSource
 );

});


const indexOfLastUser =
currentPage * usersPerPage;

const indexOfFirstUser =
indexOfLastUser - usersPerPage;

const currentUsers =
filteredUsers.slice(
 indexOfFirstUser,
 indexOfLastUser
);

const totalPages =
Math.ceil(
 filteredUsers.length /
 usersPerPage
);

 return (

  <div className="user-page">

   <div className="user-header">

    <h2>
     User Management
    </h2>

   

   </div>

   <div className="user-toolbar">

 <input
  type="text"
  placeholder="Search User..."
  value={search}
  onChange={(e)=>
   setSearch(
    e.target.value
   )
  }
  className="search-box"
 />

 <button
  className="download-btn"
  onClick={downloadExcel}
 >
  Download Excel
 </button>

 <label className="upload-btn">

  Upload Excel

  <input
   type="file"
   hidden
   accept=".xlsx,.xls,.csv"
   onChange={handleFileUpload}
  />

 </label>

 <button
  className="create-btn"
  onClick={() =>
   setShowCreate(true)
  }
 >
  + Create User
 </button>

</div>
<div className="user-filters">

 <select
  value={serviceFilter}
  onChange={(e)=>
   setServiceFilter(
    e.target.value
   )
  }
 >
  <option value="">
   All Service
  </option>

  <option>
   Service
  </option>

  <option>
   Product
  </option>

  <option>
   Solution
  </option>

 </select>

 <select
  value={priorityFilter}
  onChange={(e)=>
   setPriorityFilter(
    e.target.value
   )
  }
 >
  <option value="">
   All Priority
  </option>

  <option>
   High
  </option>

  <option>
   Medium
  </option>

  <option>
   Low
  </option>
 </select>

 <select
  value={stageFilter}
  onChange={(e)=>
   setStageFilter(
    e.target.value
   )
  }
 >
  <option value="">
   All Stages
  </option>

  <option>
   Awareness
  </option>

  <option>
   Interest
  </option>

  <option>
   Desire
  </option>

  <option>
   Closure
  </option>
 </select>

 <select
  value={sourceFilter}
  onChange={(e)=>
   setSourceFilter(
    e.target.value
   )
  }
 >
  <option value="">
   All Sources
  </option>

  <option>
   Website
  </option>

  <option>
   Referral
  </option>

  <option>
   Expo
  </option>

  <option>
   Social media
  </option>
 </select>
<button
 className="clear-btn"
 onClick={()=>{
  setSearch("");
  setServiceFilter("");
  setPriorityFilter("");
  setStageFilter("");
  setSourceFilter("");
 }}
>
 Clear Filters
</button>
</div>

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

       currentUsers.map(
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
     <div className="pagination">

 <button
  disabled={currentPage===1}
  onClick={()=>
   setCurrentPage(
    currentPage-1
   )
  }
 >
  Previous
 </button>

 {
  [...Array(totalPages)]
  .map((_,index)=>(

   <button
    key={index}
    className={
     currentPage===
     index+1
      ? "active-page"
      : ""
    }
    onClick={()=>
     setCurrentPage(
      index+1
     )
    }
   >
    {index+1}
   </button>

  ))
 }

 <button
  disabled={
   currentPage===totalPages
  }
  onClick={()=>
   setCurrentPage(
    currentPage+1
   )
  }
 >
  Next
 </button>

</div>

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
   {
 showCalculator && (

  <div className="modal-overlay">

   <div className="calculator-modal">

    <div className="modal-header">

     <h3>
      Smart Calculator Files
     </h3>

     <button
      onClick={() =>
       setShowCalculator(false)
      }
     >
      ✖
     </button>

    </div>

    <table className="crm-table">

     <thead>

      <tr>

       <th>Company</th>

       <th>Order No</th>

       <th>File</th>

       <th>Date</th>

      </tr>

     </thead>

     <tbody>

      {
       calculatorData.length > 0 ?

       calculatorData.map(item => (

        <tr key={item._id}>

         <td>
          {item.companyName}
         </td>

         <td>
          {item.orderNo}
         </td>

         <td>

          <a
           href={item.fileUrl}
           target="_blank"
           rel="noreferrer"
          >
           View File
          </a>

         </td>

         <td>
          {
           new Date(
            item.createdAt
           ).toLocaleDateString()
          }
         </td>

        </tr>

       ))

       :

       <tr>

        <td
         colSpan="4"
         style={{
          textAlign:"center"
         }}
        >
         No Files Found
        </td>

       </tr>

      }

     </tbody>

    </table>

   </div>

  </div>

 )
}

  </div>

 );

};

export default UserList;