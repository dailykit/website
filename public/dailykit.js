const CONSTANTS = {
  DATAHUB_URL: "https://test.dailykit.org/datahub/v1/graphql",
  DATAHUB_ADMIN_SECRET: "60ea76ab-5ab6-4f09-ad44-efeb00f978ce",
};

const rootDiv = document.getElementById("root");
const onNavigate = (pathname, query) => {
  const event = new CustomEvent("navigator", { detail: { pathname, query } });
  rootDiv.dispatchEvent(event);
};

// window.onpopstate = (e) => {
//   console.log(e);
//   e.preventDefault();
//   history.go(-2);
// };

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
};

const MUTATIONS = {
  UpdateCart: `
      mutation UpdateCart($id: Int!, $set: crm_orderCart_set_input) {
         updateCart(where: { id: { _eq: $id } }, _set: $set) {
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
const addProductToCart = async ({
  cartId,
  productId,
  productType,
  optionId,
  quantity,
  customizableProductId,
  customizableProductOptionId,
}) => {
  try {
    console.log({
      cartId,
      productId,
      productType,
      optionId,
      quantity,
      customizableProductId,
      customizableProductOptionId,
    });

    const isValid = [cartId, productId, productType, optionId, quantity].every(
      Boolean
    );

    if (!isValid) throw Error("Missing values for mutation!");

    const data = await useMutation(QUERIES.AddProductToCart, {
      variables: {
        params: {
          cartId,
          productId,
          productType,
          optionId,
          quantity,
          customizableProductId,
          customizableProductOptionId,
        },
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
