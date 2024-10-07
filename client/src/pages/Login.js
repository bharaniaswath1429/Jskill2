import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import signupimg from '../images/signup.svg';
import { useNavigate } from 'react-router-dom';
import './index.css';
import {jwtDecode} from 'jwt-decode';

const Login = () => {
  const [userType, setUserType] = useState('employee');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const token = localStorage.getItem('authToken');
  let user = null;

  if (token) {
    const decoded = JSON.parse(atob(token.split('.')[1]));
    user = decoded.role;
  }

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const role = decoded.role;
        if (role === 'employee') {
          navigate('/employee');
        } else if (role === 'manager') {
          navigate('/manager');
        } else if (role === 'admin') {
          navigate('/admin');
        }
      } catch (error) {
        console.error('Invalid token:', error);
        navigate('/error');
      }
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please fill all the fields.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:8000/api/login', { email, password, userType });
      const token = response.data.token;
      localStorage.setItem('authToken', token);

      toast.success('Welcome Back!');
      setTimeout(() => {
        if (userType === 'employee') {
          navigate('/employee');
        } else if (userType === 'admin') {
          navigate('/admin');
        } else {
          navigate('/manager');
        }
      }, 2000);
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.error || 'Login failed');
    }
  };

  return (
    <div className="container-fluid" style={{ height: '100vh' }}>
      <div className="row" style={{ height: '100%' }}>
        <div className="col-6 d-flex align-items-center justify-content-center">
          <img src={signupimg} alt="signup img"></img>
        </div>
        <div className="col-6 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#6C63FF' }}>
          <form
            className="p-3"
            onSubmit={handleSubmit}
            style={{
              backgroundColor: 'white',
              borderRadius: '10px',
              width: '370px',
            }}
          >
            <div className="d-flex align-items-center justify-content-center">
              <h2 style={{ color: '#6C63FF', fontWeight: '600' }}>Login</h2>
            </div>
            <div className="user-type-tabs d-flex justify-content-center mt-3">
              <div
                className={`tab ${userType === 'employee' ? 'active-tab' : ''}`}
                onClick={() => setUserType('employee')}
                style={{ borderTopLeftRadius: '10px', borderBottomLeftRadius: '10px' }}
              >
                Employee
              </div>
              <div
                className={`tab ${userType === 'manager' ? 'active-tab' : ''}`}
                onClick={() => setUserType('manager')}
              >
                Manager
              </div>
              <div
                className={`tab ${userType === 'admin' ? 'active-tab' : ''}`}
                onClick={() => setUserType('admin')}
                style={{ borderTopRightRadius: '10px', borderBottomRightRadius: '10px' }}
              >
                Admin
              </div>
            </div>
            <div className="form-group mt-3 mx-2">
              <label style={{ color: '#6C63FF' }}>Email</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group mt-3 mx-2">
              <label style={{ color: '#6C63FF' }}>Password</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="d-flex align-items-center justify-content-center mt-3 mb-3">
              <button className="btnsubmit p-2" style={{ width: '70%', height: '50px' }}>Submit</button>
            </div>
            <div className="d-flex align-items-center justify-content-center mt-3 ">
              <p>Do not have an account? <a href="/signup">Signup</a></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
