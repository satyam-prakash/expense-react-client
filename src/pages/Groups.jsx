import axios from "axios";
import { useEffect, useState } from "react";
import { serverEndpoint } from "../config/appConfig";
import GroupCard from "../components/GroupCard";
import CreateGroupModal from "../components/CreateGroupModal";

function Groups() {
  const [groups, setGroups] = useState(null);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);

  const fetchGroups = async () => {
    try {
      const response = await axios.get(`${serverEndpoint}/groups/my-groups`, {
        withCredentials: true,
      });
      setGroups(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  const handleGroupUpdateSucess = (data) => {
    const existingGroupIndex = groups?.findIndex(g => g._id === data._id);
    
    if (existingGroupIndex !== -1 && existingGroupIndex !== undefined) {
      const updatedGroups = [...groups];
      updatedGroups[existingGroupIndex] = data;
      setGroups(updatedGroups);
    } else {
      setGroups(groups ? [...groups, data] : [data]);
    }
  }

  useEffect(() => {
    fetchGroups();
  }, []);

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
    <div className="container p-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">Your Groups</h2>
          <p className="text-muted">
            Manage your shared expenses and split expenses
          </p>
        </div>
        <button
          className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm"
          onClick={() => setShow(true)}
        >
          Create Group
        </button>
      </div>

      {groups && groups.length === 0 && <p>No groups found, Start by creating one!</p>}

      {groups && groups.length > 0 && (
        <div className="row g-4">
          {groups.map((group) => (
            <div className="col-md-6 col-lg-4" key={group._id}>
              <GroupCard group={group} onUpdate={handleGroupUpdateSucess}/>
            </div>
          ))}
        </div>
      )}

      <CreateGroupModal
        show={show}
        onHide={() => setShow(false)}
        onSuccess={handleGroupUpdateSucess}
      />
    </div>
  );
}

export default Groups;
