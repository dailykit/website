export const CARTS = `
  subscription Carts($customerId: Int!) {
   carts(where: { customerId :{_eq :  $customerId }, status: { _eq : "PENDING" }, source : { _eq : "a-la-carte" } }) {
      id
      cartItemProducts {
         id
         name
         image
         unitPrice
      }
   }
 }
`;
