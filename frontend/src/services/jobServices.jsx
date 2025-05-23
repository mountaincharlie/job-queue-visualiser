import axios from 'axios';

const API_BASE_URL = "http://localhost:8000"


// GET active user's jobs (requires authorisation)
export const getMyJobs = async ( token ) => {
  try {

    const response = await axios.get(`${API_BASE_URL}/jobs/mine`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      params: {
        skip: 0,
        limit: null
      }
    });

    return response.data;

  } catch (error) {
    if (error.response) {
      if (error.response.status === 401) {
        // credentials auth error
        throw new Error("Token expired.");
      } else if (error.response.status === 403) {
        throw new Error("Invalid token.");
      } else if (error.response.status === 400) {
        throw new Error("Invalid token payload.");
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


// GET all jobs (requires authorisation)
export const getAllJobs = async ( token ) => {
  try {

    const response = await axios.get(`${API_BASE_URL}/jobs`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      params: {
        skip: 0,
        limit: null
      }
    });

    return response.data;

  } catch (error) {
    if (error.response) {
      if (error.response.status === 401) {
        // credentials auth error
        throw new Error("Token expired.");
      } else if (error.response.status === 403) {
        throw new Error("Invalid token.");
      } else if (error.response.status === 400) {
        throw new Error("Invalid token payload.");
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