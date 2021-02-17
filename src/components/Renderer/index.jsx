import React from "react";
import { gql, useLazyQuery, useSubscription } from "@apollo/client";
import { MenuContext, SettingsContext, CustomerContext } from "../../context";
import { DailyKit, fileAgent, removeChildren } from "../../utils";
import { ORDERS } from "../../graphql";
import { Loader } from "..";

const Renderer = ({ moduleId, moduleType, moduleFile }) => {
  const dynamicQuery = React.useRef(null);
  const [, theme, folder, file] = moduleFile.path.split("/");
  const [name] = file.split(".").slice(0, 1);
  // console.log("From Renderer", moduleFile);
  const wrapperRef = React.useRef();

  const { settings } = React.useContext(SettingsContext);
  const { menu } = React.useContext(MenuContext);
  const { customer } = React.useContext(CustomerContext);
  const [loading, setLoading] = React.useState(true);
  const [domNodes, setDomNodes] = React.useState([]);
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

  const { loading: runningOrderHistoryQuery, error } = useSubscription(
    gql(ORDERS),
    {
      variables: {
        brandId: 1,
        keycloakId: "33da8306-e5eb-4cb5-bae9-9327fd7700d6",
      },
      onSubscriptionData: ({
        subscriptionData: { data: { orders = [] } = {} } = {},
      } = {}) => {
        setOrderHistory(orders);
      },
    }
  );

  console.log("Orders error: ", error);

  React.useEffect(() => {
    console.log(`Loading ${name}...`);
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

      const parsedHtml = await DailyKit.engine(moduleFile.path, {
        ...settings,
        ...(displayConfig && { local: displayConfig }),
        ...(name === "collections" && { categories: menu.categories }),
        ...(name === "categoryProductsPage" && { categories: menu.categories }),
        ...(name === "search" && { categories: menu.categories }),
        ...(name === "profile" && {
          customer: {
            ...customer.platform_customer,
            keycloakId: customer.keycloakId,
          },
          customerReferralDetails: customer.customerReferralDetails,
        }),
        ...(name === "orders" && { orderHistory: orderHistory }),
        ...(queryData && { ...queryData }),
      });
      console.log("Control reached here for: ", { name, parsedHtml });
      setDomNodes(parsedHtml);
      setLoading(false);
    })();
  }, [settings, menu, queryData]);

  React.useLayoutEffect(() => {
    if (!loading) {
      let element = document.getElementById(`${moduleId}`);
      // let element = wrapperRef.current;
      console.log({ name, element, domNodes });
      if (element && domNodes.length) {
        removeChildren(element);
        for (let el of domNodes) {
          element.appendChild(el);
        }
      }
    }
  }, [loading, domNodes]);

  if (loading || runningQuery || runningOrderHistoryQuery) return <Loader />;
  return null;
};

export default Renderer;
