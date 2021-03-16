import React from "react";
import { toast } from "react-toastify";
import { gql, useMutation, useQuery, useSubscription } from "@apollo/client";

import { CUSTOMER, MUTATION, SUBSCRIPTION } from "../../graphql";
import { AuthContext } from "../auth";
import { SettingsContext } from "../settings";

export const CustomerContext = React.createContext();

const initialState = {
  customer: null,
  cart: null,
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
  const [storedCartId, setStoredCartId] = React.useState(null);

  React.useEffect(() => {
    const cartId = localStorage.getItem("cart-id");
    if (cartId) setStoredCartId(cartId);
  }, []);

  const { user, isAuthenticated } = React.useContext(AuthContext);
  const { settings } = React.useContext(SettingsContext);

  useSubscription(gql(SUBSCRIPTION.CARTS.FETCH), {
    skip: !(settings?.brand?.id && user?.id),
    variables: {
      brandId: settings?.brand?.id,
      customerKeycloakId: user?.id,
    },
    onSubscriptionData: ({
      subscriptionData: { data: { carts = [] } = {} } = {},
    } = {}) => {
      console.log(carts);
      if (carts.length) {
        if (storedCartId) {
          // merge this cart into the one that has customer info
          console.log("Merge carts");
        }
        //  THIS IS NOT DISPATCHED - CART IS CREATED
        customerDispatch({
          type: "CART",
          payload: carts[0],
        });
      } else {
        if (storedCartId) {
          // update local cart to store customer info
          console.log("No existing cart but 1 in local storage");
        }
      }
    },
  });

  useSubscription(gql(SUBSCRIPTION.CART.FETCH), {
    skip: isAuthenticated || !storedCartId,
    variables: {
      id: storedCartId,
    },
    onSubscriptionData: ({
      subscriptionData: { data: { cart = {} } = {} } = {},
    } = {}) => {
      customerDispatch({
        type: "CART",
        payload: cart,
      });
    },
  });

  console.log(customer?.customer?.id, user?.id);
  // ! removed check for customer.id
  const { refetch: refetchCustomer } = useQuery(gql(CUSTOMER), {
    skip: !customer?.customer?.id,
    context: {
      headers: {
        "Keycloak-Id": user?.id,
      },
    },
    variables: {
      //  cannot remove this as this is required in query
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

  const [createCart] = useMutation(gql(MUTATION.CART.CREATE), {
    context: {
      headers: {
        "Brand-Id": settings?.brand?.id,
        "Keycloak-Id": isAuthenticated ? user?.id : "",
      },
    },
    onCompleted: (data) => {
      if (!isAuthenticated) {
        localStorage.setItem("cart-id", data.createCart.id);
        setStoredCartId(data.createCart.id);
      }
      toast("Cart created!");
    },
    onError: (error) => {
      console.log(error);
      toast.error("Failed to add cart items!");
    },
  });

  const [createCartItems] = useMutation(gql(MUTATION.CART.CART_ITEMS.CREATE), {
    context: {
      headers: {
        "Cart-Id": customer?.cart?.id,
      },
    },
    onCompleted: () => {
      toast("Cart items added!");
    },
    onError: (error) => {
      console.log(error);
      toast.error("Failed to add cart items!");
    },
  });

  const addToCart = React.useCallback(
    (productDetails) => {
      console.log(customer.customer, customer.cart, settings);
      const cartItems = Array.from({ length: productDetails.quantity }).fill(
        productDetails.cartItem
      );
      if (!customer.customer) {
        // without login
        if (!customer.cart) {
          // create a cart
          console.log("Login ❌ Cart ❌");
          const object = {
            cartItems: {
              data: cartItems,
            },
          };
          createCart({
            variables: {
              object,
            },
          });
        } else {
          // create cart items / update existing cart
          console.log("Login ❌ Cart ✔");
          createCartItems({
            variables: {
              objects: cartItems,
            },
          });
        }
      } else {
        // with login
        if (!customer.cart) {
          // create a cart
          console.log("Login ✔ Cart ❌");
          if (!customer.customer.platform_customer)
            return console.log("Platform customer not found!");
          const object = {
            isTest: customer.customer.isTest,
            //   to be moved to headers
            customerId: customer.customer.id,
            paymentMethodId:
              customer.customer.platform_customer.defaultPaymentMethodId,
            stripeCustomerId:
              customer.customer.platform_customer.stripeCustomerId,
            address: customer.customer.platform_customer.defaultCustomerAddress,
            cartItems: {
              data: cartItems,
            },
            ...(customer.customer.platform_customer.firstName && {
              customerInfo: {
                firstName: customer.customer.platform_customer.firstName,
                lastName: customer.customer.platform_customer.lastName,
                email: customer.customer.platform_customer.email,
                phoneNumber: customer.customer.platform_customer.phoneNumber,
              },
            }),
          };
          createCart({
            variables: {
              object,
            },
          });
        } else {
          // update existing cart
          console.log("Login ✔ Cart ✔");
          createCartItems({
            variables: {
              objects: cartItems,
            },
          });
        }
      }
    },
    [settings, customer.customer, customer.cart]
  );

  React.useEffect(() => {
    const handleEvent = (e) => {
      addToCart(e.detail.productDetails);
    };

    window.addEventListener("add-to-cart", handleEvent);
    return () => window.removeEventListener("add-to-cart", handleEvent);
  }, [addToCart]);

  return (
    <CustomerContext.Provider
      value={{ customer, refetchCustomer, customerDispatch }}
    >
      {children}
    </CustomerContext.Provider>
  );
};
