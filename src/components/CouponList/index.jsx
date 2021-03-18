import { gql, useSubscription } from "@apollo/client";
import React from "react";
import { Button, Icon, Loader } from "..";
import { CustomerContext, SettingsContext } from "../../context";
import { SUBSCRIPTION } from "../../graphql";

import "./CouponList.scss";

const CouponList = ({ handleApplyCoupon }) => {
  const {
    customer: { cart = {}, customer = {} },
  } = React.useContext(CustomerContext);
  const { settings } = React.useContext(SettingsContext);

  const [availableCoupons, setAvailableCoupons] = React.useState([]);

  const { data, loading, error } = useSubscription(
    gql(SUBSCRIPTION.COUPONS.FETCH_TEMP),
    {
      // variables: {
      //   params: {
      //     cartId: cart?.id,
      //     keycloakId: customer?.keycloakId,
      //   },
      //   brandId: settings?.brand?.id,
      // },
      onSubscriptionData: (data) => {
        const coupons = data.subscriptionData.data.coupons;
        setAvailableCoupons(coupons);
        //   setAvailableCoupons([
        //     ...coupons.filter((coupon) => coupon.visibilityCondition?.isValid),
        //   ]);
      },
    }
  );

  if (loading) return <Loader />;
  return (
    <div className="CouponList">
      {availableCoupons.length ? (
        <>
          {availableCoupons.map((coupon) => (
            <Coupon
              coupon={coupon}
              key={coupon.id}
              handleApplyCoupon={() => handleApplyCoupon(coupon)}
            />
          ))}
        </>
      ) : (
        <small> No coupons available right now! </small>
      )}
    </div>
  );
};

export default CouponList;

const Coupon = ({ coupon, handleApplyCoupon }) => {
  const [showDescription, setShowDescription] = React.useState(false);

  return (
    <div className="CouponList__coupon">
      <div className="CouponList__coupon-header">
        <h3 className="CouponList__coupon-code">{coupon.code}</h3>
        <Button className="CouponList__coupon-cta" onClick={handleApplyCoupon}>
          Apply
        </Button>
      </div>
      <p className="CouponList__coupon-title">{coupon.metaDetails.title}</p>
      {showDescription && (
        <p className="CouponList__coupon-description">
          {coupon.metaDetails.description}
        </p>
      )}
      <Button
        className="CouponList__coupon-toggle"
        onClick={() => setShowDescription(!showDescription)}
      >
        <Icon
          name={showDescription ? "chevron-up" : "chevron-down"}
          className="CouponList__coupon-toggle-icon"
        />{" "}
        Show {showDescription ? "less" : "more"}
      </Button>
    </div>
  );
};
