import React, { useEffect, useState } from "react";
import API from "../../services/api";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import {
  FaPlus,
  FaDownload,
  FaUpload,
  FaEdit,
  FaTrash,
  FaEye
} from "react-icons/fa";

import CreateCustomerModal from "../user/CreateCustomerModal";
import EditCustomerModal from "../user/EditCustomerModel";
import CustomerDetailsModal from "../user/CustomerDetailsModal";

import "../user/UserCustomers.css";

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [leadStatusFilter, setLeadStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [stageFilter, setStageFilter] = useState("");


  const [uploading, setUploading] =
useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const customersPerPage = 10;

  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    fetchCustomers();
    fetchUsers();
  }, []);

  const bulkUploadCustomers = async (e) => {

  const file = e.target.files[0];

  if (!file) return;

  const formData = new FormData();

  formData.append("file", file);

  try {

    setUploading(true);

    const { data } = await API.post(

      "/customers/bulk-upload",

      formData,

      {
        headers: {
          "Content-Type":
          "multipart/form-data"
        }
      }

    );

    alert(data.message);

    fetchCustomers();

  } catch (error) {

    console.log(error);

    alert(

      error.response?.data?.message ||

      "Bulk Upload Failed"

    );

  } finally {

    setUploading(false);

    e.target.value = "";

  }

};

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/customers");
      setCustomers(data.data || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await API.get("/users");
      setUsers((data.data || []).filter((u) => u.role === "USER"));
    } catch (error) {
      console.log(error);
    }
  };

  const deleteCustomer = async (id) => {
    if (!window.confirm("Delete Customer?")) return;
    try {
      await API.delete(`/customers/${id}`);
      fetchCustomers();
    } catch (error) {
      console.log(error);
    }
  };

