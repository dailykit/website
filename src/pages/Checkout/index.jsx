import React from "react";
import clsx from "clsx";

import { AuthContext, CustomerContext, SettingsContext } from "../../context";
import { Button, CartItems, Icon, Modal, ProfileForm } from "../../components";

import Fulfillment from "./Fulfillment";
import PaymentCardTile from "./PaymentCardTile";
import "./Checkout.scss";
import Coupon from "./Coupon";
import Tip from "./Tip";

const Checkout = () => {
  const { isAuthenticated } = React.useContext(AuthContext);
  const { settings } = React.useContext(SettingsContext);
  const {
    customer: { cart = {} },
  } = React.useContext(CustomerContext);

  const [isProfileModalOpen, setIsProfileModalOpen] = React.useState(false);

  const renderLeft = () => {
    return (
      <div className="Checkout__content-left">
        <div className="Checkout__details-card">
          <h2 className="Checkout__details-card-heading">Account</h2>
          {isAuthenticated ? (
            <div className="Checkout__details-card-body">
              {cart?.customerInfo?.customerFirstName ? (
                <div className="Checkout__details-card-body-customer">
                  <div className="Checkout__details-card-body-customer-details">
                    <h3 className="Checkout__details-card-body-customer-name">
                      {`${cart.customerInfo?.customerFirstName} ${cart.customerInfo?.customerLastName}`}
                    </h3>
                    <p className="Checkout__details-card-body-customer-email">
                      {cart.customerInfo?.customerEmail}
                    </p>
                    <p className="Checkout__details-card-body-customer-phone">
                      {cart.customerInfo?.customerPhoneNo}
                    </p>
                  </div>
                  <Icon
                    name="edit"
                    onClick={() => setIsProfileModalOpen(true)}
                  />
                </div>
              ) : (
                <Button
                  className="Checkout__button-tile"
                  onClick={() => setIsProfileModalOpen(true)}
                >
                  Add Basic Information
                </Button>
              )}
              {isProfileModalOpen && (
                <Modal close={() => setIsProfileModalOpen(false)}>
                  <ProfileForm
                    onCompleted={() => setIsProfileModalOpen(false)}
                  />
                </Modal>
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
        <div className="Checkout__details-card">
          <h2
            className={clsx(
              "Checkout__details-card-heading",
              !isAuthenticated && "Checkout__details-card-heading--disabled"
            )}
          >
            Fulfillment
          </h2>
          {isAuthenticated && (
            <div className="Checkout__details-card-body">
              <Fulfillment />
            </div>
          )}
        </div>
        <div className="Checkout__details-card">
          <h2
            className={clsx(
              "Checkout__details-card-heading",
              !isAuthenticated && "Checkout__details-card-heading--disabled"
            )}
          >
            Payment
          </h2>
          {isAuthenticated && cart?.fulfillmentInfo && (
            <div className="Checkout__details-card-body">
              {process.env.REACT_APP_CURRENCY === "INR" ? (
                <div id="payment" />
              ) : (
                <>
                  <PaymentCardTile />
                  <Button className="Checkout__cta">Pay Now</Button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderTotalItems = () => {
    const count = cart?.combinedCartItems.reduce(
      (acc, item) => acc + item.ids.length,
      0
    );

    return count > 1 ? `${count} items` : `${count} item`;
  };

  const renderRight = () => {
    return (
      <div className="Checkout__cart">
        <div className="Checkout__cart-header">
          <p>Total</p>
          <p>{renderTotalItems()}</p>
        </div>
        <div className="Checkout__cart-top">
          <CartItems items={cart?.combinedCartItems || []} />
        </div>
        <div className="Checkout__cart-bottom">
          {settings?.rewards?.isCouponsAvailable && (
            <div className="Checkout__cart-coupon">
              {isAuthenticated ? (
                <Coupon />
              ) : (
                <small className="Checkout__cart-coupon-message">
                  Discount coupons are only available when logged in!
                </small>
              )}
            </div>
          )}
          <p className="Checkout__cart-heading--small">Bill Details</p>
          <div className="Checkout__cart-bill-section">
            <p className="Checkout__cart-bill-type">Item Total</p>
            <p className="Checkout__cart-bill-value">${cart?.itemTotal}</p>
          </div>
          <div className="Checkout__cart-bill-section">
            <p className="Checkout__cart-bill-type">Delivery Fee</p>
            <p className="Checkout__cart-bill-value">${cart?.deliveryPrice}</p>
          </div>
          {!!cart?.discount && (
            <div className="Checkout__cart-bill-section">
              <p className="Checkout__cart-bill-type">Discount</p>
              <p className="Checkout__cart-bill-value">- ${cart?.discount}</p>
            </div>
          )}
          <hr className="Checkout__cart-divider" />
          <div className="Checkout__cart-bill-section">
            <p className="Checkout__cart-bill-type">Taxes and Charges</p>
            <p className="Checkout__cart-bill-value">${cart?.tax}</p>
          </div>
          <div className="Checkout__cart-tip">
            <Tip />
          </div>
        </div>
        <div className="Checkout__cart-footer">
          <p>To Pay</p>
          <p>${cart?.totalPrice}</p>
        </div>
      </div>
    );
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
