import React from "react";
import { CustomerContext } from "../../../context";

import "./Coupon.scss";

const Coupon = () => {
  const {
    customer: { cart = {} },
  } = React.useContext(CustomerContext);

  return <div className="Coupon"></div>;
};

export default Coupon;
