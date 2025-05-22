import React, { useContext, useEffect, useState } from 'react';
import Header from '../../components/Header/Header';
import Notification from '../../components/Notification/Notification';
import LoginForm from '../../components/LoginForm/LoginForm';
import { AppContext } from '../../contexts/AppContext';
import './Login.scss';


const Login = () => {

  const { 
    showNotification,
    setShowNotification,
    notificationData,
   } = useContext(AppContext);

  return(
    <div className="login">
      {/* header */}
      <Header />
      
      {/* notification placeholder container */}
      { showNotification &&
        (<div className="login-notification-container">
          <Notification 
            type={notificationData.type}
            message={notificationData.message}
            onClose={() => setShowNotification(false)}
            duration={notificationData.duration} // auto-close after 5 seconds (optional)
          />
        </div>)
      }

      {/* login form */}
      <div className="login-form-container">
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;