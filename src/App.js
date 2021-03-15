import React from "react";
import { gql, useQuery } from "@apollo/client";
import { Switch, Route, useLocation } from "react-router-dom";

import { getStoreData } from "./api/store";
import { Loader, NavBar, Footer, Sidebar } from "./components";
import {
  SettingsContext,
  MenuContext,
  CustomerContext,
  AuthContext,
} from "./context";
import { GET_MENU } from "./graphql";
import useLocationBlocker from "./locationBlocker";
import { Checkout, Profile } from "./pages";
import { Main } from "./sections";

import "./styles.scss";
import { NoFragmentCyclesRule } from "graphql";

const App = () => {
  const { pathname } = useLocation();
  const { settings, settingsDispatch } = React.useContext(SettingsContext);
  const { user, isInitialized } = React.useContext(AuthContext);
  const {
    customer: { customer = {} },
    customerDispatch,
  } = React.useContext(CustomerContext);
  const { menuDispatch } = React.useContext(MenuContext);

  const date = React.useMemo(() => new Date(Date.now()).toISOString(), []);

  const [loading, setLoading] = React.useState(true);
  const [sidebar, setSidebar] = React.useState(false);
  const toggleSidebar = () => {
    setSidebar((prev) => !prev);
  };
  const closeSidebar = () => {
    setSidebar(false);
  };

  React.useEffect(() => {
    setSidebar(false);
  }, [pathname]);

  // block pushing double history
  useLocationBlocker();

  React.useEffect(() => {
    (async () => {
      if (isInitialized) {
        try {
          const data = await getStoreData({
            clientId: process.env.REACT_APP_CLIENTID,
            domain: window.location.hostname,
            email: user.email,
            keycloakId: user.id,
          });
          if (data.success) {
            const { settings: fetchedSettings, brandId, customer } = data.data;
            settingsDispatch({
              type: "SEED",
              payload: {
                brand: {
                  id: brandId,
                  ...fetchedSettings.brand,
                },
                theme: fetchedSettings.visual,
                app: fetchedSettings.appSettings,
                availability: fetchedSettings.availability,
                rewards: fetchedSettings.rewardsSettings,
              },
            });
            customerDispatch({
              type: "CUSTOMER",
              payload: customer,
            });
          }
        } catch (err) {
          console.log(err);
        } finally {
          setLoading(false);
        }
      }
    })();
  }, [isInitialized]);

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

  if (loading) return <Loader />;
  return (
    <>
      <NavBar open={toggleSidebar} />
      <Sidebar open={sidebar} close={closeSidebar} />
      <div className="App">
        <Switch>
          <Route exact path="/checkout">
            <Checkout />
          </Route>
          <Route exact path="/profile">
            <Profile />
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
