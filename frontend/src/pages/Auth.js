import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import { AuthContext } from '../context/auth-context';
import { loginUser, signupUser } from '../api/api';
import './Auth.css';

const Auth = () => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [signupSuccess, setSignupSuccess] = useState(false);

  const switchModeHandler = () => {
    setIsLoginMode(prevMode => !prevMode);
    setError(null);
    setSignupSuccess(false);
  };

  const emailChangeHandler = (event) => {
    setEmail(event.target.value);
  };

  const passwordChangeHandler = (event) => {
    setPassword(event.target.value);
  };

  const nameChangeHandler = (event) => {
    setName(event.target.value);
  };

  const submitHandler = async (event) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      if (isLoginMode) {
        // Login
        const responseData = await loginUser(email, password);
        auth.login(responseData.userId, responseData.token, responseData.name);
        navigate('/');
      } else {
        // Signup
        await signupUser(name, email, password);
        // Don't log in automatically, just show success message
        setSignupSuccess(true);
        setIsLoginMode(true);  // Switch to login mode
        // Clear signup fields
        setName('');
        // Keep email for convenience
        setPassword('');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed, please try again.');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="auth-container">
      <h2>{isLoginMode ? 'Login' : 'Sign Up'}</h2>
      {error && <p className="error-text">{error}</p>}
      {signupSuccess && <p className="success-text">Account created successfully! Please log in.</p>}
      <form onSubmit={submitHandler}>
        {!isLoginMode && (
          <div className="form-control">
            <label htmlFor="name">Name</label>
            <input 
              type="text" 
              id="name" 
              value={name}
              onChange={nameChangeHandler}
              required 
            />
          </div>
        )}
        <div className="form-control">
          <label htmlFor="email">Email</label>
          <input 
            type="email" 
            id="email" 
            value={email}
            onChange={emailChangeHandler}
            required 
          />
        </div>
        <div className="form-control">
          <label htmlFor="password">Password</label>
          <input 
            type="password" 
            id="password" 
            value={password}
            onChange={passwordChangeHandler}
            required 
          />
        </div>
        <div className="auth-actions">
          <button 
            type="submit" 
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : (isLoginMode ? 'LOGIN' : 'SIGNUP')}
          </button>
          <button 
            type="button" 
            className="switch-button" 
            onClick={switchModeHandler}
          >
            SWITCH TO {isLoginMode ? 'SIGNUP' : 'LOGIN'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Auth;