const downloadExcel = () => {

 const exportData =
filteredCustomers.map(customer=>{

 const baseData = {

  Name: customer.name,
  Company: customer.company,
  PhoneNumber: customer.phoneNumber,
  Email: customer.email,

  Service: customer.service,
  Status: customer.status,
  CustomerLevel: customer.customerLevel,
  CallType: customer.callType,

  LeadStatus: customer.leadStatus,

  FollowUpType: customer.followUpType,

  FollowUpDate:
  customer.followUpDate
   ? new Date(
      customer.followUpDate
     ).toLocaleDateString()
   : "",

  LeadStage: customer.leadStage,
  Priority: customer.priority,
  Source: customer.source,

  AssignedTo:
  customer.assignedTo || "",

  Sector:
  customer.sector || "",

  Expense:
  customer.expense || "",

  Remark:
  customer.remark || "",

  CreatedDate:
  customer.createdAt
   ? new Date(
      customer.createdAt
     ).toLocaleString()
   : ""

 };

 // QUOTATION SHARED
 if(
  customer.leadStatus ===
  "Quotation Shared"
 ){

  return {

   ...baseData,

   WhatsAppShared:
   customer.quotationShared
   ?.whatsappShared
    ? "Yes"
    : "No",

   EmailShared:
   customer.quotationShared
   ?.emailShared
    ? "Yes"
    : "No",

   GSTType:
   customer.quotationShared
   ?.gstType || "",

   QuotationNumber:
   customer.quotationShared
   ?.quotationNumber || ""

  };

 }

 // CLOSED
 if(
  customer.leadStatus ===
  "Closed"
 ){

  return {

   ...baseData,

   Engineers:
   customer.closedDetails
   ?.engineers
   ?.join(", ") || "",

   FieldEngineer:
   customer.closedDetails
   ?.fieldEngineer || "",

   InvoiceNumber:
   customer.closedDetails
   ?.invoiceNumber || "",

   OutsourceName:
   customer.closedDetails
   ?.outsourceName || "",

   OutsourceDate:
   customer.closedDetails
   ?.outsourceDate
    ? new Date(
       customer.closedDetails.outsourceDate
      ).toLocaleDateString()
    : "",

   InternalName:
   customer.closedDetails
   ?.internalName || "",

   InternalDate:
   customer.closedDetails
   ?.internalDate
    ? new Date(
       customer.closedDetails.internalDate
      ).toLocaleDateString()
    : ""

  };

 }

 return baseData;

});


 const worksheet =
 XLSX.utils.json_to_sheet(
  exportData
 );

 const workbook =
 XLSX.utils.book_new();

 XLSX.utils.book_append_sheet(
  workbook,
  worksheet,
  "Customers"
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
  "Customers.xlsx"
 );

};

  const filteredCustomers = customers.filter((customer) => {
    const searchMatch =
      (customer.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (customer.company || "").toLowerCase().includes(search.toLowerCase()) ||
      (customer.phoneNumber || "").toLowerCase().includes(search.toLowerCase()) ||
      (customer.email || "").toLowerCase().includes(search.toLowerCase());

    const userMatch = userFilter
      ? customer.createdBy?._id === userFilter
      : true;

    const leadStatusMatch = leadStatusFilter
      ? customer.leadStatus === leadStatusFilter
      : true;

    const priorityMatch = priorityFilter
      ? customer.priority === priorityFilter
      : true;

    const stageMatch = stageFilter
      ? customer.leadStage === stageFilter
      : true;

    return searchMatch && userMatch && leadStatusMatch && priorityMatch && stageMatch;
  });

  const indexOfLast = currentPage * customersPerPage;
  const indexOfFirst = indexOfLast - customersPerPage;
  const currentCustomers = filteredCustomers.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredCustomers.length / customersPerPage);

  return (
    <div className="customers-page">
      <div className="page-header">
        <div>
          <h1>Customer Management</h1>
          <p>Admin view — manage customers across all users</p>
        </div>
      </div>

    <div className="toolbar">

<input
 type="text"
 placeholder="Search..."
 value={search}
 onChange={(e)=>{
   setSearch(e.target.value);
   setCurrentPage(1);
 }}
 className="search-box"
/>

<button
 className="download-btn"
 onClick={downloadExcel}
>
 <FaDownload />
 Download
</button>

<label className="upload-btn">

 <FaUpload />

 {uploading
 ? "Uploading..."
 : "Bulk Upload"}

 <input
  type="file"
  accept=".xlsx,.xls"
  hidden
  onChange={bulkUploadCustomers}
 />

</label>

<button
 className="create-btn"
 onClick={()=>
 setShowCreate(true)
}
>

 <FaPlus />

 Add Customer

</button>

</div>

      <div className="filters">
        <h2>Custom Filter:</h2>

        <select
          value={userFilter}
          onChange={(e) => {
            setUserFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="">All Users</option>
          {users.map((u) => (
            <option key={u._id} value={u._id}>
              {u.name}
            </option>
          ))}
        </select>

        <select
          value={leadStatusFilter}
          onChange={(e) => setLeadStatusFilter(e.target.value)}
        >
          <option value="">Lead Status</option>
          <option>Quotation Shared</option>
          <option>Closed</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
        >
          <option value="">All Priority</option>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>

        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
        >
          <option value="">All Stage</option>
          <option>Awareness</option>
          <option>Interest</option>
          <option>Desire</option>
          <option>Closure</option>
        </select>

        <button
          className="clear-btn"
          onClick={() => {
            setSearch("");
            setUserFilter("");
            setLeadStatusFilter("");
            setPriorityFilter("");
            setStageFilter("");
            setCurrentPage(1);
          }}
        >
          Clear
        </button>
      </div>

      <div className="table-wrapper">
        <table className="crm-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Company</th>
              <th>Phone</th>
              <th>Priority</th>
              <th>Stage</th>
              <th>Assigned To</th>
              <th>Created By</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", padding: 30 }}>
                  Loading...
                </td>
              </tr>
            ) : currentCustomers.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", padding: 30 }}>
                  No Customers Found
                </td>
              </tr>
            ) : (
              currentCustomers.map((customer) => (
                <tr key={customer._id}>
                  <td>{customer.name}</td>
                  <td>{customer.company}</td>
                  <td>{customer.phoneNumber}</td>
                  <td>{customer.priority}</td>
                  <td>{customer.leadStage}</td>
                  <td>{customer.assignedTo || "—"}</td>
                  <td>{customer.createdBy?.name || "—"}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="view-btn"
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setShowDetails(true);
                        }}
                      >
                        <FaEye />
                      </button>

                      <button
                        className="edit-btn"
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setShowEdit(true);
                        }}
                      >
                        <FaEdit />
                      </button>

                      <button
                        className="delete-btn"
                        onClick={() => deleteCustomer(customer._id)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </button>

          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              className={currentPage === index + 1 ? "active-page" : ""}
              onClick={() => setCurrentPage(index + 1)}
            >
              {index + 1}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </button>
        </div>
      )}

      {showCreate && (
        <CreateCustomerModal
          refresh={fetchCustomers}
          closeModal={() => setShowCreate(false)}
        />
      )}

      {showEdit && (
        <EditCustomerModal
          customer={selectedCustomer}
          refresh={fetchCustomers}
          closeModal={() => setShowEdit(false)}
        />
      )}

      {showDetails && (
        <CustomerDetailsModal
          customer={selectedCustomer}
          closeModal={() => setShowDetails(false)}
        />
      )}
    </div>
  );
};

export default AdminCustomers;
