export const MUTATION = {
  CART: {
    CART_ITEMS: {
      CREATE: `
         mutation CreateCartItems($objects: [order_cartItem_insert_input!]!) {
            createCartItems(objects: $objects) {
               returning {
                  id
               }
            }
         }
         `,
      UPDATE: `
        mutation UpdateCartItems($cartIds: [Int!]!, $_set: order_cartItem_set_input) {
         updateCartItems(where: { cartId : { _in : $cartIds } }, _set : $_set) {
           affected_rows
         }
       }
        `,
    },
    CREATE: `
      mutation CreateCart($object: order_cart_insert_input!) {
         createCart(object: $object) {
            id
         }
       }
      `,
    DELETE: `
      mutation DeleteCart($id: Int!) {
         deleteCart(id: $id) {
          id
         }
        }
      `,
    UPDATE: `
      mutation UpdateCart($id: Int!, $_set: order_cart_set_input) {
         updateCart(pk_columns: {id : $id}, _set: $_set) {
           id
         }
       }
      `,
  },
  CART_REWARDS: {
    CREATE: `
      mutation CartRewards($objects: [order_cart_rewards_insert_input!]!) {
         createCartRewards(objects: $objects) {
            returning {
               id
            }
         }
      }
      `,
    DELETE: `
      mutation DeleteCartRewards($cartId: Int!) {
         deleteCartRewards(where: { cartId: { _eq: $cartId } }) {
            returning {
               id
            }
         }
      }
      `,
  },
  CUSTOMER: {
    UPDATE: `
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
  },
  PLATFORM: {
    PAYMENT_METHOD: {
      CREATE: `
         mutation paymentMethod($object: platform_stripePaymentMethod_insert_input!) {
            paymentMethod: platform_createStripePaymentMethod(object: $object) {
               keycloakId
               stripePaymentMethodId
            }
         }
         `,
    },
    ADDRESS: {
      CREATE: `
        mutation platform_createCustomerAddress(
         $object: platform_customerAddress_insert_input!
      ) {
         platform_createCustomerAddress(object: $object) {
            id
            lat
            lng
            line1
            line2
            city
            state
            landmark
            country
            zipcode
            label
            notes
         }
      }
        `,
    },
  },
};
