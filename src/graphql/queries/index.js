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
query Customer($keycloakId: String!, $brandId: Int!) {
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
    orderCarts(where: {status: {_eq: "PENDING"}, cartSource: {_eq: "a-la-carte"}, brandId: {_eq: $brandId}}, order_by: {created_at: desc}) {
      id
      address
      customerInfo
      cartInfo
      customerId
      isValid
      paymentMethodId
      stripeCustomerId
      fulfillmentInfo
      deliveryPrice
      itemTotal
      tip
      taxPercent
      tax
      totalPrice
      status
      paymentStatus
      orderId
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
            source: { _eq: "a-la-carte" }
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
