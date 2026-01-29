import { useState } from "react";

function Login() {
    const [formData, setFormData] = useState({
        email:"",
        password:""
    });
        const[error,setError] = useState({});
    const handleChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;

        setFormData({
            ...formData,
            [name]: value
        });
    };

    const validate = () => {
        let newErrors = {};
        let isValid = true;

        if(formData.email.length === 0){
            newErrors.email = "Email is required";
            isValid = false;
        }
        if(formData.password.length === 0){
            newErrors.password = "Password is required";
            isValid = false;
        }
        setError(newErrors);
        return isValid;
    }

    const handleFormSubmit = (event) =>{
        event.preventDefault();
        if(validate()){
            console.log('valid Form');
        }
        else{
            console.log("Invalid Form");
        }
    };

    return (
        <div className="container text-center">
            <h3>Login to Continue </h3>

            <form onSubmit={handleFormSubmit}>
                <div>
                    <label>Email:</label>
                    <input 
                    className="form-control" 
                    type="text" 
                    name="email"
                    onChange={handleChange}
                    />
                    {error.email && <div className="text-danger">{error.email}</div>}
                </div>
                <div>
                    <label>Password:</label>
                    <input 
                    className="form-control" 
                    type="password" 
                    name="password"
                    onChange={handleChange}
                    />
                    {error.password && <div className="text-danger">{error.password}</div>}
                </div>
                <div>
                    <button className="btn btn-primary" type="submit">Login</button>
                </div>
            </form>
        </div>
    )
}

export default Login;