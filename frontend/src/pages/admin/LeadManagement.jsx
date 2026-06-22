import React,
{
 useEffect,
 useState
}
from "react";

import API
from "../../services/api";

import CalculatorModal
from "./CalculatorModal";

const LeadManagement = ()=>{

 const [users,setUsers] =
 useState([]);

 const [selected,setSelected] =
 useState(null);

 useEffect(()=>{

  fetchData();

 },[]);

 const fetchData =
 async()=>{

  const {data} =
  await API.get(
   "/smartcalculator/all"
  );

  setUsers(data.data);

 };

 return(

  <div>

   <h2>
    Lead Management
   </h2>

   <table>

    <thead>

     <tr>

      <th>Name</th>
      <th>Email</th>
      <th>Phone</th>
      <th>Company</th>
      <th>Action</th>

     </tr>

    </thead>

    <tbody>

{
users.map(item=>(

<tr key={item._id}>

<td>
 {item.user?.name}
</td>

<td>
 {item.user?.email}
</td>

<td>
 {item.user?.phoneNumber}
</td>

<td>
 {item.user?.company}
</td>

<td>

<button
 onClick={()=>
 setSelected(item)
 }
>

 View Calculator

</button>

</td>

</tr>

))
}

    </tbody>

   </table>

{
selected &&

<CalculatorModal

 data={selected}

 close={()=>
 setSelected(null)
 }

/>

}

  </div>

 );

};

export default LeadManagement;