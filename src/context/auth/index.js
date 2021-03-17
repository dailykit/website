import React from "react";
import Keycloak from "keycloak-js";
import jwt_decode from "jwt-decode";
import { AppContext } from "../app";

const keycloak = new Keycloak({
  realm: "consumers",
  url: "https://secure.dailykit.org/auth",
  clientId: process.env.REACT_APP_CLIENTID,
  "ssl-required": "none",
  "public-client": true,
  "bearer-only": false,
  "verify-token-audience": true,
  "use-resource-role-mappings": true,
  "confidential-port": 0,
});

export const AuthContext = React.createContext();

export const AuthProvider = ({ children }) => {
  const { setHeaders } = React.useContext(AppContext);

  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [user, setUser] = React.useState({});
  const [isInitialized, setIsInitialized] = React.useState(false);
  const [loginUrl, setLoginUrl] = React.useState("");
  const [registerUrl, setRegisterUrl] = React.useState("");

  const initialize = async () => {
    const authenticated = await keycloak.init({
      onLoad: "check-sso",
      promiseType: "native",
    });
    setIsInitialized(true);
    if (authenticated) {
      setIsAuthenticated(authenticated);
      const profile = await keycloak.loadUserInfo();
      setUser(profile);
    }
  };

  React.useEffect(() => {
    setIsInitialized(true);
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwt_decode(token);
      if (new Date().getTime() > decoded.exp * 1000) {
        // token expired
        logout();
      } else {
        // token valid
        setUser({
          email: decoded["email"],
          email_verified: decoded["email_verified"],
          preferred_username: decoded["preferred_username"],
          sub: decoded["sub"],
          id: decoded["sub"],
        });
        setIsAuthenticated(true);
        setHeaders((headers) => ({
          ...headers,
          "Keycloak-Id": decoded["sub"],
        }));
      }
    } else {
      setIsAuthenticated(false);
      setUser({});
    }
  }, []);

  //   React.useEffect(() => {
  //     if (window && isKeycloakSupported()) {
  //       let eventMethod = window.addEventListener
  //         ? "addEventListener"
  //         : "attachEvent";
  //       let eventer = window[eventMethod];
  //       let messageEvent =
  //         eventMethod === "attachEvent" ? "onmessage" : "message";

  //       eventer(messageEvent, (e) => {
  //         if (e.origin !== window.origin) return;
  //         try {
  //           if (e.data.loginSuccess) {
  //             initialize();
  //           }
  //         } catch (error) {}
  //       });
  //     }
  //   }, []);

  const login = () =>
    keycloak.login({
      redirectUri: `${window.location.origin}/store/LoginSuccess`,
    });
  const logout = async () => {
    localStorage.removeItem("token");
    window.location.href = `${window.location.origin}`;
  };
  const register = () =>
    keycloak.register({
      redirectUri: `${window.location.origin}/store/LoginSuccess`,
    });

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        register,
        isInitialized,
        isAuthenticated,
        loginUrl,
        registerUrl,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
