import { useMutation, gql } from "@apollo/client";
import React from "react";

import { AddAddress, Button, Icon, Modal } from "..";
import { AuthContext, CustomerContext } from "../../context";
import { MUTATION } from "../../graphql";
import { addressToString } from "../../utils";

import "./AddressList.scss";

const AddressList = ({ onCompleted }) => {
  const {
    customer: { customer = {}, cart = {} },
    refetchCustomer,
  } = React.useContext(CustomerContext);
  const { user } = React.useContext(AuthContext);

  const selectedAddress = React.useRef(null);

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
              address: selectedAddress.current,
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

  const [isAddAddressModalOpen, setIsAddAddressModalOpen] = React.useState(
    false
  );

  const handleClick = (address) => {
    selectedAddress.current = address;
    updateCustomer({
      variables: {
        keycloakId: user.id,
        _set: {
          defaultCustomerAddressId: address.id,
        },
      },
    });
  };

  return (
    <div className="AddressList">
      {customer.platform_customer.customerAddresses.map((address) => (
        <div
          key={address.id}
          role="button"
          tabIndex={0}
          onClick={() => handleClick(address)}
          className="AddressList__address"
        >
          {customer?.platform_customer?.defaultCustomerAddress?.id ===
            address.id && (
            <Icon
              name="circle-check"
              className="AddressList__address-default-icon"
            />
          )}
          <h5 className="AddressList__address-label">{address.label}</h5>
          <p className="AddressList__address-details">
            {addressToString(address)}
          </p>
          <p className="AddressList__address-notes">{address.notes}</p>
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
          <AddAddress onCompleted={() => setIsAddAddressModalOpen(false)} />
        </Modal>
      )}
    </div>
  );
};

export default AddressList;
