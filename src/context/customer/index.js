import React from "react";
import { toast } from "react-toastify";
import { gql, useMutation, useQuery, useSubscription } from "@apollo/client";

import { CUSTOMER, MUTATION, SUBSCRIPTION } from "../../graphql";
import { AuthContext } from "../auth";
import { SettingsContext } from "../settings";
import { AppContext } from "../app";

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
      console.log("🍗 Cart dispatch received!");
      return { ...state, cart: payload };
    }
    default:
      return state;
  }
};

export const CustomerProvider = ({ children }) => {
  const { headers, setHeaders } = React.useContext(AppContext);
  const { user, isAuthenticated } = React.useContext(AuthContext);
  const { settings } = React.useContext(SettingsContext);

  const [customer, customerDispatch] = React.useReducer(reducer, initialState);
  const [storedCartId, setStoredCartId] = React.useState(null);

  React.useEffect(() => {
    const cartId = localStorage.getItem("cart-id");
    if (cartId) {
      setStoredCartId(+cartId);
      if (!isAuthenticated) {
        // only set local cart id in headers when not authenticated
        // when logged in, if it has local cart id then it will try to merge carts
        setHeaders((headers) => ({
          ...headers,
          "Cart-Id": String(cartId),
        }));
      }
    }
  }, []);

  const [updateCart] = useMutation(gql(MUTATION.CART.UPDATE), {
    onCompleted: (data) => {
      localStorage.removeItem("cart-id");
      setStoredCartId(null);
      console.log("🍾 Cart updated with data!");
    },
    onError: (error) => {
      console.log(error);
      toast.error("Failed to add cart items!");
    },
  });

  const [deleteCart] = useMutation(gql(MUTATION.CART.DELETE), {
    onCompleted: () => {
      localStorage.removeItem("cart-id");
      setStoredCartId(null);
      console.log("🤡 Local cart deleted!");
    },
    onError: (error) => {
      console.log(error);
      toast.error("Failed to deleted local cart!");
    },
  });

  const [createCart] = useMutation(gql(MUTATION.CART.CREATE), {
    onCompleted: (data) => {
      if (!isAuthenticated) {
        localStorage.setItem("cart-id", data.createCart.id);
        setStoredCartId(data.createCart.id);
      }
      setHeaders((headers) => ({
        ...headers,
        "Cart-Id": String(data.createCart.id),
      }));
      toast("Cart created!");
    },
    onError: (error) => {
      console.log(error);
      toast.error("Failed to create cart!");
    },
  });

  const [updateCartItems] = useMutation(gql(MUTATION.CART.CART_ITEMS.UPDATE), {
    onCompleted: () => {
      console.log("🍻 Carts merged! Deleting cart...");
      if (storedCartId) {
        deleteCart({
          variables: {
            id: storedCartId,
          },
        });
      }
    },
    onError: (error) => {
      console.log(error);
      toast.error("Failed to update cart items!");
    },
  });

  const [createCartItems] = useMutation(gql(MUTATION.CART.CART_ITEMS.CREATE), {
    onCompleted: () => {
      toast("Cart items added!");
    },
    onError: (error) => {
      console.log(error);
      toast.error("Failed to add cart items!");
    },
  });

  const { error: cartError } = useSubscription(gql(SUBSCRIPTION.CARTS.FETCH), {
    skip: !(
      settings?.brand?.id &&
      user?.id &&
      customer?.customer?.platform_customer
    ),
    variables: {
      brandId: settings?.brand?.id,
      customerKeycloakId: user?.id,
    },
    onSubscriptionData: ({
      subscriptionData: { data: { carts = [] } = {} } = {},
    } = {}) => {
      console.log("Carts:", carts);
      if (carts.length) {
        if (storedCartId || carts.length > 1) {
          // merge this cart into the one that has customer info
          const [primaryCartId, ...cartIds] = carts.map((cart) => cart.id);
          console.log("Merge carts: ", primaryCartId, [
            storedCartId,
            ...cartIds,
          ]);
          updateCartItems({
            variables: {
              cartIds: [storedCartId, ...cartIds],
              _set: {
                cartId: primaryCartId,
              },
            },
          });
        } else {
          console.log("👁 Found one cart in DB: ", carts[0]);
          customerDispatch({
            type: "CART",
            payload: carts[0],
          });
          if (!headers["Cart-Id"]) {
            // to prevent re-rendering
            setHeaders((headers) => ({
              ...headers,
              "Cart-Id": String(carts[0].id),
            }));
          }
        }
      } else {
        if (storedCartId) {
          // update local cart to store customer info
          console.log("👻 No existing cart but 1 in local storage");
          updateCart({
            variables: {
              id: storedCartId,
              _set: {
                isTest: customer.customer.isTest,
                //   to be moved to headers
                customerId: customer.customer.id,
                paymentMethodId:
                  customer.customer.platform_customer.defaultPaymentMethodId,
                stripeCustomerId:
                  customer.customer.platform_customer.stripeCustomerId,
                address:
                  customer.customer.platform_customer.defaultCustomerAddress,
                ...(customer.customer.platform_customer.firstName && {
                  customerInfo: {
                    customerFirstName:
                      customer.customer.platform_customer.firstName,
                    customerLastName:
                      customer.customer.platform_customer.lastName,
                    customerEmail: customer.customer.platform_customer.email,
                    customerPhone:
                      customer.customer.platform_customer.phoneNumber,
                  },
                }),
              },
            },
          });
        }
      }
    },
  });
  console.log("😡 login cart subscription error", cartError);

  const { error: withLoginCartError } = useSubscription(
    gql(SUBSCRIPTION.CART.FETCH),
    {
      skip: isAuthenticated || !storedCartId,
      variables: {
        id: storedCartId,
      },
      onSubscriptionData: ({
        subscriptionData: { data: { cart = {} } = {} } = {},
      } = {}) => {
        console.log("🚀 🍟", cart);
        customerDispatch({
          type: "CART",
          payload: cart,
        });
      },
    }
  );
  console.log("😡 local cart subscription error", withLoginCartError);

  console.log(customer?.customer?.id, user?.id);
  const { refetch: refetchCustomer } = useQuery(gql(CUSTOMER), {
    skip: !customer?.customer?.id,
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
                customerFirstName:
                  customer.customer.platform_customer.firstName,
                customerLastName: customer.customer.platform_customer.lastName,
                customerEmail: customer.customer.platform_customer.email,
                customerPhone: customer.customer.platform_customer.phoneNumber,
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
