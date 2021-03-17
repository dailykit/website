import React from "react";
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
import { AppContext } from "./context";

const AppWrapper = ({ children }) => {
  const { headers } = React.useContext(AppContext);

  const wssClient = new SubscriptionClient(
    `${process.env.REACT_APP_DATAHUB_SUBSCRIPTIONS_URL}`,
    {
      reconnect: true,
      connectionParams: {
        headers,
      },
    }
  );
  const wssLink = new WebSocketLink(wssClient);
  const authLink = new ApolloLink((operation, forward) => {
    operation.setContext(({ headers: xheaders }) => ({
      headers: {
        ...xheaders,
        ...headers,
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

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};

export default AppWrapper;
