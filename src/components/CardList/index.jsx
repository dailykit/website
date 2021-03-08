import React from "react";
import { Button, Modal, AddCard } from "..";
import { CustomerContext } from "../../context";

import "./CardList.scss";

const CardList = () => {
  const {
    customer: { customer = {} },
  } = React.useContext(CustomerContext);

  const [isAddCardModalOpen, setIsAddCardModalOpen] = React.useState(false);

  const handleClick = (card) => {
    console.log(card);
  };

  return (
    <div className="CardList">
      {customer.platform_customer.stripePaymentMethods.map((card) => (
        <div
          key={card.stripePaymentMethodId}
          onClick={() => handleClick(card)}
          className="CardList__card"
        >
          {card.brand}
        </div>
      ))}
      <Button
        className="CardList__cta"
        onClick={() => setIsAddCardModalOpen(true)}
      >
        Add Card
      </Button>
      {isAddCardModalOpen && (
        <Modal close={() => setIsAddCardModalOpen(false)}>
          <AddCard />
        </Modal>
      )}
    </div>
  );
};

export default CardList;
