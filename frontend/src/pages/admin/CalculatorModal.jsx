import React from "react";

const CalculatorModal =
({
 data,
 close
})=>{

 return(

<div className="modal-overlay">

<div className="modal-container">

<h2>
 Calculator Details
</h2>

<p>
 <strong>User :</strong>
 {data.user?.name}
</p>

<p>
 <strong>Email :</strong>
 {data.user?.email}
</p>

<p>
 <strong>Company :</strong>
 {data.companyName}
</p>

<p>
 <strong>Order No :</strong>
 {data.orderNo}
</p>

<p>
 <strong>Date :</strong>
 {
 new Date(
  data.createdAt
 ).toLocaleDateString()
 }
</p>

{
data.fileUrl?.includes(".pdf")

?

<a
 href={data.fileUrl}
 target="_blank"
 rel="noreferrer"
>

 View PDF

</a>

:

<img
 src={data.fileUrl}
 alt=""
 style={{
  width:"300px"
 }}
/>

}

<br/>

<button
 onClick={close}
>

 Close

</button>

</div>

</div>

 );

};

export default CalculatorModal;