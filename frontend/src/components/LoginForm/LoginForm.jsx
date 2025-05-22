import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from "react-router";
import Button from '../Button/Button';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import { postCheckUserCredentials } from '../../services/userServices';
import { AppContext } from '../../contexts/AppContext';
import { getValidToken } from '../../utils/userUtils';
import { IoMdEye } from "react-icons/io";
import { IoEyeOff } from "react-icons/io5";
import './LoginForm.scss';


const LoginForm = () => {

  const { 
    userLoggedIn,
    setUserLoggedIn,
    setShowNotification,
    setNotificationData,
  } = useContext(AppContext);

  const [usernameInput, setUsernameInput] = useState('');  // handle text input for username
  const [passwordInput, setPasswordInput] = useState('');  // handle text input for password
  const [showPassword, setShowPassword] = useState(false);  // hide/show state for password
  const [showSpinner, setShowSpinner] = useState(false);  // state for loading spinner

  // initiate navigation
  const navigate = useNavigate();

  // redirect a user to the job-queue page if they are logged in and have a valid token
  useEffect(() => {
    if (getValidToken(setUserLoggedIn) && userLoggedIn) {
      navigate('/job-queue');
    }
  }, []);

  // checks input on type and doesnt allow special character except those required for email
  const checkInput = (text, type) => {
    if (type === 'username') {
      if (/^[a-zA-Z0-9._@-]*$/.test(text) && text.length < 45) {
        setUsernameInput(text);
      } 
    }

    if (type === 'password') {
      if (/^[a-zA-Z0-9._@-]*$/.test(text) && text.length < 30) {
        setPasswordInput(text);
      } 
    }
  };

  const handleLoginFormSubmission = async () => {
    try {
      setShowSpinner(true);

      // POST request to backend to check credentials
      var response = await postCheckUserCredentials({ 'username': usernameInput, 'password': passwordInput });

      // reset the username and password state after request
      setUsernameInput('');
      setPasswordInput('');

      // handle success
      if (response) {
        // success notification
        setNotificationData({
          type: "success",
          message: "Successfully logged in.",
        });
        setShowNotification(true)

        // store jwt
        localStorage.setItem('jwtToken', response.jwt);

        // set user as logged in
        setUserLoggedIn(true);

        // triggers redirect
        navigate("/job-queue");

        // close spinner
        setShowSpinner(false)
      }

    } catch (error) {
      console.error(error);
      // error notification
      setNotificationData({
        type: "error",
        message: `${error.message}`,
      });
      setShowNotification(true);
      // reset the password and remove the spinner
      setPasswordInput('');
      setShowSpinner(false);
    }
  };

  // TODO: maybe add annimate fade in?
  return(
    <div className="loginform">

      {/* spinner shows while the form processes */}
      {showSpinner &&
        <LoadingSpinner height={'35rem'} width={'40rem'}/>
      }

      <div className="loginform-inputs-container">
        {/* username input */}
        <div className="loginform-username">
          <label>USERNAME</label>
          <input
            type="text"
            value={usernameInput}
            onChange={(e) => checkInput(e.target.value, 'username')}
          />
        </div>
        
        {/* password input */}
        <div className="loginform-password">
          <label>PASSWORD</label>
          
          <div className="loginform-password-input-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              value={passwordInput}
              onChange={(e) => checkInput(e.target.value, 'password')}
            />
            <Button 
              title={showPassword ? <IoMdEye/> : <IoEyeOff/>}
              onClick={() => setShowPassword(!showPassword)}
              tooltip={showPassword ? 'Hide password' : 'Show password'}
            />
          </div>
        </div>
      </div>

      {/* login button */}
      <Button
        title={'LOG IN'}
        color={'#a9c7d2'}
        textColor={'#18424E'}
        onClick={() => handleLoginFormSubmission()}
        disabled={usernameInput.length === 0 || passwordInput.length === 0}
      />
    </div>
  );
};

export default LoginForm;