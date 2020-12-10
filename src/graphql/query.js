import { gql } from "@apollo/client";

export const GET_BRANDID = gql`
  query GET_BRANDID($domain: String!) {
    brands(
      where: {
        _or: [{ domain: { _eq: $domain } }, { isDefault: { _eq: true } }]
      }
    ) {
      id
      isDefault
      domain
      website {
        websitePages {
          id
          route
          internalPageName
        }
      }
    }
  }
`;

export const GET_PAGE_MODULES = gql`
  query GET_PAGE_MODULES($brandId: Int!, $route: String!) {
    website_website(where: { brandId: { _eq: $brandId } }) {
      websitePages(where: { route: { _eq: $route } }) {
        id
        websitePageModules(order_by: { priority: desc }) {
          id
          priority
          fileId
          templateId
          internalModuleIdentifier
        }
      }
    }
  }
`;

export const GET_FILE_PATH = gql`
  query GET_FILE_PATH($id: Int!) {
    editor_file_by_pk(id: $id) {
      fileName
      fileType
      path
      linkedCssFiles(order_by: { priority: desc }) {
        cssFile {
          path
          fileName
          fileType
        }
      }
      linkedJsFiles(order_by: { priority: desc }) {
        jsFile {
          path
          fileName
          fileType
        }
      }
    }
  }
`;

export const GET_FILE_CONTENT = gql`
  query getFile($path: String!) {
    getFile(path: $path) {
      name
      path
      content
      createdAt
      size
      type
    }
  }
`;
