import React from "react";
import { useLocation } from "react-router-dom";
import { gql, useLazyQuery, useQuery, useSubscription } from "@apollo/client";
import { MenuContext, SettingsContext, CustomerContext } from "../../context";
import { DailyKit, fileAgent, removeChildren } from "../../utils";
import {
  SUBSCRIPTION,
  ALL_COUPONS,
  CAMPAIGNS,
  PRODUCTS,
  CARTS,
} from "../../graphql";
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
  const [productData, setProductData] = React.useState({});
  const searchParams = new URLSearchParams(search);
  console.log("config Data", moduleConfig);

  const [runDynamicQuery, { loading: lazyQueryLoading }] = useLazyQuery(
    dynamicQuery.current,
    {
      onCompleted: (data) => {
        setQueryData(data);
      },
    }
  );

  const { loading: ordersQueryLoading, error } = useSubscription(
    gql(SUBSCRIPTION.ORDERS.FETCH),
    {
      variables: {
        brandId: settings?.brand?.id,
        keycloakId: customer?.customer?.keycloakId,
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
      brandId: settings?.brand?.id,
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
      brandId: settings?.brand?.id,
    },
    onCompleted: ({ campaigns = [] }) => {
      console.log(campaigns);
      setAvailableCampaigns(campaigns);
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const { loading: productLoading } = useQuery(gql(PRODUCTS), {
    skip: name !== "productPage",
    variables: {
      ids: [searchParams.get("id")],
    },
    onCompleted: (data) => {
      if (data && data?.products.length) {
        console.log("rendererrr", data?.products[0]);
        setProductData(data?.products[0]);
      }
    },
  });

  const { loading: productsLoading } = useQuery(gql(PRODUCTS), {
    skip: !["collections", "search", "categoryProductsPage"].includes(name),
    variables: {
      ids: menu.allProductIds,
    },
    fetchPolicy: "network-only",
    onCompleted: (data) => {
      if (data && data.products.length) {
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
      }
    },
    onError: (error) => {
      console.log("Error: ", error);
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
      console.log("checking...", hydratedMenu, settings);
      const parsedHtml = await DailyKit.engine(moduleFile.path, {
        ...{ cart: customer.cart },
        ...settings,
        ...(moduleConfig && { config: moduleConfig }),
        ...(name === "collections" && { categories: hydratedMenu }),
        ...(name === "categoryProductsPage" && { categories: hydratedMenu }),
        ...(name === "search" && { categories: hydratedMenu }),
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
        ...(name === "productPage" && { product: productData }),
      });

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
    customer.cart,
    productData,
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
        const event = new CustomEvent("componentLoad", {
          detail: {
            name,
            element,
            cartId: customer?.cart?.id,
            moduleId,
            productType: productData.type,
          },
        });
        element.dispatchEvent(event);
      }
    }
  }, [loading, moduleId, domNodes]);

  if (
    loading ||
    lazyQueryLoading ||
    ordersQueryLoading ||
    couponLoading ||
    campaignLoading ||
    productsLoading ||
    productLoading
  ) {
    return <Loader />;
  }
  return null;
};

export default Renderer;
