import { useEffect, useState } from "react";
import { serverEndpoint } from "../config/appConfig";
import axios from "axios";
import { usePermissions } from "../rbac/userPermissions";

function ManageUsers() {
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Select",
  });
  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const userPermissions = usePermissions();

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${serverEndpoint}/users/`, {
        withCredentials: true,
      });
      setUsers(response.data.users);
    } catch (error) {
      console.log(error);
      setErrors({ message: "Unable to fetch users, please try again" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setFormData({ ...formData, [name]: value });
  };

  const validate = () => {
    let isValid = true;
    let newErrors = {};
    if (formData.name.length === 0) {
      isValid = false;
      newErrors.name = "Name is required";
    }
    if (formData.email.length === 0) {
      isValid = false;
      newErrors.email = "Email is required";
    }
    if (formData.role === "Select") {
      isValid = false;
      newErrors.role = "Role is required";
    }
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      setActionLoading(true);
      try {
        const response = await axios.post(
          `${serverEndpoint}/users/`,
          {
            name: formData.name,
            email: formData.email,
            role: formData.role,
          },
          { withCredentials: true },
        );

        // Check if user already exists in the list
        const existingUserIndex = users.findIndex(u => u._id === response.data.user._id);

        if (existingUserIndex !== -1) {
          // Update existing user in the list
          const updatedUsers = [...users];
          updatedUsers[existingUserIndex] = response.data.user;
          setUsers(updatedUsers);
        } else {
          // Add new user to the list
          setUsers([...users, response.data.user]);
        }

        // Show appropriate message based on whether it's a new or existing user
        if (response.data.isExistingUser) {
          setMessage("Access granted! User can login with their existing credentials.");
        } else {
          setMessage("User created! Temporary password sent to their email.");
        }

        setFormData({ name: "", email: "", role: "Select" });
      } catch (error) {
        console.log(error);
        const errorMessage = error.response?.data?.message || "Unable to add user, please try again";
        setErrors({ message: errorMessage });
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const response = await axios.put(
        `${serverEndpoint}/users/`,
        {
          userId: editingUser._id,
          name: editingUser.name,
          role: editingUser.role,
        },
        { withCredentials: true }
      );

      const updatedUsers = users.map(u =>
        u._id === editingUser._id ? response.data.user : u
      );
      setUsers(updatedUsers);
      setMessage("User updated successfully!");
      setShowEditModal(false);
      setEditingUser(null);
    } catch (error) {
      console.log(error);
      setErrors({ message: "Unable to update user, please try again" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    setActionLoading(true);
    try {
      await axios.delete(`${serverEndpoint}/users/`, {
        data: { userId: userToDelete._id },
        withCredentials: true,
      });

      setUsers(users.filter(u => u._id !== userToDelete._id));
      setMessage("User deleted successfully!");
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (error) {
      console.log(error);
      setErrors({ message: "Unable to delete user, please try again" });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container p-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5 px-4 px-md-5">
      <div className="row align-items-center mb-5">
        <div className="col-md-8 text-center text-md-start mb-3 mb-md-0">
          <h2 className="fw-bold text-dark display-6">
            Manage <span className="text-primary">Users</span>
          </h2>
          <p className="text-muted mb-0">
            View and manage all the users along with their permissions
          </p>
        </div>
      </div>

      {errors.message && (
        <div className="alert alert-danger" role="alert">
          {errors.message}
        </div>
      )}

      {message && (
        <div className="alert alert-success" role="alert">
          {message}
        </div>
      )}

      <div className="row">
        {userPermissions.canCreateUsers && (
          <div className="col-md-3">
            <div className="card shadow-sm">
              <div className="card-header">
                <h5>Add Member</h5>
              </div>
              <div className="card-body p-2">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      name="name"
                      className={
                        errors.name ? "form-control is-invalid" : "form-control"
                      }
                      value={formData.name}
                      onChange={handleChange}
                    />
                    {errors.name && (
                      <div className="invalid-feedback ps-1">{errors.name}</div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="text"
                      name="email"
                      className={
                        errors.email ? "form-control is-invalid" : "form-control"
                      }
                      value={formData.email}
                      onChange={handleChange}
                    />
                    {errors.email && (
                      <div className="invalid-feedback ps-1">{errors.email}</div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Role</label>
                    <select
                      name="role"
                      className={
                        errors.role ? "form-select is-invalid" : "form-select"
                      }
                      value={formData.role}
                      onChange={handleChange}
                    >
                      <option value="Select">Select</option>
                      <option value="manager">Manager</option>
                      <option value="viewer">Viewer</option>
                    </select>
                    {errors.role && (
                      <div className="invalid-feedback ps-1">{errors.role}</div>
                    )}
                  </div>

                  <div className="mb-3">
                    <button className="btn btn-primary w-100">
                      {actionLoading ? (
                        <div className="spinner-border" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      ) : (
                        <>Add</>
                      )}
                    </button>
                  </div>

                  <div className="alert alert-info p-2 small mb-0">
                    <strong>Note:</strong> New users will receive a temporary password via email. Existing users can use their current credentials.
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        <div className={userPermissions.canCreateUsers ? "col-md-9" : "col-md-12"}>
          <div className="card shadow-sm">
            <div className="card-header">
              <h5>Team Members</h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="text-center">Name</th>
                      <th className="text-center">Email</th>
                      <th className="text-center">Role</th>
                      {(userPermissions.canUpdateUsers || userPermissions.canDeleteUsers) && (
                        <th className="text-center">Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 && (
                      <tr>
                        <td
                          colSpan={
                            (userPermissions.canUpdateUsers || userPermissions.canDeleteUsers)
                              ? 4
                              : 3
                          }
                          className="text-center py-4 text-muted"
                        >
                          No users found. Start by adding one!
                        </td>
                      </tr>
                    )}
                    {users.length > 0 &&
                      users.map((user) => (
                        <tr key={user._id}>
                          <td className="align-middle">{user.name}</td>
                          <td className="align-middle">{user.email}</td>
                          <td className="align-middle">{user.role}</td>
                          {(userPermissions.canUpdateUsers || userPermissions.canDeleteUsers) && (
                            <td className="align-middle">
                              {userPermissions.canUpdateUsers && (
                                <button
                                  className="btn btn-link text-primary"
                                  onClick={() => handleEdit(user)}
                                >
                                  Edit
                                </button>
                              )}
                              {userPermissions.canDeleteUsers && (
                                <button
                                  className="btn btn-link text-danger"
                                  onClick={() => handleDeleteClick(user)}
                                >
                                  Delete
                                </button>
                              )}
                            </td>
                          )}
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit User</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEditModal(false)}
                ></button>
              </div>
              <form onSubmit={handleUpdateUser}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editingUser.name}
                      onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editingUser.email}
                      disabled
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Role</label>
                    <select
                      className="form-select"
                      value={editingUser.role}
                      onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                    >
                      <option value="manager">Manager</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {actionLoading ? (
                      <div className="spinner-border spinner-border-sm" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && userToDelete && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDeleteModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete <strong>{userToDelete.name}</strong>?</p>
                <p className="text-muted small">This action cannot be undone.</p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDeleteConfirm}
                >
                  {actionLoading ? (
                    <div className="spinner-border spinner-border-sm" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageUsers;
