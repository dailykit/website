import { gql, useMutation, useSubscription } from "@apollo/client";
import React from "react";
import { toast } from "react-toastify";

import { CustomerContext } from "../../../context";
import { Button, CouponList, Icon, Modal } from "../../../components";
import { MUTATION, SUBSCRIPTION } from "../../../graphql";

import "./Coupon.scss";

const Coupon = () => {
  const {
    customer: { cart = {}, customer = {} },
  } = React.useContext(CustomerContext);

  const [isCouponListModalOpen, setIsCouponListModalOpen] = React.useState(
    false
  );

  const [deleteCartRewards] = useMutation(gql(MUTATION.CART_REWARDS.DELETE), {
    variables: {
      cartId: cart?.id,
    },
    onError: (error) => console.log(error),
  });

  const { data, error } = useSubscription(
    gql(SUBSCRIPTION.CART_REWARDS.FETCH),
    {
      variables: {
        cartId: cart?.id,
        params: {
          cartId: cart?.id,
          keycloakId: customer?.keycloakId,
        },
      },
      onSubscriptionData: ({ subscriptionData: { data = {} } = {} }) => {
        if (data.cartRewards.length) {
          const isCouponValid = data.cartRewards.every(
            (record) => record.reward.condition.isValid
          );
          if (isCouponValid) {
            console.log("Coupon is valid!");
          } else {
            console.log("Coupon is not valid anymore!");
            toast("error", "Coupon is not valid!");
            deleteCartRewards();
          }
        }
      },
    }
  );

  const handleApplyCoupon = (coupon) => {
    console.log("Applying...", coupon.code);
    setIsCouponListModalOpen(false);
  };

  return (
    <div className="Coupon">
      {data?.cartRewards?.length ? (
        <div className="Coupon__coupon">
          <div className="Coupon__coupon-details">
            <h3 className="Coupon__coupon-code">
              {data.cartRewards[0].reward.coupon.code}
            </h3>
            <small>Coupon applied!</small>
          </div>
          <Icon
            className="Coupon__coupon-remove-icon"
            name="close"
            onClick={() => deleteCartRewards()}
          />
        </div>
      ) : (
        <Button
          className="Coupon__cta"
          onClick={() => setIsCouponListModalOpen(true)}
        >
          Apply Coupon
        </Button>
      )}
      {isCouponListModalOpen && (
        <Modal close={() => setIsCouponListModalOpen(false)}>
          <CouponList handleApplyCoupon={handleApplyCoupon} />
        </Modal>
      )}
    </div>
  );
};

export default Coupon;
