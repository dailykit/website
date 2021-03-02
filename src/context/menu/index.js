import React from "react";

export const MenuContext = React.createContext();

const initialState = {
  categories: [],
  allProductIds: [],
};

const reducer = (state = initialState, { type, payload }) => {
  switch (type) {
    case "SEED": {
      const ids = payload.menu.map((category) => category.products).flat();
      return { ...state, categories: payload.menu, allProductIds: ids };
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
