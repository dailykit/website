import React from "react";
import ReactDOM from "react-dom";
import { ToastContainer } from "react-toastify";
import { BrowserRouter as Router } from "react-router-dom";
import {
  split,
  ApolloClient,
  ApolloLink,
  InMemoryCache,
  createHttpLink,
  ApolloProvider,
} from "@apollo/client";
import { getMainDefinition } from "@apollo/client/utilities";
import { WebSocketLink } from "@apollo/client/link/ws";
import { SubscriptionClient } from "subscriptions-transport-ws";

import {
  SettingsProvider,
  MenuProvider,
  CustomerProvider,
  AuthProvider,
} from "./context";
import App from "./App";
import "react-toastify/dist/ReactToastify.css";

const wssClient = new SubscriptionClient(
  `${process.env.REACT_APP_DATAHUB_SUBSCRIPTIONS_URL}`,
  {
    reconnect: true,
    connectionParams: {
      headers: {
        "x-hasura-admin-secret": `${process.env.REACT_APP_DATAHUB_ADMIN_SECRET}`,
      },
    },
  }
);
const wssLink = new WebSocketLink(wssClient);
const authLink = new ApolloLink((operation, forward) => {
  operation.setContext(({ headers }) => ({
    headers: {
      ...headers,
      "x-hasura-admin-secret": `${process.env.REACT_APP_DATAHUB_ADMIN_SECRET}`,
    },
  }));
  return forward(operation);
});
const httpLink = createHttpLink({
  uri: `${process.env.REACT_APP_DATAHUB_URL}`,
});

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wssLink,
  authLink.concat(httpLink)
);

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});

const rootElement = document.getElementById("root");
ReactDOM.render(
  <ApolloProvider client={client}>
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
  </ApolloProvider>,
  root
);
