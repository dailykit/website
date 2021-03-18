import React from "react";
import { CustomerContext } from "../../../context";
import { Button, Icon, Input } from "../../../components";

import "./Tip.scss";
import { gql, useMutation } from "@apollo/client";
import { MUTATION } from "../../../graphql";
import { toast } from "react-toastify";

const Tip = () => {
  const {
    customer: { cart = {} },
  } = React.useContext(CustomerContext);

  const [isFormRendered, setIsFormRendered] = React.useState(false);
  const [tip, setTip] = React.useState(1);

  const [updateCart] = useMutation(gql(MUTATION.CART.UPDATE), {
    onCompleted: () => toast("Tip updated."),
    onError: (error) => console.log(error),
  });

  const handleAddTip = (amount) => {
    console.log(amount);
    updateCart({
      variables: {
        id: cart?.id,
        _set: {
          tip: amount,
        },
      },
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (tip) {
      handleAddTip(tip);
    }
  };

  const renderTipAmount = (percent) => {
    return cart?.itemTotal * (percent / 100);
  };

  if (isFormRendered) {
    return (
      <form className="Tip__form" onSubmit={handleSubmit}>
        <Input
          className="Tip__form-input"
          label="Tip"
          type="number"
          min={0}
          value={tip}
          onChange={(e) => setTip(+e.target.value)}
        />
        <Button type="submit">Add</Button>
        <Button
          type="reset"
          className="Tip__form-reset-btn"
          onClick={() => setIsFormRendered(false)}
        >
          Cancel
        </Button>
      </form>
    );
  }

  return (
    <div className="Tip">
      {cart?.tip ? (
        <div className="Tip__details">
          <p> Tip </p>
          <div className="Tip__details-price">
            <Icon
              className="Tip__details-price-remove-icon"
              name="close"
              onClick={() => handleAddTip(0)}
            />
            ${cart.tip.toFixed(2)}
          </div>
        </div>
      ) : (
        <div className="Tip__container">
          <p className="Tip__container-heading"> Add a Tip </p>
          <div className="Tip__suggestions">
            <button
              className="Tip__suggestion-btn"
              onClick={() => handleAddTip(renderTipAmount(15))}
            >
              <span className="Tip__suggestion-btn-top">15%</span>
              <span className="Tip__suggestion-btn-bottom">
                ${renderTipAmount(15).toFixed(2)}
              </span>
            </button>
            <button
              className="Tip__suggestion-btn"
              onClick={() => handleAddTip(renderTipAmount(20))}
            >
              <span className="Tip__suggestion-btn-top">20%</span>
              <span className="Tip__suggestion-btn-bottom">
                ${renderTipAmount(20).toFixed(2)}
              </span>
            </button>
            <button
              className="Tip__suggestion-btn"
              onClick={() => handleAddTip(renderTipAmount(25))}
            >
              <span className="Tip__suggestion-btn-top">25%</span>
              <span className="Tip__suggestion-btn-bottom">
                ${renderTipAmount(25).toFixed(2)}
              </span>
            </button>
            <button
              className="Tip__suggestion-btn"
              onClick={() => setIsFormRendered(true)}
            >
              <span className="Tip__suggestion-btn-top">OR</span>
              <span className="Tip__suggestion-btn-bottom">Add Custom</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tip;
