import {useState} from "react"
function GroupCard( {group} ){
    const [showMembers,setShowMembers] = useState(false);
    const handleShowMember = ()=>{
        setShowMembers(!showMembers);
    };
    return(
            <div className="card h-100 border-0 shadow-sm rounded-4 postion-relative">
                <div className="card-body p-4">
                    <div>
                        <h5 className="">{group.name}</h5>
                        {/* */ }
                        <button className="btn btn-sm btn-link p-0" onClick={handleShowMember}>
                            {group.membersEmail.length} Member | {showMembers ? 'Hide' : 'Show'} Members
                        </button>
                    </div>
                    <p>{group.description}</p>
                    {showMembers &&(<div className="rounded-3 p-3 mb-3 border">
                        <h6>Members in this Group</h6>
                        {group.membersEmail.map((member,index)=>(
                            <div>{index+1}. {member}</div>
                        ))}
                        </div>
                    )}
                </div>
            </div>
    )
};
export default GroupCard;