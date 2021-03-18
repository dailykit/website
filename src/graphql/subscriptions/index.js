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
                 displayName
                 displayImage
                 unitPrice
                 childs {
                  displayName
                  displayImage
                  unitPrice
                  childs {
                     displayName
                     displayImage
                     unitPrice
                  }
               }
            }
            }
            discount
            tip
            deliveryPrice
            itemTotal
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
  CART_REWARDS: {
    FETCH: `
      subscription CartRewards($cartId: Int!, $params: jsonb) {
         cartRewards(where: { cartId: { _eq: $cartId } }) {
            reward {
               id
               coupon {
                  id
                  code
               }
               condition {
                  isValid(args: { params: $params })
               }
            }
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
                    displayName
                    displayImage
                    unitPrice
                    childs {
                     displayName
                     displayImage
                     unitPrice
                     childs {
                        displayName
                        displayImage
                        unitPrice
                      }
                    }
                  }
               }
               discount
               tip
               itemTotal
               deliveryPrice
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
  COUPONS: {
    FETCH: `
      subscription Coupons($params: jsonb, $brandId: Int!) {
         coupons(
            where: {
               isActive: { _eq: true }
               isArchived: { _eq: false }
               brands: { brandId: { _eq: $brandId }, isActive: { _eq: true } }
            }
         ) {
            id
            code
            isRewardMulti
            rewards(order_by: { priority: desc }) {
               id
               condition {
                  isValid(args: { params: $params })
               }
            }
            metaDetails
            visibilityCondition {
               isValid(args: { params: $params })
            }
         }
      }
      `,
    FETCH_TEMP: `
      subscription Coupons {
         coupons
          {
            id
            code
            metaDetails
            isRewardMulti
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
