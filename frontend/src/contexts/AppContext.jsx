import { createContext, useReducer, useRef } from "react";

const initialState = {
  // -- users
  userLoggedIn: false,
};

function reducer (state, action) {
  switch (action.type) {
    case "SET_USER_LOGGED_IN":
      return { ...state, userLoggedIn: action.payload };
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

  // functions (including set state and all the complete current state) to pass to all components wrapped in the context
  const value = {
    ...state,
    setUserLoggedIn,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export { AppContext, AppProvider };
