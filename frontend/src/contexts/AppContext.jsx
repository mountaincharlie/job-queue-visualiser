import { createContext, useReducer, useRef } from "react";

const initialState = {
  // -- users
  userLoggedIn: false,
  activeUserDetails: null,  // user object
  // -- notifications
  showNotification: false,
  notificationData: { type:"info", message:"", duration:null },
};

function reducer (state, action) {
  switch (action.type) {
    case "SET_USER_LOGGED_IN":
      return { ...state, userLoggedIn: action.payload };
    case "SET_ACTIVE_USER_DETAILS":
      return { ...state, activeUserDetails: action.payload };
    case "SET_SHOW_NOTIFICATION":
      return { ...state, showNotification: action.payload };
    case "SET_NOTIFICATION_DATA":
      return { ...state, notificationData: action.payload };
    // default
    default:
      return state;
  }
}

const AppContext = createContext(initialState);

const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // -- users

  const setUserLoggedIn = (payload) => {
    dispatch({ type: "SET_USER_LOGGED_IN", payload });
  };

  const setActiveUserDetails = (payload) => {
    dispatch({ type: "SET_ACTIVE_USER_DETAILS", payload });
  };

  // -- notifications

  const setShowNotification = (payload) => {
    dispatch({ type: "SET_SHOW_NOTIFICATION", payload });
  };

  const setNotificationData = (payload) => {
    dispatch({ type: "SET_NOTIFICATION_DATA", payload });
  };

  // functions (including set state and all the complete current state) to pass to all components wrapped in the context
  const value = {
    ...state,
    setUserLoggedIn,
    setActiveUserDetails,
    setShowNotification,
    setNotificationData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export { AppContext, AppProvider };
