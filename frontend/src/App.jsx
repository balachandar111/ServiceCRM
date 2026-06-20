import {
 BrowserRouter,
 Routes,
 Route,
 Navigate
}
from "react-router-dom";

import Login from "./pages/auth/Login";
import Dashboard from "./pages/Dashboard";

const ProtectedRoute = ({
 children
}) => {

 const token =
 localStorage.getItem(
  "token"
 );

 return token

 ? children

 : <Navigate to="/login" />;

};

function App() {

 return (

  <BrowserRouter>

   <Routes>

    <Route
     path="/login"
     element={<Login />}
    />

    <Route

     path="/dashboard"

     element={

      <ProtectedRoute>

       <Dashboard />

      </ProtectedRoute>

     }

    />

    <Route

     path="*"

     element={
      <Navigate
       to="/login"
      />
     }

    />

   </Routes>

  </BrowserRouter>

 );
  const [activeMenu,
  setActiveMenu] =
  useState("dashboard");

  return (

    <Dashboard
      activeMenu={activeMenu}
      setActiveMenu={setActiveMenu}
    />

  );

}

export default App;