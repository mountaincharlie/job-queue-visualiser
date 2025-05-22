import React, { useContext, useState } from 'react';
import { useNavigate } from "react-router";
import { AppContext } from '../../contexts/AppContext';
import { FaUserCircle } from "react-icons/fa";
import './Header.scss';


const Header = () => {

  const { 
    userLoggedIn,
    setUserLoggedIn
  } = useContext(AppContext);

  const [showLogout, setShowLogout] = useState(false);

  // initiate navigation
  const navigate = useNavigate();

  // handle logout
  const handleLogout = () => {
    // set user as logged out
    setUserLoggedIn(false);
    localStorage.removeItem('jwtToken');
    // trigger redirect to login
    navigate("/");
  };


  return(
    <div className="header">
      <div className="header-logo-container">
        <img className="header-logo-container-img" src="/howden-logo.webp" alt="Howden Logo"/>
      </div>

      {/* only for logged in users - TODO: also maybe restrict to only the queue page */}
      {userLoggedIn &&
        <div className="header-profile-icon-container">
          {/* toggle showing the logout option on clicking profile pic */}
          {showLogout && 
            <div className="header-profile-icon-container-logout" onClick={() => handleLogout()}>Logout</div>
          }
          <FaUserCircle 
            onClick={() => setShowLogout(!showLogout)}
          />
        </div>
      }
    </div>
  );
};

export default Header;