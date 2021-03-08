import React from "react";
import { gql, useQuery } from "@apollo/client";
import { Switch, Route } from "react-router-dom";

import { getStoreData } from "./api/store";
import { Loader, NavBar, Footer } from "./components";
import {
  SettingsContext,
  MenuContext,
  CustomerContext,
  AuthContext,
} from "./context";
import { GET_MENU, CUSTOMER } from "./graphql";
import useLocationBlocker from "./locationBlocker";
import { Checkout } from "./pages";
import { Main } from "./sections";

import "./styles.scss";

const App = () => {
  const { settings, settingsDispatch } = React.useContext(SettingsContext);
  const { user, isInitialized } = React.useContext(AuthContext);
  const { customer, customerDispatch } = React.useContext(CustomerContext);
  const { menuDispatch } = React.useContext(MenuContext);

  const date = React.useMemo(() => new Date(Date.now()).toISOString(), []);

  const [loading, setLoading] = React.useState(true);

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

  const { loading: customerLoading } = useQuery(gql(CUSTOMER), {
    skip: !(settings?.brand?.id && customer?.id && user?.id),
    variables: {
      brandId: settings?.brand?.id,
      keycloakId: user?.id,
    },
    onCompleted: ({ customer }) => {
      customerDispatch({
        type: "CUSTOMER",
        payload: customer,
      });
    },
    onError: (error) => {
      console.log(error);
    },
    fetchPolicy: "network-only",
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
