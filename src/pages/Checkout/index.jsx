import React from "react";

import "./Checkout.scss";

const Checkout = () => {
  return (
    <div className="Checkout">
      <h3 className="Checkout__heading">Checkout</h3>
      <div className="Checkout__content">
        <div className="Checkout__content-left">Customer Details</div>
        <div className="Checkout__content-right">Cart</div>
      </div>
    </div>
  );
};

export default Checkout;
