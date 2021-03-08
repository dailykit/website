import React from "react";
import { Icon, Modal, CardList, Button } from "../../../components";
import { CustomerContext } from "../../../context";

import "./PaymentCardTile.scss";

const PaymentCardTile = () => {
  const {
    customer: { cart = {} },
  } = React.useContext(CustomerContext);

  const [isCardListModalOpen, setIsCardListModalOpen] = React.useState(false);

  const renderSelectedCard = () => {
    return "haha";
  };

  return (
    <div className="PaymentCardTile">
      {cart.paymentMethodId ? (
        <div className="PaymentCardTile__payment-details">
          <div className="PaymentCardTile__payment-card">
            {renderSelectedCard()}
          </div>
          <Icon name="icon" onClick={() => setIsCardListModalOpen(true)} />
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
          <CardList />
        </Modal>
      )}
    </div>
  );
};

export default PaymentCardTile;
