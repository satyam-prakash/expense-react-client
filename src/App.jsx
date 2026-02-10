import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import Home from "./pages/Home";
import AppLayout from "./components/AppLayout";
import { useEffect, useState } from "react";
import Dashboard from "./pages/Dashboard";
import Logout from "./pages/Logout";
import UserLayout from "./components/UserLayout";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import { serverEndpoint } from "./config/appConfig";
import { useSelector, useDispatch } from "react-redux";
import { SET_USER } from "./redux/user/action";
import Groups from "./pages/Groups";
import ManageUsers from "./pages/ManageUsers";
import GroupExpenses from "./pages/GroupExpenses";
function App() {
  const dispatch = useDispatch();
  const userDetails = useSelector((state) => state.userDetails);
  const [loading, setLoading] = useState(true);

  const isUserLoggedIn = async () => {
    try {
      const response = await axios.post(
        `${serverEndpoint}/auth/is-user-logged-in`,
        {},
        { withCredentials: true },
      );

      // setUserDetails(response.data.user);
      dispatch({
        type: SET_USER,
        payload: response.data.user,
      });
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    isUserLoggedIn();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          userDetails ? (
            <Navigate to="/dashboard" />
          ) : (
            <AppLayout>
              <Home />
            </AppLayout>
          )
        }
      />
      <Route
        path="/register"
        element={userDetails ? <Navigate to="/dashboard" /> : <Register />}
      />

      <Route
        path="/login"
        element={userDetails ? <Navigate to="/dashboard" /> : <Login />}
      />

      <Route
        path="/reset-password"
        element={userDetails ? <Navigate to="/dashboard" /> : <ResetPassword />}
      />

      <Route
        path="/groups"
        element={
          userDetails ? (
            <UserLayout>
              <Groups />
            </UserLayout>
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/dashboard"
        element={
          userDetails ? (
            <UserLayout>
              <Dashboard />
            </UserLayout>
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/groups/:groupId"
        element={
          userDetails ? (
            <UserLayout>
              <GroupExpenses />
            </UserLayout>
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/manage-users"
        element={
          userDetails ? (
            <UserLayout>
              <ManageUsers />
            </UserLayout>
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      <Route
        path="/logout"
        element={userDetails ? <Logout /> : <Navigate to="/login" />}
      />
    </Routes>
  );
}

export default App;
