import React from "react";
import { AddAddress, Button, Modal } from "..";
import { CustomerContext } from "../../context";

import "./AddressList.scss";

const AddressList = () => {
  const {
    customer: { customer = {} },
  } = React.useContext(CustomerContext);

  const [isAddAddressModalOpen, setIsAddAddressModalOpen] = React.useState(
    false
  );

  const handleClick = (address) => {
    console.log(address);
  };

  return (
    <div className="AddressList">
      {customer.platform_customer.customerAddresses.map((address) => (
        <div
          key={address.id}
          onClick={() => handleClick(address)}
          className="AddressList__address"
        >
          {address.line1}
        </div>
      ))}
      <Button
        className="AddressList__cta"
        onClick={() => setIsAddAddressModalOpen(true)}
      >
        Add Address
      </Button>
      {isAddAddressModalOpen && (
        <Modal close={() => setIsAddAddressModalOpen(false)}>
          <AddAddress />
        </Modal>
      )}
    </div>
  );
};

export default AddressList;
