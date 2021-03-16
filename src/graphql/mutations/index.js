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
    },
    CREATE: `
      mutation CreateCart($object: order_cart_insert_input!) {
         createCart(object: $object) {
            id
            cartItemViews(where: { level : { _eq : 1 } }) {
               id
               displayName
               displayImage
               unitPrice
               childs {
                 id
                 displayName
                 displayImage
                 unitPrice
               }
            }
            discount
            tip
            totalPrice
            taxPercent
            tax
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
