import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { FaUserCircle } from "react-icons/fa";
import './Header.scss';


const Header = () => {

  const { 
    userLoggedIn,
   } = useContext(AppContext);

  return(
    <div className="header">
      <div className="header-logo-container">
        <img className="header-logo-container-img" src="/howden-logo.webp" alt="Howden Logo"/>
      </div>

      {/* only for logged in users - TODO: also maybe restrict to only the queue page */}
      {userLoggedIn &&
        <div className="header-profile-icon-container">
          <FaUserCircle />
        </div>
      }
    </div>
  );
};

export default Header;