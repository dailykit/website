import React from "react";
import { gql, useMutation, useQuery, useSubscription } from "@apollo/client";

import { CUSTOMER, MUTATION, SUBSCRIPTION } from "../../graphql";
import { AuthContext } from "../auth";
import { SettingsContext } from "../settings";

export const CustomerContext = React.createContext();

const initialState = {
  customer: {},
  cart: {},
};

const reducer = (state = initialState, { type, payload }) => {
  switch (type) {
    case "CUSTOMER": {
      return { ...state, customer: payload };
    }
    case "CART": {
      return { ...state, cart: payload };
    }
    default:
      return state;
  }
};

export const CustomerProvider = ({ children }) => {
  const [customer, customerDispatch] = React.useReducer(reducer, initialState);

  const { user } = React.useContext(AuthContext);
  const { settings } = React.useContext(SettingsContext);

  const { loading } = useSubscription(gql(SUBSCRIPTION.CARTS.FETCH), {
    skip: !(settings?.brand?.id && user?.id),
    variables: {
      brandId: settings?.brand?.id,
      customerKeycloakId: user?.id,
    },
    onSubscriptionData: ({
      subscriptionData: { data: { carts = [] } = {} } = {},
    } = {}) => {
      console.log(carts);
      if (carts.length > 1) {
        console.log("Merge carts");
      }
      customerDispatch({
        type: "CART",
        payload: carts[0],
      });
    },
  });

  console.log(customer?.id, user?.id);
  // ! removed check for customer.id
  const { refetch: refetchCustomer } = useQuery(gql(CUSTOMER), {
    variables: {
      keycloakId: user?.id,
    },
    onCompleted: ({ customer }) => {
      console.log("Customer: ", customer);
      customerDispatch({
        type: "CUSTOMER",
        payload: customer,
      });
    },
    onError: (error) => {
      console.log(error);
    },
    fetchPolicy: "cache-and-network",
  });

  return (
    <CustomerContext.Provider
      value={{ customer, refetchCustomer, customerDispatch }}
    >
      {children}
    </CustomerContext.Provider>
  );
};
