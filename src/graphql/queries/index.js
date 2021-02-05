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

export const GET_PAGE_MODULES = `
  query GET_PAGE_MODULES($brandId: Int!, $route: String!) {
    website_website(where: { brandId: { _eq: $brandId } }) {
      websitePages(where: { route: { _eq: $route } }) {
        id
        websitePageModules(order_by: { position: desc_nulls_last }) {
          id
          position
          moduleType
          fileId
          templateId
          internalModuleIdentifier
          file {
            path
            variables
            linkedCssFiles(order_by: { position: desc_nulls_last }) {
              cssFile {
                path
                fileName
                fileType
              }
            }
            linkedJsFiles(order_by: { position: desc_nulls_last }) {
              jsFile {
                path
                fileName
                fileType
              }
            }
          }
        }
      }
    }
  }
`;
