import React from "react";

export const SettingsContext = React.createContext();

const initialState = {
  theme: null,
  brand: null,
  routes: null,
};

const reducer = (state = initialState, { type, payload }) => {
  switch (type) {
    case "SEED": {
      return { ...state, ...payload.settings };
    }
    default:
      return state;
  }
};

export const SettingsProvider = ({ children }) => {
  const [settings, settingsDispatch] = React.useReducer(reducer, initialState);

  return (
    <SettingsContext.Provider value={{ settings, settingsDispatch }}>
      {children}
    </SettingsContext.Provider>
  );
};
