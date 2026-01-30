import Login from "./pages/Login";
import AppLayout from "./components/AppLayout";
import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import Logout from "./pages/Logout";
import UserLayout from "./components/UserLayout";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

function App() {
  const [userDetails, setUserDetails] = useState(null);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            userDetails ? (
              <Navigate to="/dashboard" />
            ) : (
              <Login setUser={setUserDetails} />
            )
          }
        />

        <Route
          path="/dashboard"
          element={
            userDetails ? (
              <UserLayout>
                <Dashboard user={userDetails} />
              </UserLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/logout"
          element={
            userDetails ? (
              <Logout setUser={setUserDetails} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
