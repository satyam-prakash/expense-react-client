import { useState, useEffect } from "react";
import { serverEndpoint } from "../config/appConfig";
import axios from "axios";
function ManageUsers() {
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${serverEndpoint}/users/`, {
        withCredentials: true,
      });
      setUsers(response.data.users);
    } catch (error) {
      console.log(error);
      setErrors(["Failed to fetch users. Please try again later."]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="container p-5>">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {errors.message && (
        <div className="alert alert-danger" role="alert">
          {errors.message}
        </div>
      )}
      <div className="row align-item-center mb-5">
        <div className="col-md-8 text-center text-md-start mb-3 mb-md-0">
          <h2 className="fw-bold text-dark display-6">
            Manage <span className="text-primary">Users</span>
          </h2>
          <p className="text-muted mb-0">
            view and manage all the users along with their permissions
          </p>
        </div>
      </div>
    </div>
  );
}

export default ManageUsers;
