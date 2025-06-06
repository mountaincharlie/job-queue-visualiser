import { createContext, useReducer } from "react";

const initialState = {
  // -- users
  userLoggedIn: localStorage.getItem("userLoggedIn") === "true",  // checks local storage rather than setting default false
  // -- notifications
  showNotification: false,
  notificationData: { type:"info", message:"", duration:null },
};

function reducer (state, action) {
  switch (action.type) {
    case "SET_USER_LOGGED_IN":
      localStorage.setItem("userLoggedIn", action.payload);
      return { ...state, userLoggedIn: action.payload };
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
    setShowNotification,
    setNotificationData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export { AppContext, AppProvider };
