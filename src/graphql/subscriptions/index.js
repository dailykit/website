export const SUBSCRIPTION = {
  CART: {
    FETCH: `
      subscription Carts($id: Int!) {
         cart(id: $id) {
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
            fulfillmentInfo
            customerInfo
            address
            paymentMethodId
            customerKeycloakId
            customerId
         }
      }
      `,
  },
  CARTS: {
    FETCH: `
         subscription Carts($brandId: Int!, $customerKeycloakId: String!) {
            carts(where: { brandId :{_eq :  $brandId }, customerKeycloakId :{_eq :  $customerKeycloakId }, status: { _eq : "CART_PENDING" }, source : { _eq : "a-la-carte" } }) {
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
               fulfillmentInfo
               customerInfo
               address
               paymentMethodId
               customerKeycloakId
               customerId
            }
         }
      `,
  },
  FULFILLMENT: {
    PREORDER: {
      PICKUP: `
         subscription PreOrderPickup($brandId: Int!) {
            preOrderPickup: fulfillmentTypes(
              where: { isActive: { _eq: true }, value: { _eq: "PREORDER_PICKUP" } }
            ) {
              recurrences(
                where: {
                  isActive: { _eq: true }
                  brands: {
                    _and: { brandId: { _eq: $brandId }, isActive: { _eq: true } }
                  }
                }
              ) {
                id
                type
                rrule
                timeSlots(where: { isActive: { _eq: true } }) {
                  id
                  to
                  from
                  pickUpLeadTime
                }
              }
            }
          }
         `,
      DELIVERY: `
        subscription PreOrderDelivery($distance: numeric!, $brandId: Int!) {
         preOrderDelivery: fulfillmentTypes(
           where: { isActive: { _eq: true }, value: { _eq: "PREORDER_DELIVERY" } }
         ) {
           recurrences(
             where: {
               isActive: { _eq: true }
               brands: {
                 _and: { brandId: { _eq: $brandId }, isActive: { _eq: true } }
               }
             }
           ) {
             id
             type
             rrule
             timeSlots(where: { isActive: { _eq: true } }) {
               id
               to
               from
               mileRanges(
                 where: {
                   isActive: { _eq: true }
                   from: { _lte: $distance }
                   to: { _gte: $distance }
                 }
               ) {
                 id
                 to
                 from
                 isActive
                 leadTime
                 charges {
                   id
                   charge
                   orderValueFrom
                   orderValueUpto
                 }
               }
             }
           }
         }
       }
        `,
    },
    ONDEMAND: {
      PICKUP: `
        subscription OndemandPickup($brandId: Int!) {
         onDemandPickup: fulfillmentTypes(
           where: { isActive: { _eq: true }, value: { _eq: "ONDEMAND_PICKUP" } }
         ) {
           recurrences(
             where: {
               isActive: { _eq: true }
               brands: {
                 _and: { brandId: { _eq: $brandId }, isActive: { _eq: true } }
               }
             }
           ) {
             id
             type
             rrule
             timeSlots(where: { isActive: { _eq: true } }) {
               id
               to
               from
               pickUpPrepTime
             }
           }
         }
       }
        `,
      DELIVERY: `
       subscription OnDemandDelivery($distance: numeric!, $brandId: Int!) {
         onDemandDelivery: fulfillmentTypes(
           where: { isActive: { _eq: true }, value: { _eq: "ONDEMAND_DELIVERY" } }
         ) {
           recurrences(
             where: {
               isActive: { _eq: true }
               brands: {
                 _and: { brandId: { _eq: $brandId }, isActive: { _eq: true } }
               }
             }
           ) {
             id
             type
             rrule
             timeSlots(where: { isActive: { _eq: true } }) {
               id
               to
               from
               mileRanges(
                 where: {
                   isActive: { _eq: true }
                   from: { _lte: $distance }
                   to: { _gte: $distance }
                 }
               ) {
                 id
                 to
                 from
                 isActive
                 prepTime
                 charges {
                   id
                   charge
                   orderValueFrom
                   orderValueUpto
                 }
               }
             }
           }
         }
       }
       `,
    },
  },
  ORDERS: {
    FETCH: `
   subscription Orders($keycloakId: String!, $brandId: Int!) {
      orders(
         where: {
            keycloakId: { _eq: $keycloakId }
            brandId: { _eq: $brandId }
         }
         order_by: { created_at: desc }
      ) {
         id
         deliveryInfo
         fulfillmentType
         orderStatus
         amountPaid
         currency
         deliveryPrice
         transactionId
         discount
         tax
         tip
         itemTotal
         created_at
         orderCart {
            cartInfo
         }
      }
   }
`,
  },
};
