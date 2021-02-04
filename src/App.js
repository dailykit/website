import { gql, useQuery } from "@apollo/client";
import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";

import { GET_MENU, GET_STORE_DATA } from "./graphql";

import { Renderer, Loader } from "./components";
import { SettingsContext, MenuContext } from "./context";
import {
  Home,
  Profile,
  TrackOrder,
  Product,
  Orders,
  Checkout,
  Category,
  Cart,
} from "./pages";

import "./styles.css";

const App = () => {
  const { settings, settingsDispatch } = React.useContext(SettingsContext);
  const { menuDispatch } = React.useContext(MenuContext);

  const date = React.useMemo(() => new Date(Date.now()).toISOString(), []);

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
                { title: "Cart", link: `${window.location.origin}/cart` },
                { title: "Profile", link: `${window.location.origin}/profile` },
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

  console.log("Re-rendering...");

  useQuery(gql(GET_MENU), {
    skip: !settings?.brand?.id,
    variables: {
      params: {
        brandId: settings?.brand?.id,
        date: "03-02-2021",
      },
    },
    onCompleted: (data) => {
      if (data.onDemand_getMenuV2?.length) {
        const [res] = data.onDemand_getMenuV2;
        const { menu } = res.data;
        console.log(menu);
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

  return (
    <Router>
      {loading ? (
        <Loader />
      ) : (
        <>
          <Renderer filePath="components/navbar.liquid" />
          <div className="App">
            <Switch>
              <Route exact path="/">
                <Home />
              </Route>
              <Route exact path="/profile">
                <Profile />
              </Route>
              <Route exact path="/category">
                <Category />
              </Route>
              <Route exact path="/product">
                <Product />
              </Route>
              <Route exact path="/cart">
                <Cart />
              </Route>
              <Route exact path="/checkout">
                <Checkout />
              </Route>
              <Route exact path="/track-order">
                <TrackOrder />
              </Route>
              <Route exact path="/orders">
                <Orders />
              </Route>
              <Redirect to="/" />
            </Switch>
          </div>
          <Renderer filePath="components/footer.liquid" />
        </>
      )}
    </Router>
  );
};

export default App;
