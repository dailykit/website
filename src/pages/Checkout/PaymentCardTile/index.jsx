import React from "react";
import { Icon, Modal, CardList, Button } from "../../../components";
import { CustomerContext } from "../../../context";

import "./PaymentCardTile.scss";

const PaymentCardTile = () => {
  const {
    customer: { cart = {}, customer = {} },
  } = React.useContext(CustomerContext);

  const [isCardListModalOpen, setIsCardListModalOpen] = React.useState(false);

  const renderSelectedCard = () => {
    const found = customer?.platform_customer?.stripePaymentMethods?.find(
      (card) => card.stripePaymentMethodId === cart?.paymentMethodId
    );
    if (found) {
      return `XXXX XXXX XXXX ${found.last4}`;
    }
    return "-";
  };

  return (
    <div className="PaymentCardTile">
      {cart.paymentMethodId ? (
        <div className="PaymentCardTile__payment-details">
          <div className="PaymentCardTile__payment-card">
            {renderSelectedCard()}
          </div>
          <Icon name="edit" onClick={() => setIsCardListModalOpen(true)} />
        </div>
      ) : (
        <Button
          className="Checkout__button-tile"
          onClick={() => setIsCardListModalOpen(true)}
        >
          Add Payment Card
        </Button>
      )}
      {isCardListModalOpen && (
        <Modal close={() => setIsCardListModalOpen(false)}>
          <CardList onCompleted={() => setIsCardListModalOpen(false)} />
        </Modal>
      )}
    </div>
  );
};

export default PaymentCardTile;
