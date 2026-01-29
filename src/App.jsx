import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import AppLayout from "./components/AppLayout";
function App() {
    return (
        <Routes>
            <Route path="/" element={
                <AppLayout>
                    <Home />
                </AppLayout>
            }/>
            <Route path="/login" element={
                <AppLayout>
                    <Login />
                </AppLayout>
            }/>
        </Routes>
    );
}
    
export default App;