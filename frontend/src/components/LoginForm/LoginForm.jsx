import React, { useContext, useEffect, useState } from 'react';
import Button from '../Button/Button';
import './LoginForm.scss';


const LoginForm = () => {

  const [usernameInput, setUsernameInput] = useState('');  // handle text input for username
  const [passwordInput, setPasswordInput] = useState('');  // handle text input for password


  // check inputs - TODO: confrim this works
  const checkInput = (text, type) => {
    if (/^[a-zA-Z0-9_-]*$/.test(text) && text.length < 50) {
      if (type === 'username') {
        setUsernameInput(text);
      }

      if (type === 'password') {
        setPasswordInput(text);
      }
    }
  };

  // handle form submission
  // - validation
  // - loader / spinner / disable form
  // - handle errors / notification
  // success notification / redirect to job queue page
  // hash the password here before passing to backend

  return(
    <div className="loginform">
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
          <input
            type="password"
            value={passwordInput}
            onChange={(e) => checkInput(e.target.value, 'password')}
          />
          {/* TODO: add eye open/close button to toggle between input type "text" and "password" */}
        </div>
      </div>

      {/* login button */}
      <Button
        title={'LOG IN'}
        color={'#96AFB8'}
        textColor={'#18424E'}
        // onClick={toggleControlPanelHide}  // toggle hide/show control panel
        // tooltip={'Log in'}
      />
    </div>
  );
};

export default LoginForm;