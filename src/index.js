import React from "react";
import ReactDOM from "react-dom";
import { ToastContainer } from "react-toastify";
import { BrowserRouter as Router } from "react-router-dom";

import {
  SettingsProvider,
  MenuProvider,
  CustomerProvider,
  AuthProvider,
  AppProvider,
} from "./context";
import App from "./App";
import "react-toastify/dist/ReactToastify.css";
import AppWrapper from "./AppWrapper";

const rootElement = document.getElementById("root");
ReactDOM.render(
  <AppProvider>
    <AppWrapper>
      <AuthProvider>
        <SettingsProvider>
          <MenuProvider>
            <CustomerProvider>
              <Router>
                <ToastContainer
                  position="top-right"
                  autoClose={3000}
                  hideProgressBar={false}
                  newestOnTop={false}
                  closeOnClick
                  rtl={false}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                />
                <App />
              </Router>
            </CustomerProvider>
          </MenuProvider>
        </SettingsProvider>
      </AuthProvider>
    </AppWrapper>
  </AppProvider>,
  rootElement
);
