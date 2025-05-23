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
    console.error(e);
    localStorage.removeItem('jwtToken');
    setUserLoggedIn(false);
    return null;
  }
}

// return a particular user detail e.g. the username, role or exp (expiry time)
export function getUserDetail(token, detail) {
  if (!token) return null;

  // decode token and return
  try {
    const decoded_token = jwtDecode(token);

    return decoded_token[detail];
    
  } catch (e) {
    console.error(e);
    return null;
  }
}