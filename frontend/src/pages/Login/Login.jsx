import React, { useContext, useEffect, useState } from 'react';
import Header from '../../components/Header/Header';
import LoginForm from '../../components/LoginForm/LoginForm';
import './Login.scss';


const Login = () => {

  return(
    <div className="login">

      {/* TODO: make the header a component? */}
      <Header />
      
      {/* notification display container */}
      <div className=""></div>

      {/* login form component? */}
      <div className="login-form-container">
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;