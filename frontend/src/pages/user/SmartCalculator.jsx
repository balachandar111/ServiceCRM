import React,{
useState,
useRef
} from "react";
import API from "../../services/api";
import "./SmartCalculator.css";

const SmartCalculator = () => {
  const [form, setForm] = useState({ companyName: "", orderNo: "" });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef=useRef(null);

const [dragActive,setDragActive]=
useState(false);

const handleFile=(selected)=>{

if(!selected)return;

const allowed=[
"application/pdf",
"image/png"
];

if(
!allowed.includes(selected.type)
){

alert(
"Only PDF and PNG files are allowed."
);

return;

}

if(
selected.size>
10*1024*1024
){

alert(
"Maximum file size is 10 MB."
);

return;

}

setFile(selected);

};

const handleDrag=(e)=>{

e.preventDefault();
e.stopPropagation();

if(
e.type==="dragenter" ||
e.type==="dragover"
){

setDragActive(true);

}

else{

setDragActive(false);

}

};

const handleDrop=(e)=>{

e.preventDefault();

e.stopPropagation();

setDragActive(false);

if(
e.dataTransfer.files &&
e.dataTransfer.files[0]
){

handleFile(
e.dataTransfer.files[0]
);

}

};

  // Get logged-in user info from localStorage (set on login)
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const submitData = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Please select a file to upload.");
      return;
    }

    try {
      setUploading(true);

      const fd = new FormData();
      fd.append("companyName", form.companyName);
      fd.append("orderNo", form.orderNo);
      fd.append("file", file);
      // userId is derived on the backend from req.user.id (JWT token)
      // No need to send it manually — the protect middleware handles it.

      const res = await API.post("/smartcalculator/create", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert(res.data.message || "Uploaded Successfully");
      setForm({ companyName: "", orderNo: "" });
      setFile(null);
      // Reset file input
      const fileInput = document.getElementById("sc-file-input");
      if (fileInput) fileInput.value = "";
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Upload Failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="card">
      <h2>Smart Calculator</h2>

      {user && (
        <p style={{ color: "#64748b", fontSize: 13, marginBottom: 16 }}>
          Uploading as: <strong>{user.name}</strong>
        </p>
      )}

      <form onSubmit={submitData}>
        <div className="form-group">
          <label>Company Name</label>
          <input
            type="text"
            value={form.companyName}
            onChange={(e) => setForm({ ...form, companyName: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label>Order Number</label>
          <input
            type="text"
            value={form.orderNo}
            onChange={(e) => setForm({ ...form, orderNo: e.target.value })}
            required
          />
        </div>

       <div className="form-group">

<label>

Upload Document

</label>

<div

className={`drop-zone ${
dragActive
?
"drag-active"
:
""
}`}

onDragEnter={handleDrag}

onDragLeave={handleDrag}

onDragOver={handleDrag}

onDrop={handleDrop}

onClick={()=>{

fileInputRef.current.click();

}}

>

<div className="drop-icon">

📄

</div>

<h4>

Drag & Drop File Here

</h4>

<p>

or Click to Browse

</p>

<small>

Supported:
PDF / PNG

(Max 10 MB)

</small>

<input

ref={fileInputRef}

id="sc-file-input"

type="file"

accept=".pdf,.png"

hidden

onChange={(e)=>

handleFile(

e.target.files[0]

)

}

/>

</div>

</div>

      {file && (

<div className="file-preview">

<div>

<h4>

{file.name}

</h4>

<p>

{(
file.size/
1024/
1024
).toFixed(2)}

MB

</p>

</div>

<button

type="button"

className="remove-file"

onClick={()=>{

setFile(null);

fileInputRef.current.value="";

}}

>

✕

</button>

</div>

)}

        <button type="submit" className="upload-btn" disabled={uploading}>
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </form>
    </div>
  );
};

export default SmartCalculator;