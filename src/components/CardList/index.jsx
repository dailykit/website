import { gql, useMutation } from "@apollo/client";
import React from "react";
import { Button, Modal, AddCard, Icon } from "..";
import { AuthContext, CustomerContext } from "../../context";
import { MUTATION } from "../../graphql";

import "./CardList.scss";

const CardList = ({ onCompleted }) => {
  const {
    customer: { customer = {}, cart = {} },
    refetchCustomer,
  } = React.useContext(CustomerContext);
  const { user } = React.useContext(AuthContext);

  const selectedCard = React.useRef(null);

  const [isAddCardModalOpen, setIsAddCardModalOpen] = React.useState(false);

  const [updateCart] = useMutation(gql(MUTATION.CART.UPDATE), {
    onCompleted,
    onError: (error) => {
      console.log(error);
    },
  });
  const [updateCustomer] = useMutation(gql(MUTATION.CUSTOMER.UPDATE), {
    onCompleted: () => {
      refetchCustomer();
      if (cart.id) {
        updateCart({
          variables: {
            id: cart.id,
            _set: {
              paymentMethodId: selectedCard.current.stripePaymentMethodId,
            },
          },
        });
      } else {
        onCompleted();
      }
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const handleClick = (card) => {
    selectedCard.current = card;
    updateCustomer({
      variables: {
        keycloakId: user.id,
        _set: {
          defaultPaymentMethodId: card.stripePaymentMethodId,
        },
      },
    });
  };

  return (
    <div className="CardList">
      {customer.platform_customer.stripePaymentMethods.map((card) => (
        <div
          key={card.stripePaymentMethodId}
          onClick={() => handleClick(card)}
          className="CardList__card"
        >
          {customer.platform_customer.defaultPaymentMethodId ===
            card.stripePaymentMethodId && (
            <Icon name="circle-check" className="CardList__card-default-icon" />
          )}
          <h5 className="CardList__card-brand">{card.brand}</h5>
          <p className="CardList__card-number">XXXX XXXX XXXX {card.last4}</p>
          <p className="CardList__card-expiry">
            {card.expMonth}/{card.expYear}
          </p>
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
          <AddCard onCompleted={() => setIsAddCardModalOpen(false)} />
        </Modal>
      )}
    </div>
  );
};

export default CardList;
