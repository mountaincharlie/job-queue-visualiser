import { jwtDecode } from "jwt-decode";


// handling the token expiry and validation
export function getValidToken(setUserLoggedIn) {

  // get the token from local storage
  const token = localStorage.getItem('jwtToken');
  if (!token) return null;

  // remove if the token is expired otherwise return it
  try {
    const decoded = jwtDecode(token);

    const currentTime = Date.now() / 1000;
    if (decoded.exp && decoded.exp < currentTime) {
      localStorage.removeItem('jwtToken');
      setUserLoggedIn(false);
      return null;
    }

    return token;
    
  } catch (e) {
    localStorage.removeItem('jwtToken');
    setUserLoggedIn(false);
    return null;
  }
}