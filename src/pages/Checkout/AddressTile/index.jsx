import React from "react";
import { AddressList, Button, Icon, Modal } from "../../../components";
import { CustomerContext } from "../../../context";
import { addressToString } from "../../../utils";

import "./AddressTile.scss";

const AddressTile = () => {
  const {
    customer: { cart = {} },
  } = React.useContext(CustomerContext);

  const [isAddressListModalOpen, setIsAddressListModalOpen] = React.useState(
    false
  );

  return (
    <div className="AddressTile">
      {cart.address ? (
        <div className="AddressTile__address">
          <div className="AddressTile__address-details">
            {addressToString(cart.address)}
          </div>
          <Icon name="edit" onClick={() => setIsAddressListModalOpen(true)} />
        </div>
      ) : (
        <Button
          className="Checkout__button-tile"
          onClick={() => setIsAddressListModalOpen(true)}
        >
          Add Address
        </Button>
      )}
      {isAddressListModalOpen && (
        <Modal close={() => setIsAddressListModalOpen(false)}>
          <AddressList onCompleted={() => setIsAddressListModalOpen(false)} />
        </Modal>
      )}
    </div>
  );
};

export default AddressTile;
