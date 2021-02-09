const CONSTANTS = {
  DATAHUB_URL: "https://test.dailykit.org/datahub/v1/graphql",
  DATAHUB_ADMIN_SECRET: "60ea76ab-5ab6-4f09-ad44-efeb00f978ce",
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
const addProductToCart = async (
  cartId,
  productId,
  type,
  optionId,
  quantity
) => {
  console.log({ cartId, productId, type, optionId, quantity });
  const data = await useMutation(QUERIES.AddProductToCart, {
    variables: {
      params: {
        cartId,
        productId,
        type,
        optionId,
        quantity,
      },
    },
  });
  return data;
};
