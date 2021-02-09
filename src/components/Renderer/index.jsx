import React from "react";

import { MenuContext, SettingsContext, CustomerContext } from "../../context";
import { DailyKit, fileAgent, removeChildren } from "../../utils";
import { Loader } from "..";
import { gql, useLazyQuery } from "@apollo/client";

const Renderer = ({ filePath, variables }) => {
  const dynamicQuery = React.useRef(null);
  const [, theme, folder, file] = filePath.split("/");
  const [name] = file.split(".").slice(0, 1);

  const { settings } = React.useContext(SettingsContext);
  const { menu } = React.useContext(MenuContext);
  const { customer } = React.useContext(CustomerContext);
  const [loading, setLoading] = React.useState(true);
  const [queryData, setQueryData] = React.useState(null);

  // const customer = {
  //   id: 145,
  //   email: "emma@dailykit.org",
  //   keycloakId: "33da8306-e5eb-4cb5-bae9-9327fd7700d6",
  //   isTest: true,
  //   brandCustomers: [
  //     {
  //       id: 2,
  //       brandId: 1,
  //       keycloakId: "33da8306-e5eb-4cb5-bae9-9327fd7700d6",
  //       __typename: "crm_brand_customer",
  //     },
  //   ],
  //   customerReferralDetails: {
  //     id: 32,
  //     signupStatus: "PENDING",
  //     referralStatus: "COMPLETED",
  //     referralCode: "8118aae8-a8ab-4f75-907c-5b647ff28eb9",
  //     referredByCode: "7d151142-c01a-48e4-b214-9d4ffc9a0422",
  //     __typename: "crm_customerReferral",
  //   },
  //   platform_customer: {
  //     email: "emma@dailykit.org",
  //     firstName: "Emma",
  //     lastName: "Stone",
  //     phoneNumber: "1231231231",
  //     stripeCustomerId: "cus_HoXDFyoFJhAkGN",
  //     customerAddresses: [
  //       {
  //         id: "2b2e4e36-d6be-42ac-a69c-0c0fb4d42a5b",
  //         line1: "9300 Signal View Drive",
  //         line2: "",
  //         state: "Virginia",
  //         zipcode: "20111",
  //         city: "Manassas Park",
  //         country: "United States",
  //         notes: "",
  //         label: "",
  //         landmark: null,
  //         lat: "38.7549699",
  //         lng: "-77.4424536",
  //         __typename: "platform_customerAddress",
  //       },
  //       {
  //         id: "11a0dad5-2ff6-4dd2-b6c2-5851f6bbee71",
  //         line1: "asd",
  //         line2: "asd",
  //         state: "Karnataka",
  //         zipcode: "560034",
  //         city: "Bengaluru",
  //         country: "India",
  //         notes: "",
  //         label: "",
  //         landmark: null,
  //         lat: "12.92773920000001",
  //         lng: "77.63900915980223",
  //         __typename: "platform_customerAddress",
  //       },
  //       {
  //         id: "821dd283-59e1-4a19-8b25-c62760678581",
  //         line1: "D Solitares PG, 1st Block",
  //         line2: "1st Main Road, Koramangala",
  //         state: "Karnataka",
  //         zipcode: "560034",
  //         city: "Bengaluru",
  //         country: "India",
  //         notes: "",
  //         label: "PG",
  //         landmark: null,
  //         lat: "12.92969550284931",
  //         lng: "77.63415525556177",
  //         __typename: "platform_customerAddress",
  //       },
  //       {
  //         id: "0fc36cd0-ec00-406d-ac23-2f76ae7d7c90",
  //         line1: "AA",
  //         line2: "AA",
  //         state: "Haryana",
  //         zipcode: "125011",
  //         city: "Hisar",
  //         country: "India",
  //         notes: "",
  //         label: "",
  //         landmark: "",
  //         lat: "29.17259719999999",
  //         lng: "75.7272703",
  //         __typename: "platform_customerAddress",
  //       },
  //       {
  //         id: "832c84d4-ef4f-4399-9203-492d4ad984c5",
  //         line1: "aa",
  //         line2: "aa",
  //         state: "Haryana",
  //         zipcode: "125011",
  //         city: "Hisar",
  //         country: "India",
  //         notes: "aa",
  //         label: "aa",
  //         landmark: "aa",
  //         lat: "29.17259719999999",
  //         lng: "75.7272703",
  //         __typename: "platform_customerAddress",
  //       },
  //       {
  //         id: "88f92a54-c008-4743-ae62-2cc9b9c26603",
  //         line1: "Line 1",
  //         line2: "Line 2",
  //         state: "Haryana",
  //         zipcode: "125011",
  //         city: "Hisar",
  //         country: "India",
  //         notes: "Drop off instructions",
  //         label: "Label",
  //         landmark: "Landmark",
  //         lat: "29.17259719999999",
  //         lng: "75.7272703",
  //         __typename: "platform_customerAddress",
  //       },
  //       {
  //         id: "f6389ec2-751c-47bb-b03d-add6f4a9c6f0",
  //         line1: "Line 1",
  //         line2: "Line 2",
  //         state: "Haryana",
  //         zipcode: "125011",
  //         city: "Hisar",
  //         country: "India",
  //         notes: "Drop off instructions 2",
  //         label: "Label 2",
  //         landmark: "Landmark",
  //         lat: "29.17259719999999",
  //         lng: "75.7272703",
  //         __typename: "platform_customerAddress",
  //       },
  //       {
  //         id: "a0fb3852-5db0-4958-862b-96b71e565a25",
  //         line1: "Line 1 Only",
  //         line2: "",
  //         state: "Haryana",
  //         zipcode: "125011",
  //         city: "Hisar",
  //         country: "India",
  //         notes: "",
  //         label: "",
  //         landmark: "",
  //         lat: "29.1730029",
  //         lng: "75.7285527",
  //         __typename: "platform_customerAddress",
  //       },
  //       {
  //         id: "d957e3ba-c08b-4d9f-9868-bb2967964343",
  //         line1: "Some Line 1",
  //         line2: "Some Line 2",
  //         state: "Telangana",
  //         zipcode: "121211",
  //         city: "Hyderabad",
  //         country: "India",
  //         notes: "",
  //         label: "Office",
  //         landmark: "",
  //         lat: "17.4160258",
  //         lng: "78.4113656",
  //         __typename: "platform_customerAddress",
  //       },
  //       {
  //         id: "9f3be6ba-e37c-417b-be88-9afb626edb85",
  //         line1: "L1",
  //         line2: "",
  //         state: "Telangana",
  //         zipcode: "500011",
  //         city: "Secunderabad",
  //         country: "India",
  //         notes: "",
  //         label: "Try 1",
  //         landmark: "",
  //         lat: "17.4587541",
  //         lng: "78.4782902",
  //         __typename: "platform_customerAddress",
  //       },
  //     ],
  //     defaultCustomerAddress: {
  //       id: "2b2e4e36-d6be-42ac-a69c-0c0fb4d42a5b",
  //       line1: "9300 Signal View Drive",
  //       line2: "",
  //       state: "Virginia",
  //       zipcode: "20111",
  //       city: "Manassas Park",
  //       country: "United States",
  //       notes: "",
  //       label: "",
  //       landmark: null,
  //       lat: "38.7549699",
  //       lng: "-77.4424536",
  //       __typename: "platform_customerAddress",
  //     },
  //     stripePaymentMethods: [
  //       {
  //         stripePaymentMethodId: "pm_1HEu9eGKMRh0bTaibGaoDXXY",
  //         last4: 4242,
  //         expMonth: 4,
  //         expYear: 2024,
  //         brand: "visa",
  //         __typename: "platform_stripePaymentMethod",
  //       },
  //       {
  //         stripePaymentMethodId: "pm_1HEuDgGKMRh0bTaiUTQmph74",
  //         last4: 4242,
  //         expMonth: 4,
  //         expYear: 2024,
  //         brand: "visa",
  //         __typename: "platform_stripePaymentMethod",
  //       },
  //       {
  //         stripePaymentMethodId: "pm_1HEuIcGKMRh0bTaiFHplpMWo",
  //         last4: 4242,
  //         expMonth: 4,
  //         expYear: 2024,
  //         brand: "visa",
  //         __typename: "platform_stripePaymentMethod",
  //       },
  //     ],
  //     defaultPaymentMethodId: "pm_1HEu9eGKMRh0bTaibGaoDXXY",
  //     defaultStripePaymentMethod: {
  //       stripePaymentMethodId: "pm_1HEu9eGKMRh0bTaibGaoDXXY",
  //       last4: 4242,
  //       expMonth: 4,
  //       expYear: 2024,
  //       brand: "visa",
  //       __typename: "platform_stripePaymentMethod",
  //     },
  //     __typename: "platform_customer",
  //   },
  //   __typename: "crm_customer",
  // };

  const [runDynamicQuery, { loading: runningQuery }] = useLazyQuery(
    dynamicQuery.current,
    {
      onCompleted: (data) => {
        setQueryData(data);
      },
    }
  );

  React.useEffect(() => {
    (async () => {
      let displayConfig;

      try {
        // check if graphql query exists
        const queryRes = await fileAgent(
          `/${theme}/${folder}/graphql/${name}.json`
        );

        if (queryRes) {
          const queryObject = await queryRes.json();
          dynamicQuery.current = gql(queryObject.query);

          if (dynamicQuery.current) {
            runDynamicQuery({
              variables,
            });
          }
        }

        // check for config file
        const configObject = await (
          await fileAgent(`/${theme}/${folder}/config/${name}.json`)
        ).json();

        if (configObject.display) {
          displayConfig = configObject.display;
        }
      } catch (error) {
        console.log(error);
      }

      const parsedHtml = await DailyKit.engine(filePath, {
        ...settings,
        ...(displayConfig && { local: displayConfig }),
        ...(name === "collections" && { categories: menu.categories }),
        ...(name === "profile" && {
          customer: customer.platform_customer,
          customerReferralDetails: customer.customerReferralDetails,
        }),
        ...(queryData && { ...queryData }),
      });
      // setHtml(parsedHtml);
      setLoading(false);
      let element = document.getElementById(name);
      if (element && parsedHtml.length) {
        removeChildren(element);
        for (let el of parsedHtml) {
          element.appendChild(el);
        }
      }
    })();
  }, [settings, menu, queryData]);

  if (loading || runningQuery) return <Loader />;
  return <div className="Wrapper" id={name}></div>;
};

export default Renderer;
