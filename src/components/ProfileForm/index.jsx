import { gql, useMutation } from "@apollo/client";
import React from "react";
import { Button, Input } from "..";
import { AuthContext, CustomerContext } from "../../context";
import { MUTATION } from "../../graphql";

import "./ProfileForm.scss";

const ProfileForm = ({ onCompleted }) => {
  const { user } = React.useContext(AuthContext);
  const {
    customer: { cart = {}, customer = {} },
    refetchCustomer,
  } = React.useContext(CustomerContext);

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [firstname, setFirstname] = React.useState(
    customer?.platform_customer?.firstName || ""
  );
  const [lastname, setLastname] = React.useState(
    customer?.platform_customer?.lastName || ""
  );
  const [email, setEmail] = React.useState(user.email);
  const [phone, setPhone] = React.useState(
    customer?.platform_customer?.phoneNumber || ""
  );

  const [updateCart] = useMutation(gql(MUTATION.CART.UPDATE), {
    onCompleted: () => {
      console.log("Cart updated!");
      onCompleted();
    },
    onError: (error) => {
      setError(error.message);
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
              customerInfo: {
                customerFirstName: firstname,
                customerLastName: lastname,
                customerEmail: email,
                customerPhoneNo: phone,
                customerKeycloakId: user.id,
              },
            },
          },
        });
      } else {
        onCompleted();
      }
    },
    onError: (error) => {
      setError(error.message);
      console.log(error);
    },
  });

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      setLoading(true);
      updateCustomer({
        variables: {
          keycloakId: user.id,
          _set: {
            firstName: firstname,
            lastName: lastname,
            phoneNumber: phone,
          },
        },
      });
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ProfileForm">
      <h3 className="ProfileForm__heading"> Basic Information </h3>
      <form className="ProfileForm__form" onSubmit={handleSubmit}>
        <Input
          label="First Name"
          required
          value={firstname}
          onChange={(e) => setFirstname(e.target.value)}
          type="text"
        />
        <Input
          label="Last Name"
          required
          value={lastname}
          onChange={(e) => setLastname(e.target.value)}
          type="text"
        />
        <Input
          label="Email"
          disabled
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="text"
        />
        <Input
          label="Phone"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          type="text"
        />
        <Button className="ProfileForm__button" type="submit">
          Save
        </Button>
      </form>
      {error && <small className="ProfileForm__error">{error}</small>}
    </div>
  );
};

export default ProfileForm;
