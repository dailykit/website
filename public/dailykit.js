const CONSTANTS = {
  DATAHUB_URL: "https://test.dailykit.org/datahub/v1/graphql",
  DATAHUB_ADMIN_SECRET: "60ea76ab-5ab6-4f09-ad44-efeb00f978ce",
};

const rootDiv = document.getElementById("root");
const onNavigate = (pathname, query) => {
  const event = new CustomEvent("navigator", { detail: { pathname, query } });
  rootDiv.dispatchEvent(event);
};

const QUERIES = {
  AddProductToCart: `
   query AddProductToCard($params: jsonb!) {
      onDemand_addProductToCart(args: { params : $params }) {
        success
        message
        data
      }
    }
   `,
  GetProduct: `
  query Products($ids: [Int!]!) {
    products(where: {isArchived: {_eq: false}, id: {_in: $ids}}) {
      id
      name
      type
      assets
      tags
      additionalText
      description
      price
      discount
      isPopupAllowed
      isPublished
      defaultProductOptionId
      productOptions(where: {isArchived: {_eq: false}}, order_by: {position: desc_nulls_last}) {
        id
        position
        type
        label
        price
        discount
        cartItem
        modifier {
          id
          name
          categories(where: {isVisible: {_eq: true}}) {
            name
            isRequired
            type
            limits
            options(where: {isVisible: {_eq: true}}) {
              id
              name
              price
              discount
              quantity
              image
              isActive
              supplierItemId
              sachetItemId
              ingredientSachetId
              cartItem
            }
          }
        }
      }
      customizableProductComponents(where: {isArchived: {_eq: false}}, order_by: {position: desc_nulls_last}) {
        id
        options
        selectedOptions {
          productOption {
            id
            label
            quantity
            modifier {
              id
              name
              categories(where: {isVisible: {_eq: true}}) {
                name
                isRequired
                type
                limits
                options(where: {isVisible: {_eq: true}}) {
                  id
                  name
                  price
                  discount
                  quantity
                  image
                  isActive
                  supplierItemId
                  sachetItemId
                  ingredientSachetId
                  cartItem
                }
              }
            }
          }
          price
          discount
          cartItem
        }
        linkedProduct {
          id
          name
          type
          assets
        }
      }
      comboProductComponents(where: {isArchived: {_eq: false}}, order_by: {position: desc_nulls_last}) {
        id
        label
        options
        selectedOptions {
          productOption {
            id
            label
            quantity
            modifier {
              id
              name
              categories(where: {isVisible: {_eq: true}}) {
                name
                isRequired
                type
                limits
                options(where: {isVisible: {_eq: true}}) {
                  id
                  name
                  price
                  discount
                  quantity
                  image
                  isActive
                  supplierItemId
                  sachetItemId
                  ingredientSachetId
                  cartItem
                }
              }
            }
          }
          price
          discount
          cartItem
        }
        linkedProduct {
          id
          name
          type
          assets
          customizableProductComponents(where: {isArchived: {_eq: false}}, order_by: {position: desc_nulls_last}) {
            id
            options
            selectedOptions {
              productOption {
                id
                label
                quantity
                modifier {
                  id
                  name
                  categories(where: {isVisible: {_eq: true}}) {
                    name
                    isRequired
                    type
                    limits
                    options(where: {isVisible: {_eq: true}}) {
                      id
                      name
                      price
                      discount
                      quantity
                      image
                      isActive
                      supplierItemId
                      sachetItemId
                      ingredientSachetId
                      cartItem
                    }
                  }
                }
              }
              price
              discount
              comboCartItem
            }
            linkedProduct {
              id
              name
              type
              assets
            }
          }
        }
      }
    }
  }
   `,
};

const MUTATIONS = {
  CreateCartItems: `
      mutation CreateCartItems($objects: [order_cartItem_insert_input!]!) {
         createCartItems(objects: $objects) {
            returning {
               id
            }
         }
      }
   `,
  UpdateCustomerDetail: `
      mutation platform_updateCustomer(
        $keycloakId: String!
        $_set: platform_customer_set_input!
    ) {
        platform_updateCustomer(
          _set: $_set
          pk_columns: { keycloakId: $keycloakId }
        ) {
          email
          lastName
          firstName
          keycloakId
          phoneNumber
        }
    }
  `,
};

const useMutation = async (mutation, args) => {
  try {
    const response = await (
      await fetch(CONSTANTS.DATAHUB_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-hasura-admin-secret": CONSTANTS.DATAHUB_ADMIN_SECRET,
        },
        body: JSON.stringify({
          query: mutation,
          variables: args.variables,
        }),
      })
    ).json();
    return response;
  } catch (error) {
    console.log(error);
  }
};

// Global Functions
const addProductToCart = async ({ cartId, cartItem, quantity }) => {
  try {
    console.log({
      cartId,
      cartItem,
      quantity,
    });

    const isValid = [cartId, Object.keys(cartItem).length].every(Boolean);

    if (!isValid) throw Error("Missing values for mutation!");

    const objects = Array.from({ length: quantity }).fill({
      ...cartItem,
      cartId,
    });
    const data = await useMutation(MUTATIONS.CreateCartItems, {
      variables: {
        objects,
      },
    });
    return data;
  } catch (error) {
    console.error(error.message);
  }
};

const updateCustomerDetails = async ({
  keycloakId,
  firstName,
  lastName,
  phoneNumber,
  email,
}) => {
  try {
    console.log(keycloakId, firstName, lastName, phoneNumber, email);
    const isValid = [keycloakId, firstName, lastName, phoneNumber].every(
      Boolean
    );
    if (!isValid) throw Error("Missing values for mutation!");
    const data = await useMutation(MUTATIONS.UpdateCustomerDetail, {
      variables: {
        keycloakId,
        _set: {
          firstName,
          lastName,
          phoneNumber,
        },
      },
    });
    console.log(data);
    return data;
  } catch (error) {
    console.error(error.message);
  }
};
const updateCustomerDefaultAddress = async ({
  keycloakId,
  defaultCustomerAddressId,
}) => {
  try {
    console.log(keycloakId, defaultCustomerAddressId);
    const isValid = [keycloakId, defaultCustomerAddressId].every(Boolean);
    if (!isValid) throw Error("Missing values for mutation!");
    const data = await useMutation(MUTATIONS.UpdateCustomerDetail, {
      variables: {
        keycloakId,
        _set: {
          defaultCustomerAddressId,
        },
      },
    });
    console.log(data);
    return data;
  } catch (error) {
    console.error(error.message);
  }
};
const updateCustomerDefaultPayment = async ({
  keycloakId,
  defaultPaymentMethodId,
}) => {
  try {
    console.log(keycloakId, defaultPaymentMethodId);
    const isValid = [keycloakId, defaultPaymentMethodId].every(Boolean);
    if (!isValid) throw Error("Missing values for mutation!");
    const data = await useMutation(MUTATIONS.UpdateCustomerDetail, {
      variables: {
        keycloakId,
        _set: {
          defaultPaymentMethodId,
        },
      },
    });
    console.log(data);
    return data;
  } catch (error) {
    console.error(error.message);
  }
};

const getProductData = async (productId) => {
  try {
    console.log("from dailykit", productId);
    const isValid = [productId].every(Boolean);
    if (!isValid) throw Error("Missing values for mutation!");
    const data = await useMutation(QUERIES.GetProduct, {
      variables: {
        ids: [productId],
      },
    });
    console.log(data);
    return data;
  } catch (error) {
    console.error(error.message);
  }
};
