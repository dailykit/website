export const GET_STORE_DATA = `
   query onDemand_GetStoreData($domain: String!) {
      onDemand_getStoreData(args:{ requestdomain : $domain }) {
         brandId
         settings
      }
   }   
`;

export const GET_MENU = `
   query onDemand_GetMenu($params: jsonb!) {
      onDemand_getMenuV2(args : {  params : $params }) {
      data
      }
   }
`;
