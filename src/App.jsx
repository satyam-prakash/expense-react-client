import { useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AppLayout from "./components/AppLayout";
function App() {
    //value of useradetails represent whether
    const [userDetails, setUserDetails] = useState(null);

    return (
        <Routes>
            <Route path="/" element={userDetails ? (<Navigate to="/dashboard"/>):(
                <AppLayout>
                    <Home />
                </AppLayout>
            )
            }/>
            <Route path="/login" element={userDetails ? (<Navigate to="/dashboard"/>):(
                <AppLayout>
                    <Login setUser={setUserDetails}/>
                </AppLayout>
            )
            }/>
            <Route path="/dashboard"element={
                userDetails?(<Dashboard user={userDetails}/>):(
                    <Navigate to="/login"/>
                )
            }
            />
        </Routes>
    );
}
    
export default App;