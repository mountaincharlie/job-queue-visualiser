import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AppContext } from "../contexts/AppContext";
import { getValidToken } from "./userUtils";


// wrapper for protecting routes which should require authentication
const ProtectedRoute = ({ children }) => {

  // uses the logger in status from the AppContext to check authentication status
  // NOTE: the context is reset when the app is refreshed 
  // (but the login default uses local storage - see AppContext)
  const { 
    userLoggedIn,
    setUserLoggedIn,
  } = useContext(AppContext);

  const location = useLocation();

  const token = getValidToken(setUserLoggedIn);

  if (!userLoggedIn || !token) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;