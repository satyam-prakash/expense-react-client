import axios from "axios";
import { useState,useEffect } from "react";
import GroupCard from "../components/GroupCard";
import { serverEndpoint } from "../config/appConfig"

function Groups(){
    const [group,setGroups] = useState([]);
    const [loading,setLoading] = useState(null);
    const fetchGroups = async () =>{
        try{
            const response = await axios.get(`${serverEndpoint}/groups/my-groups`,
            {withCredentials: true});
            setGroups(response.data)
        }
        catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };
    useEffect(()=>{
    fetchGroups();
    },[]);
    if( loading ){
        return(
            <div className="container p-5">
            <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
            </div>
        );
    }
    return(
        <div className="container p-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">Your Groups</h2>
          <p className="text-muted">
            Manage your shared expenses and split expenses
          </p>
        </div>
        <button className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm">
          Create Group
        </button>
      </div>
            {group && group.length === 0 && (
                <div className="">
                    <p>No groups found,Start by creating one!</p>
                </div>
            )}
            {group && group.length > 0 && (
                <div className="row g-4">
                    {group.map((groupItem,index)=>(
                        <div className="col-md-6 col-lg-4" key={groupItem._id}>
                            <GroupCard group={groupItem}/>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
export default Groups;