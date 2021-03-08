export const CARTS = `
  subscription Carts($brandId: Int!, $customerKeycloakId: String!) {
   carts(where: { brandId :{_eq :  $brandId }, customerKeycloakId :{_eq :  $customerKeycloakId }, status: { _eq : "PENDING" }, source : { _eq : "a-la-carte" } }) {
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
