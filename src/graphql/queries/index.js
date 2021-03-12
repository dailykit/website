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
          config
          position
          moduleType
          fileId
          templateId
          internalModuleIdentifier
          file {
             id
            path
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

export const CUSTOMER = `
query Customer($keycloakId: String!) {
  customer(keycloakId: $keycloakId) {
    id
    email
    keycloakId
    isTest
    brandCustomers {
      id
      brandId
      keycloakId
    }
    customerReferralDetails {
      id
      signupStatus
      referralStatus
      referralCode
      referredByCode
    }
    platform_customer {
      email
      firstName
      lastName
      phoneNumber
      stripeCustomerId
      customerAddresses {
        id
        line1
        line2
        state
        zipcode
        city
        country
        notes
        label
        landmark
        lat
        lng
      }
      defaultCustomerAddress {
        id
        line1
        line2
        state
        zipcode
        city
        country
        notes
        label
        landmark
        lat
        lng
      }
      stripePaymentMethods {
        stripePaymentMethodId
        last4
        expMonth
        expYear
        brand
      }
      defaultPaymentMethodId
      defaultStripePaymentMethod {
        stripePaymentMethodId
        last4
        expMonth
        expYear
        brand
      }
    }
  }
}
`;

export const ORDERS = `
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
`;

export const ALL_COUPONS = `
  query Coupons($brandId: Int!) {
    coupons(
      where: {
          isActive: { _eq: true }
          isArchived: { _eq: false }
          brands: { brandId: { _eq: $brandId }, isActive: { _eq: true } }
      }
    ) {
      id
      code
      metaDetails
    }
  }
`;

export const CAMPAIGNS = `
query Campaigns($brandId: Int!) {
   campaigns(
      where : {
         isActive : { _eq : true}
         isArchived : { _eq : false }
         brands : { brandId : { _eq :$brandId } }
      }
      ) {
         id
         metaDetails
         type
   }
 }
`;

export const PRODUCTS = `
query Products($ids: [Int!]!) {
  products(where: {isArchived: {_eq: false}, id: {_in: $ids}}) {
    id
    name
    type
    assets
    tags
    additionalText
    description
    price
    discount
    isPopupAllowed
    isPublished
    defaultProductOptionId
    productOptions(where: {isArchived: {_eq: false}}, order_by: {position: desc_nulls_last}) {
      id
      position
      type
      label
      price
      discount
      cartItem
      modifier {
        id
        name
        categories(where: {isVisible: {_eq: true}}) {
          name
          isRequired
          type
          limits
          options(where: {isVisible: {_eq: true}}) {
            id
            name
            price
            discount
            quantity
            image
            isActive
            supplierItemId
            sachetItemId
            ingredientSachetId
            cartItem
          }
        }
      }
    }
    customizableProductComponents(where: {isArchived: {_eq: false}}, order_by: {position: desc_nulls_last}) {
      id
      options
      selectedOptions {
        productOption {
          id
          label
          quantity
          modifier {
            id
            name
            categories(where: {isVisible: {_eq: true}}) {
              name
              isRequired
              type
              limits
              options(where: {isVisible: {_eq: true}}) {
                id
                name
                price
                discount
                quantity
                image
                isActive
                supplierItemId
                sachetItemId
                ingredientSachetId
                cartItem
              }
            }
          }
        }
        price
        discount
        cartItem
      }
      linkedProduct {
        id
        name
        type
        assets
      }
    }
    comboProductComponents(where: {isArchived: {_eq: false}}, order_by: {position: desc_nulls_last}) {
      id
      label
      options
      selectedOptions {
        productOption {
          id
          label
          quantity
          modifier {
            id
            name
            categories(where: {isVisible: {_eq: true}}) {
              name
              isRequired
              type
              limits
              options(where: {isVisible: {_eq: true}}) {
                id
                name
                price
                discount
                quantity
                image
                isActive
                supplierItemId
                sachetItemId
                ingredientSachetId
                cartItem
              }
            }
          }
        }
        price
        discount
        cartItem
      }
      linkedProduct {
        id
        name
        type
        assets
        customizableProductComponents(where: {isArchived: {_eq: false}}, order_by: {position: desc_nulls_last}) {
          id
          options
          selectedOptions {
            productOption {
              id
              label
              quantity
              modifier {
                id
                name
                categories(where: {isVisible: {_eq: true}}) {
                  name
                  isRequired
                  type
                  limits
                  options(where: {isVisible: {_eq: true}}) {
                    id
                    name
                    price
                    discount
                    quantity
                    image
                    isActive
                    supplierItemId
                    sachetItemId
                    ingredientSachetId
                    cartItem
                  }
                }
              }
            }
            price
            discount
            comboCartItem
          }
          linkedProduct {
            id
            name
            type
            assets
          }
        }
      }
    }
  }
}


`;

export const QUERY = {
  STRIPE_PK: `
   query StripePublishableKey {
      organizations {
         stripePublishableKey
      }
   }
   `,
};
