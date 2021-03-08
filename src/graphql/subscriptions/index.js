export const SUBSCRIPTION = {
  CARTS: {
    FETCH: `
         subscription Carts($brandId: Int!, $customerKeycloakId: String!) {
            carts(where: { brandId :{_eq :  $brandId }, customerKeycloakId :{_eq :  $customerKeycloakId }, status: { _eq : "PENDING" }, source : { _eq : "a-la-carte" } }) {
               id
               cartItemProducts {
                  id
                  name
                  image
                  unitPrice
               }
               fulfillmentInfo
               customerInfo
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
};
