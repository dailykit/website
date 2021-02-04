import React from "react";

export const MenuContext = React.createContext();

const initialState = {
  categories: [],
};

const reducer = (state = initialState, { type, payload }) => {
  switch (type) {
    case "SEED": {
      return { ...state, categories: payload.menu };
    }
    default:
      return state;
  }
};

export const MenuProvider = ({ children }) => {
  const [menu, menuDispatch] = React.useReducer(reducer, initialState);

  return (
    <MenuContext.Provider value={{ menu, menuDispatch }}>
      {children}
    </MenuContext.Provider>
  );
};
