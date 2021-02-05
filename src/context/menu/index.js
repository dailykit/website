import React from "react";

export const MenuContext = React.createContext();

const initialState = {
  categories: [],
};

const reducer = (state = initialState, { type, payload }) => {
  switch (type) {
    case "SEED": {
      const updatedMenu = [];
      for (let category of payload.menu) {
        const products = [];
        for (let product of category.products) {
          products.push({
            ...product,
            jsonData: JSON.stringify(product),
          });
        }
        updatedMenu.push({
          ...category,
          products,
        });
      }
      return { ...state, categories: updatedMenu };
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
