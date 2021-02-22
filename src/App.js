import { gql, useQuery } from "@apollo/client";
import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
  useHistory,
  Link,
} from "react-router-dom";

import { GET_MENU, GET_STORE_DATA, CUSTOMER } from "./graphql";

import { Renderer, Loader } from "./components";
import { SettingsContext, MenuContext, CustomerContext } from "./context";
import { Main } from "./sections";
import useLocationBlocker from "./locationBlocker";

import "./styles.css";

const App = () => {
  const { settings, settingsDispatch } = React.useContext(SettingsContext);
  const { customer, customerDispatch } = React.useContext(CustomerContext);
  const { menuDispatch } = React.useContext(MenuContext);
  const headerPath = { path: "/default/components/navbar.liquid" };
  const footerPath = { path: "/default/components/footer.ejs" };
  const date = React.useMemo(() => new Date(Date.now()).toISOString(), []);

  // block pushing double history
  useLocationBlocker();

  const { loading } = useQuery(gql(GET_STORE_DATA), {
    variables: {
      domain: window.location.host,
    },
    onCompleted: (data) => {
      if (data.onDemand_getStoreData?.length) {
        const [res] = data.onDemand_getStoreData;
        settingsDispatch({
          type: "SEED",
          payload: {
            settings: {
              theme: {
                color: {
                  primary: res.settings.visual.color,
                  navbar: { bg: res.settings.visual.color },
                  footer: { bg: res.settings.visual.color },
                },
              },
              brand: {
                id: res.brandId,
                name: res.settings.brand.name,
                phone: res.settings.brand.contact.phoneNo,
                email: res.settings.brand.contact.email,
              },
              routes: [
                {
                  display: "left",
                  title: "About Us",
                  link: `https://www.dailykit.org`,
                },
                {
                  display: "left",
                  title:
                    "<i class='fas fa-search' style='color:rgb(102,102,102)'></i> Search",
                  link: `/search`,
                },
                {
                  display: "right",
                  title: "Orders",
                  link: `/orderHistory`,
                },
                {
                  display: "right",
                  title: "Profile",
                  link: `/profile`,
                },
                {
                  display: "right",
                  title:
                    "<i class='fas fa-shopping-cart' style='font-size:20px'><span id='cart-count' class='badge cart-count'>0</span></i>",
                  link: `/cart`,
                },
              ],
            },
          },
        });
      }
    },
    onError: (error) => {
      console.log(error);
    },
  });

  useQuery(gql(GET_MENU), {
    skip: !settings?.brand?.id,
    variables: {
      params: {
        brandId: settings?.brand?.id,
        date,
      },
    },
    onCompleted: (data) => {
      if (data.onDemand_getMenuV2?.length) {
        const [res] = data.onDemand_getMenuV2;
        const { menu } = res.data;
        menuDispatch({
          type: "SEED",
          payload: { menu },
        });
      }
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const { loading: customerLoading } = useQuery(gql(CUSTOMER), {
    skip: !settings?.brand?.id,
    variables: {
      brandId: settings?.brand?.id,
      keycloakId: "33da8306-e5eb-4cb5-bae9-9327fd7700d6",
    },
    onCompleted: ({ customer }) => {
      customerDispatch({
        type: "SEED",
        payload: customer,
      });
    },
    onError: (error) => {
      console.log(error);
    },
  });
  if (loading || customerLoading) return <Loader />;
  return (
    <>
      <div id="headerDiv"></div>
      <Renderer moduleId="headerDiv" moduleFile={headerPath} />
      <Switch>
        <Route path="/">
          <Main />
        </Route>
      </Switch>
      <div id="footerDiv"></div>
      <Renderer moduleId="footerDiv" moduleFile={footerPath} />
    </>
  );
};

export default App;
