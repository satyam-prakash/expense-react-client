import {useState} from "react"
import { serverEndpoint } from "../config/appConfig";
import axios from "axios";

function GroupCard( {group, onUpdate, onEdit, onDelete} ){
    const [showMembers,setShowMembers] = useState(false);
    const [memberEmail,setMemberEmail] = useState('');
    const [errors,setErrors] = useState({});
    
    const handleShowMember = ()=>{
        setShowMembers(!showMembers);
    };
    
    const handleAddMember = async() =>{
        if(memberEmail.length===0){
            return;
        }
        try{
            const response = await axios.patch(`${serverEndpoint}/groups/members/add`,
            {
                groupId: group._id,
                emails: [memberEmail]
            },
            {withCredentials: true}
        );
        onUpdate(response.data);
        setMemberEmail('');
        }catch(error){
            console.log(error);
            setErrors({message: 'Unable to add member'});
        }
    };

    const handleRemoveMember = async(email) =>{
        try{
            const response = await axios.patch(`${serverEndpoint}/groups/members/remove`,
            {
                groupId: group._id,
                emails: [email]
            },
            {withCredentials: true}
        );
        onUpdate(response.data);
        }catch(error){
            console.log(error);
            setErrors({message: 'Unable to remove member'});
        }
    };

    const handleDeleteGroup = async() =>{
        if(window.confirm(`Are you sure you want to delete the group "${group.name}"?`)){
            try{
                await axios.delete(`${serverEndpoint}/groups/${group._id}`,
                    {withCredentials: true}
                );
                onDelete(group._id);
            }catch(error){
                console.log(error);
                setErrors({message: 'Unable to delete group'});
            }
        }
    };
    return(
            <div className="card h-100 border-0 shadow-sm rounded-4 postion-relative">
                <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                        <div className="flex-grow-1">
                            <h5 className="">{group.name}</h5>
                            <button className="btn btn-sm btn-link p-0" onClick={handleShowMember}>
                                {group.membersEmail.length} Member | {showMembers ? 'Hide' : 'Show'} Members
                            </button>
                        </div>
                        <div className="d-flex gap-2">
                            <button 
                                className="btn btn-sm btn-outline-secondary rounded-circle" 
                                onClick={() => onEdit(group)}
                                title="Edit Group"
                            >
                                <i className="bi bi-pencil"></i>
                            </button>
                            <button 
                                className="btn btn-sm btn-outline-danger rounded-circle" 
                                onClick={handleDeleteGroup}
                                title="Delete Group"
                            >
                                <i className="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                    <p>{group.description}</p>
                    {showMembers &&(<div className="rounded-3 p-3 mb-3 border">
                        <h6>Members in this Group</h6>
                        {group.membersEmail.map((member,index)=>(
                            <div key={index} className="d-flex justify-content-between align-items-center py-1">
                                <span>{index+1}. {member}</span>
                                <button 
                                    className="btn btn-sm btn-outline-danger rounded-circle p-1" 
                                    onClick={() => handleRemoveMember(member)}
                                    title="Remove Member"
                                    style={{width: '28px', height: '28px'}}
                                >
                                    <i className="bi bi-x-lg"></i>
                                </button>
                            </div>
                        ))}
                        </div>
                    )}
                    <div className="mb-3">
                        <label className="form-label extra-small fw-bold text-secondary">Add Member</label>
                        <div className="input-group input-group-sm">
                            <input type="email" className="form-control border-end-0" value={memberEmail}
                                onChange={(e)=> setMemberEmail(e.target.value)}
                            />
                            <button className="btn btn-primary px-3" onClick={handleAddMember}>Add</button>
                        </div>
                    </div>
                </div>
            </div>
        );
}
export default GroupCard;