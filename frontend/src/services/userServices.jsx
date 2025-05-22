import axios from 'axios';

const API_BASE_URL = "http://localhost:8000"


// POST request to check user credentials - returns user object with`JWT if valid
export const postCheckUserCredentials = async ( credentials ) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/users`, credentials);
    return response.data;
  } catch (error) {
    if (error.response) {
      if (error.response.status === 401) {
        // credentials auth error
        throw new Error("Invalid username or password.");
      } else if (error.response.status === 500) {
        throw new Error("An error occured.");
      } else {
        // other backend error
        throw new Error("Server error.");
      }
    } else {
      // error without response (e.g. network issue)
      throw new Error("Network error. Please try again.");
    }
  }
};