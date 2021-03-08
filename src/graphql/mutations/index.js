export const MUTATION = {
  CART: {
    UPDATE: `
      mutation UpdateCart($id: Int!, $_set: order_cart_set_input) {
         updateCart(pk_columns: {id : $id}, _set: $_set) {
           id
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
  STRIPE: {
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
  },
};
