import React from "react";
import { gql, useLazyQuery, useSubscription } from "@apollo/client";
import { MenuContext, SettingsContext, CustomerContext } from "../../context";
import { DailyKit, fileAgent, removeChildren } from "../../utils";
import { ORDERS, ALL_COUPONS } from "../../graphql";
import { Loader } from "..";

const Renderer = ({ filePath, variables }) => {
  const dynamicQuery = React.useRef(null);
  const [, theme, folder, file] = filePath.split("/");
  const [name] = file.split(".").slice(0, 1);

  console.log(`Loading ${name}...`);

  const { settings } = React.useContext(SettingsContext);
  const { menu } = React.useContext(MenuContext);
  const { customer } = React.useContext(CustomerContext);
  const [loading, setLoading] = React.useState(true);
  const [domNodes, setDomNodes] = React.useState([]);
  const [queryData, setQueryData] = React.useState(null);
  const [orderHistory, setOrderHistory] = React.useState([]);
  const [availableCoupons,setAvailableCoupons] = React.useState([]);

  const [runDynamicQuery, { loading: runningQuery }] = useLazyQuery(
    dynamicQuery.current,
    {
      onCompleted: (data) => {
        setQueryData(data);
      },
    }
  );

  const { loading: runningOrderHistoryQuery } = useSubscription(gql(ORDERS), {
    variables: {
      brandId: 1,
      keycloakId: "33da8306-e5eb-4cb5-bae9-9327fd7700d6",
    },
    onSubscriptionData: ({
      subscriptionData: { data: { orders = [] } = {} } = {},
    } = {}) => {
      setOrderHistory(orders);
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const { loading1 } = useSubscription(gql(ALL_COUPONS), {
    variables: {
       brandId:1,
    },
    onSubscriptionData: ({
      subscriptionData: { data: { coupons = [] } = {} } = {},
    } = {}) => {
      console.log(coupons);
      setAvailableCoupons([...coupons])
    },
    onError: error => {
       console.log(error)
    },
  })
  // const { loading2 } = useSubscription(gql(CAMPAIGNS), {
  //   variables: {
  //     brandId:1,
  //   },
  //   onSubscriptionData: ({
  //     subscriptionData: { data: { campaigns = [] } = {} } = {},
  //   } = {}) => {
  //     setAvailableCampaigns([...campaigns])
  //   },
  //   onError: error => {
  //     console.log(error)
  //   },
  // })

  React.useEffect(() => {
    (async () => {
      let displayConfig;

      try {
        // check if graphql query exists
        const queryRes = await fileAgent(
          `/${theme}/${folder}/graphql/${name}.json`
        );

        if (queryRes.status === 200) {
          const queryObject = await queryRes.json();
          dynamicQuery.current = gql(queryObject.query);

          if (dynamicQuery.current) {
            runDynamicQuery({
              variables,
            });
          }
        }

        // check for config file
        const configResponse = await fileAgent(
          `/${theme}/${folder}/config/${name}.json`
        );
        if (configResponse.status === 200) {
          const configObject = await configResponse.json();
          if (configObject.display) {
            displayConfig = configObject.display;
          }
        }
      } catch (error) {
        console.log(error);
      }

      const parsedHtml = await DailyKit.engine(filePath, {
        ...settings,
        ...(displayConfig && { local: displayConfig }),
        ...(name === "collections" && { categories: menu.categories }),
        ...(name === "categoryProductsPage" && { categories: menu.categories }),
        ...(name === "profile" && {
          customer: {
            ...customer.platform_customer,
            keycloakId: customer.keycloakId,
          },
          customerReferralDetails: customer.customerReferralDetails,
        }),
        ...(name === "orders" && { orderHistory: orderHistory }),
        ...(queryData && { ...queryData }),
        ...(name === "offers" && { couponData: availableCoupons }),
      });
      setDomNodes(parsedHtml);
      setLoading(false);
    })();
  }, [settings, menu, queryData]);

  React.useLayoutEffect(() => {
    if (!loading) {
      let element = document.querySelector(`#${name}`);
      console.log({ name, element, domNodes });
      if (element && domNodes.length) {
        removeChildren(element);
        for (let el of domNodes) {
          element.appendChild(el);
        }
      }
    }
  }, [loading, domNodes]);

  return (
    <div className="Wrapper" id={name}>
      <div>
        {(loading || runningQuery || runningOrderHistoryQuery) && <Loader />}
      </div>
    </div>
  );
};

export default Renderer;
