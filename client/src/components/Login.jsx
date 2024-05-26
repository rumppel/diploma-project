import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from 'react';
import { Link } from "react-router-dom";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
axios.defaults.withCredentials = false;
const Login = () => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const [username, setUsername] = useState();
    const [password, setPassword] = useState();
    const navigate = useNavigate();
    
    const handleSubmit = (event) => {
        event.preventDefault();
        
        axios.post( `${backendUrl}/login`, {username, password})
        .then(result => {
            if(result.data.message === "Success"){
                alert('Login successful!');
                navigate('/home');
                window.location.reload();
            }
            else{
                alert('Incorrect password! Please try again.');
            }
        })
        .catch(err => console.log(err));
    }


    return (
        <div>
          <div className="d-flex justify-content-center align-items-center text-center vh-100">
            <div className="bg-white p-3 rounded col-10 col-sm-8 col-md-6 col-lg-4">
              <h2 className='mb-3 text-primary'>Login</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-3 text-start">
                  <label htmlFor="InputUsername" className="form-label">
                    <strong>Username</strong>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Username"
                    className="form-control"
                    id="inputUsername1"
                    onChange={(event) => setUsername(event.target.value)}
                    required
                  />
                </div>
                <div className="mb-3 text-start">
                  <label htmlFor="inputPassword" className="form-label">
                    <strong>Password</strong>
                  </label>
                  <input
                    type="password"
                    placeholder="Enter Password"
                    className="form-control"
                    id="inputPassword1"
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary w-100">Log In</button>
              </form>
              <p className='container my-2'>Don&apos;t have an account?</p>
              <Link to='/register' className="btn btn-secondary w-100">Sign Up</Link>
            </div>
          </div>
        </div>
      )
}

export default Login
