import React from "react";
import clsx from "clsx";

import { formatPrice } from "../../utils";

import "./CartItems.scss";

const CartItems = ({ className, items }) => {
  return (
    <div className={clsx("CartItems", className)}>
      {items.map((item) => (
        <div className="CartItems__item" key={item.id}>
          <img
            alt={item.displayName}
            className="CartItems__item-image"
            src={item.displayImage}
          />
          <h4 className="CartItems__item-name"> {item.displayName} </h4>
          <p className="CartItems__item-quantity"> {item.ids.length} </p>
          <p className="CartItems__item-price">
            {formatPrice(item.ids.length * item.unitPrice)}
          </p>
        </div>
      ))}
    </div>
  );
};

export default CartItems;
