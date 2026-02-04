import axios from "axios";
import { useState } from "react";
import { serverEndpoint } from "../config/appConfig";

function CreateGroupModal({ show, onHide, onSuccess }) {
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [errors, setErrors] = useState({});

  const validate = () => {
    let isValid = true;
    const newErrors = {};
    if (formData.name.length < 3) {
      newErrors.name = "Name must be atleast 3 characters long";
      isValid = false;
    }
    if (formData.description.length < 3) {
      newErrors.description = "Description must be atleast 3 characters long";
      isValid = false;
    }
    setErrors(newErrors);
    return isValid;
  };
  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      try {
        const response = await axios.post(
          `${serverEndpoint}/groups/create`,
          {
            name: formData.name,
            description: formData.description,
          },
          { withCredentials: true }
        );
        onSuccess(response.data.group);
        onHide();
      } catch (error) {
        setErrors({ message: "Unable to add group, please try again" });
      }
    }
  };
  if (!show) return null;
  return (
    <div className="modal show d-block">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 rounded-4 shadow">
          <form onSubmit={handleSubmit}>
            <div className="modal-header border-0">
              <h5>Create Group</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onHide}
              ></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label small fw-bold">Group Name</label>
                <input
                  type="text"
                  className={
                    errors.name ? "form-control is-invalid" : "form-control"
                  }
                  name="name"
                  value={formData.name}
                  onChange={onChange}
                />
                {errors.name && (
                  <div className="invalid-feedback">{errors.name}</div>
                )}
              </div>
              <div className="mb-3">
                <label className="form-label small fw-bold">Description</label>
                <input
                  type="text"
                  className={
                    errors.description
                      ? "form-control is-invalid"
                      : "form-control"
                  }
                  name="description"
                  value={formData.description}
                  onChange={onChange}
                />{" "}
                {errors.description && (
                  <div className="invalid-feedback">{errors.description}</div>
                )}
              </div>
            </div>
            <div className="modal-footer border-0">
              <button
                type="button"
                className="btn btn-light rounded-pill"
                onClick={onHide}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary mx-4 rounded-pill"
              >
                Add
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateGroupModal;
