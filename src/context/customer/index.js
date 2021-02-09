import React from "react";

export const CustomerContext = React.createContext();

const initialState = {
  customer: {},
};

const reducer = (state = initialState, { type, payload }) => {
  switch (type) {
    case "SEED": {
      return { ...state, ...payload };
    }
    default:
      return state;
  }
};

export const CustomerProvider = ({ children }) => {
  const [customer, customerDispatch] = React.useReducer(reducer, initialState);

  return (
    <CustomerContext.Provider value={{ customer, customerDispatch }}>
      {children}
    </CustomerContext.Provider>
  );
};
