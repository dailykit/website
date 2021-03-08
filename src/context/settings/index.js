import React from "react";

export const SettingsContext = React.createContext();

const initialState = {
  theme: null,
  brand: null,
  app: null,
  availability: null,
  rewards: null,
};

const reducer = (state = initialState, { type, payload }) => {
  switch (type) {
    case "SEED": {
      console.log(payload);
      return { ...state, ...payload };
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
