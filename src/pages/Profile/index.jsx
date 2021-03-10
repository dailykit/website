import React from "react";
import {
  AddAddress,
  AddCard,
  AddressList,
  Button,
  CardList,
  Icon,
  Modal,
  ProfileForm,
} from "../../components";
import { CustomerContext } from "../../context";
import { addressToString } from "../../utils";

import "./Profile.scss";

const Profile = () => {
  const {
    customer: { customer = {} },
  } = React.useContext(CustomerContext);

  const [isProfileFormModalOpen, setIsProfileFormModalOpen] = React.useState(
    false
  );
  const [isAddressListModalOpen, setIsAddressListModalOpen] = React.useState(
    false
  );
  const [isAddAddressModalOpen, setIsAddAddressModalOpen] = React.useState(
    false
  );
  const [isCardListModalOpen, setIsCardListModalOpen] = React.useState(false);
  const [isAddCardModalOpen, setIsAddCardModalOpen] = React.useState(false);

  return (
    <div className="Profile">
      <div className="Profile__banner">
        <h4 className="Profile__banner-hello">Hello</h4>
        {customer?.platform_customer?.firstName && (
          <h3 className="Profile__banner-name">
            {customer.platform_customer.firstName}{" "}
            {customer.platform_customer.lastName}
          </h3>
        )}
      </div>
      <div className="Profile__body">
        <div className="Profile__body-section">
          <div className="Profile__body-section-header">
            <h6 className="Profile__body-section-header-name">
              Personal Details
            </h6>
            <Icon name="edit" onClick={() => setIsProfileFormModalOpen(true)} />
            {isProfileFormModalOpen && (
              <Modal close={() => setIsProfileFormModalOpen(false)}>
                <ProfileForm
                  onCompleted={() => setIsProfileFormModalOpen(false)}
                />
              </Modal>
            )}
          </div>
          <div className="Profile__body-section-body">
            <div className="Profile__body-section-body-row">
              <Icon
                name="phone"
                className="Profile__body-section-body-row-icon"
              />
              {customer.platform_customer.phoneNumber || "-"}
            </div>
            <div className="Profile__body-section-body-row">
              <Icon
                name="email"
                className="Profile__body-section-body-row-icon"
              />
              {customer.platform_customer.email || "-"}
            </div>
          </div>
        </div>
        <div className="Profile__body-section">
          <div className="Profile__body-section-header">
            <h6 className="Profile__body-section-header-name">Addresses</h6>
            <Icon name="edit" onClick={() => setIsAddressListModalOpen(true)} />
            {isAddressListModalOpen && (
              <Modal close={() => setIsAddressListModalOpen(false)}>
                <AddressList
                  onCompleted={() => setIsAddressListModalOpen(false)}
                />
              </Modal>
            )}
          </div>
          <div className="Profile__body-section-body">
            {customer.platform_customer.defaultCustomerAddress ? (
              <>
                <small className="Profile__body-section-body-label">
                  Showing default
                </small>
                <div className="Profile__body-section-body-row">
                  <Icon
                    name="home"
                    className="Profile__body-section-body-row-icon"
                  />
                  {addressToString(
                    customer.platform_customer.defaultCustomerAddress
                  )}
                </div>
              </>
            ) : (
              <>
                <Button
                  className="Profile__button-tile"
                  onClick={() => setIsAddAddressModalOpen(true)}
                >
                  Add Address
                </Button>
                {isAddAddressModalOpen && (
                  <Modal close={() => setIsAddAddressModalOpen(false)}>
                    <AddAddress
                      onCompleted={() => setIsAddAddressModalOpen(false)}
                    />
                  </Modal>
                )}
              </>
            )}
          </div>
        </div>
        <div className="Profile__body-section">
          <div className="Profile__body-section-header">
            <h6 className="Profile__body-section-header-name">Payment Cards</h6>
            <Icon name="edit" onClick={() => setIsCardListModalOpen(true)} />
            {isCardListModalOpen && (
              <Modal close={() => setIsCardListModalOpen(false)}>
                <CardList onCompleted={() => setIsCardListModalOpen(false)} />
              </Modal>
            )}
          </div>
          <div className="Profile__body-section-body">
            {customer.platform_customer.defaultStripePaymentMethod ? (
              <>
                <small className="Profile__body-section-body-label">
                  Showing default
                </small>
                <div className="Profile__body-section-body-row">
                  <Icon
                    name="card"
                    className="Profile__body-section-body-row-icon"
                  />
                  XXXX XXXX XXXX{" "}
                  {customer.platform_customer.defaultStripePaymentMethod.last4}
                </div>
              </>
            ) : (
              <>
                <Button
                  className="Profile__button-tile"
                  onClick={() => setIsAddCardModalOpen(true)}
                >
                  Add Payment Card
                </Button>
                {isAddCardModalOpen && (
                  <Modal close={() => setIsAddCardModalOpen(false)}>
                    <AddCard onCompleted={() => setIsAddCardModalOpen(false)} />
                  </Modal>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Profile;
