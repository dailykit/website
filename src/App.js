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

import { Renderer, Loader, NavBar } from "./components";
import { Checkout } from "./pages";
import { SettingsContext, MenuContext, CustomerContext } from "./context";
import { Main } from "./sections";
import useLocationBlocker from "./locationBlocker";

import "./styles.scss";
import Footer from "./components/Footer";

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
                logo:
                  "https://dailykit-133-test.s3.us-east-2.amazonaws.com/images/59439-1603377412818.jpg",
                name: res.settings.brand.name,
                phone: res.settings.brand.contact.phoneNo,
                email: res.settings.brand.contact.email,
              },
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
      <NavBar />
      <div className="App">
        <Switch>
          <Route exact path="/checkout">
            <Checkout />
          </Route>
          <Route path="/">
            <Main />
          </Route>
        </Switch>
      </div>
      <Footer />
    </>
  );
};

export default App;
