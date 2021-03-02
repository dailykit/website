import React from "react";
import { useLocation } from "react-router-dom";
import { gql, useLazyQuery, useQuery, useSubscription } from "@apollo/client";
import { MenuContext, SettingsContext, CustomerContext } from "../../context";
import { DailyKit, fileAgent, removeChildren } from "../../utils";
import { ORDERS, ALL_COUPONS, CAMPAIGNS, PRODUCTS } from "../../graphql";
import { Loader } from "..";

const Renderer = ({ moduleId, moduleType, moduleConfig, moduleFile }) => {
  const dynamicQuery = React.useRef(null);
  const { search, pathname } = useLocation();
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
  const [availableCoupons, setAvailableCoupons] = React.useState([]);
  const [availableCampaigns, setAvailableCampaigns] = React.useState([]);
  const [hydratedMenu, setHydratedMenu] = React.useState([]);

  console.log("config Data", moduleConfig);

  const [runDynamicQuery, { loading: lazyQueryLoading }] = useLazyQuery(
    dynamicQuery.current,
    {
      onCompleted: (data) => {
        setQueryData(data);
      },
    }
  );

  const { loading: ordersQueryLoading, error, data } = useSubscription(
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

  const { loading: couponLoading } = useQuery(gql(ALL_COUPONS), {
    variables: {
      brandId: 1,
    },
    onCompleted: ({ coupons = [] }) => {
      console.log(coupons);
      setAvailableCoupons(coupons);
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const { loading: campaignLoading } = useQuery(gql(CAMPAIGNS), {
    variables: {
      brandId: 1,
    },
    onCompleted: ({ campaigns = [] }) => {
      console.log(campaigns);
      setAvailableCampaigns(campaigns);
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const { loading: productsLoading } = useQuery(gql(PRODUCTS), {
    skip: name !== "collections",
    variables: {
      ids: menu.allProductIds,
    },
    onCompleted: (data) => {
      const updatedMenu = menu.categories.map((category) => {
        const updatedProducts = category.products
          .map((productId) => {
            const found = data.products.find(({ id }) => id === productId);
            if (found) {
              return found;
            }
            return null;
          })
          .filter(Boolean);
        return {
          ...category,
          products: updatedProducts,
        };
      });

      setHydratedMenu(updatedMenu);
    },
    onError: (error) => {
      console.log(error);
    },
  });

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
        // const configResponse = await fileAgent(
        //   `/${theme}/${folder}/config/${name}.json`
        // );
        // if (configResponse.status === 200) {
        //   const configObject = await configResponse.json();
        //   if (configObject.display) {
        //     displayConfig = configObject.display;
        //   }
        // }
      } catch (error) {
        console.log(error);
      }
      console.log("from renderer", moduleFile.path);
      const parsedHtml = await DailyKit.engine(moduleFile.path, {
        ...settings,
        ...(moduleConfig && { config: moduleConfig }),
        ...(name === "collections" && { categories: hydratedMenu }),
        ...(name === "categoryProductsPage" && { categories: hydratedMenu }),
        ...(name === "search" && { categories: menu.categories }),
        ...(name === "profile" && {
          customer: {
            ...customer.platform_customer,
            keycloakId: customer.keycloakId,
          },
          customerReferralDetails: customer.customerReferralDetails,
        }),
        ...(name === "orders" && { orderHistory }),
        ...(queryData && { ...queryData }),
        ...(name === "offers" && {
          couponData: availableCoupons,
          campaignData: availableCampaigns,
        }),
      });
      console.log("Control reached here for: ", { name, parsedHtml });
      setDomNodes(parsedHtml);
      setLoading(false);
    })();
  }, [
    settings,
    queryData,
    orderHistory,
    moduleFile.path,
    search,
    pathname,
    hydratedMenu,
  ]);

  React.useEffect(() => {
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
  }, [loading, moduleId, domNodes]);

  if (
    loading ||
    lazyQueryLoading ||
    ordersQueryLoading ||
    couponLoading ||
    campaignLoading ||
    productsLoading
  ) {
    return <Loader />;
  }
  return null;
};

export default Renderer;
