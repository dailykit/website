import React from "react";
import { StrictMode } from "react";
import ReactDOM from "react-dom";
import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  ApolloProvider,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

const httpLink = createHttpLink({
  uri: process.env.REACT_APP_DATAHUB_URL,
});

const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
      "x-hasura-admin-secret": `${process.env.REACT_APP_DATAHUB_ADMIN_SECRET}`,
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

import { SettingsProvider, MenuProvider } from "./context";

import App from "./App";

const rootElement = document.getElementById("root");
ReactDOM.render(
  <StrictMode>
    <ApolloProvider client={client}>
      <SettingsProvider>
        <MenuProvider>
          <App />
        </MenuProvider>
      </SettingsProvider>
    </ApolloProvider>
  </StrictMode>,
  rootElement
);
