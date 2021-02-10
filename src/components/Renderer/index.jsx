import React from "react";
import { gql, useLazyQuery, useSubscription } from "@apollo/client";
import { MenuContext, SettingsContext, CustomerContext } from "../../context";
import { DailyKit, fileAgent, removeChildren } from "../../utils";
import { ORDERS } from "../../graphql";
import { Loader } from "..";

const Renderer = ({ filePath, variables }) => {
  const dynamicQuery = React.useRef(null);
  const [, theme, folder, file] = filePath.split("/");
  const [name] = file.split(".").slice(0, 1);

  const { settings } = React.useContext(SettingsContext);
  const { menu } = React.useContext(MenuContext);
  const { customer } = React.useContext(CustomerContext);
  const [loading, setLoading] = React.useState(true);
  const [queryData, setQueryData] = React.useState(null);
  const [orderHistory, setOrderHistory] = React.useState([]);

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
      console.log(orders);
      setOrderHistory(orders);
    },
    onError: (error) => {
      console.log(error);
    },
  });

  console.log("runningOrderHistoryQuery", runningOrderHistoryQuery);

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
        ...(name === "profile" && {
          customer: customer.platform_customer,
          customerReferralDetails: customer.customerReferralDetails,
        }),
        ...(name === "orders" && { orderHistory: orderHistory }),
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

  if (loading || runningQuery || runningOrderHistoryQuery) return <Loader />;
  return <div className="Wrapper" id={name}></div>;
};

export default Renderer;
