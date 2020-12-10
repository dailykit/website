import React from "react";
import ReactDOM from "react-dom";
import App from "./App";

// Apollo Client Imports
import { ApolloProvider } from "@apollo/react-hooks";
import { ApolloClient } from "apollo-client";
import { setContext } from "apollo-link-context";
import { InMemoryCache } from "apollo-cache-inmemory";
import { HttpLink } from "apollo-link-http";
import { split } from "apollo-link";
// import { WebSocketLink } from "apollo-link-ws";
import { getMainDefinition } from "apollo-utilities";

const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
      "x-hasura-admin-secret": "60ea76ab-5ab6-4f09-ad44-efeb00f978ce",
    },
  };
});

// const wsLink = new WebSocketLink({
//   uri: "wss://test.dailykit.org/datahub/v1/graphql",
//   options: {
//     reconnect: true,
//     connectionParams: {
//       headers: {
//         "x-hasura-admin-secret": `60ea76ab-5ab6-4f09-ad44-efeb00f978ce`,
//       },
//     },
//   },
// });

const httpLink = new HttpLink({
  uri: "https://test.dailykit.org/datahub/v1/graphql",
});

// const link = split(
//   ({ query }) => {
//     const definition = getMainDefinition(query);
//     return (
//       definition.kind === "OperationDefinition" &&
//       definition.operation === "subscription"
//     );
//   },
//   wsLink,
//   authLink.concat(httpLink)
// );

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

ReactDOM.render(
  <ApolloProvider client={client}>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </ApolloProvider>,
  document.getElementById("root")
);
