import React from "react";

import { AuthContext, CustomerContext } from "../../context";
import { Button } from "../../components";

import "./Checkout.scss";

const Checkout = () => {
  const { isAuthenticated } = React.useContext(AuthContext);
  const {
    customer: { cart = {} },
  } = React.useContext(CustomerContext);

  const renderLeft = () => {
    return (
      <div className="Checkout__content-left">
        <div className="Checkout__details-card">
          <h2 className="Checkout__details-card-heading">Account</h2>
          {isAuthenticated ? (
            <div className="Checkout__details-card-body">
              {cart?.customerInfo?.customerFirstName ? (
                <>
                  <h3 className="Checkout__details-card-body-customer-name">
                    {cart.customerInfo?.customerFirstName}
                  </h3>
                </>
              ) : (
                <Button className="Checkout__button-tile">
                  Add Basic Information
                </Button>
              )}
            </div>
          ) : (
            <div className="Checkout__details-card-body">
              <p className="Checkout__details-card-body-text">
                To place your order now, log in to your existing account or sign
                up.
              </p>
              <div className="Checkout__details-card-body-btn-wrapper">
                <Button className="Checkout__details-card-body-btn">
                  Login
                </Button>
                <Button className="Checkout__details-card-body-btn">
                  Sign Up
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderRight = () => {
    return <p>Cart</p>;
  };

  return (
    <div className="Checkout">
      <h3 className="Checkout__heading">Checkout</h3>
      <div className="Checkout__content">
        {renderLeft()}
        {renderRight()}
      </div>
    </div>
  );
};

export default Checkout;
