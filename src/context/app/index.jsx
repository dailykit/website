import React from "react";

export const AppContext = React.createContext();

export const AppProvider = ({ children }) => {
  const [headers, setHeaders] = React.useState({
    "Brand-Id": "1",
    Source: "a-la-carte",
    "Keycloak-Id": "",
    "Cart-Id": "",
    "Customer-Id": "",
  });

  return (
    <AppContext.Provider value={{ headers, setHeaders }}>
      {children}
    </AppContext.Provider>
  );
};
