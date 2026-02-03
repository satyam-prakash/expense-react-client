import { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { serverEndpoint } from "../config/appConfig";
function Logout({ setUser }) {
  const handleLogout = async() =>{
    try{ 
      await axios.post(`${serverEndpoint}/auth/logout`,
        {},
        { withCredentials:true });
      document.cookie = 'jwtToken=; expires=Thu, 01 jan 1970 00:00:00 UTC; path=/;';
      setUser(null);
    }catch(error){
      console.log(error);
    }
  };

  useEffect(() => {
    handleLogout();
  }, []);
}

export default Logout;
