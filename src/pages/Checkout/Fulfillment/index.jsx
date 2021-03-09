import React from "react";
import { useMutation, useSubscription, gql } from "@apollo/client";
import clsx from "clsx";
import format from "date-fns/format";

import { SUBSCRIPTION, MUTATION } from "../../../graphql";
import {
  generateDeliverySlots,
  generateMiniSlots,
  generatePickUpSlots,
  generateTimeStamp,
  getDistance,
  isDeliveryAvailable,
  isPickUpAvailable,
} from "../../../utils";
import { CustomerContext, SettingsContext } from "../../../context";
import { Button, Icon } from "../../../components";

import "./Fulfillment.scss";
import AddressTile from "../AddressTile";

const Fulfillment = () => {
  const {
    settings: { brand = {}, availability = {} },
  } = React.useContext(SettingsContext);
  const {
    customer: { cart = {} },
  } = React.useContext(CustomerContext);

  const [isEditing, setIsEditing] = React.useState(false);
  const [distance, setDistance] = React.useState(null);
  const [type, setType] = React.useState("");
  const [time, setTime] = React.useState("");
  const [error, setError] = React.useState("");
  const [pickerDates, setPickerDates] = React.useState([]);
  const [pickerSlots, setPickerSlots] = React.useState([]);
  const [fulfillment, setFulfillment] = React.useState({});

  const storedDistance = React.useRef();

  // Mutation
  const [updateCart] = useMutation(gql(MUTATION.CART.UPDATE), {
    onCompleted: () => {
      setIsEditing(false);
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const {
    data: { preOrderPickup = [] } = {},
    loading: PPLoading,
  } = useSubscription(gql(SUBSCRIPTION.FULFILLMENT.PREORDER.PICKUP), {
    variables: {
      brandId: brand?.id,
    },
  });

  const {
    data: { onDemandPickup = [] } = {},
    loading: OPLoading,
  } = useSubscription(gql(SUBSCRIPTION.FULFILLMENT.ONDEMAND.PICKUP), {
    variables: {
      brandId: brand?.id,
    },
  });

  const {
    data: { preOrderDelivery = [] } = {},
    loading: PDLoading,
  } = useSubscription(gql(SUBSCRIPTION.FULFILLMENT.PREORDER.DELIVERY), {
    skip: distance === null,
    variables: {
      distance,
      brandId: brand?.id,
    },
  });

  const {
    data: { onDemandDelivery = [] } = {},
    loading: ODLoading,
  } = useSubscription(gql(SUBSCRIPTION.FULFILLMENT.ONDEMAND.DELIVERY), {
    skip: distance === null,
    variables: {
      distance,
      brandId: brand?.id,
    },
  });

  React.useEffect(() => {
    setTime("");
    setError("");
    (async () => {
      if (
        cart?.address?.lat &&
        cart?.address?.lng &&
        availability?.location?.lat &&
        availability?.location?.lng
      ) {
        const distance = await getDistance(
          +cart?.address?.lat,
          +cart?.address?.lng,
          +availability.location.lat,
          +availability.location.lng
        );
        console.log({ distance });
        storedDistance.current = distance;
        setDistance(distance.drivable || distance.aerial);
      }
    })();
  }, [cart?.address]);

  React.useEffect(() => {
    if (fulfillment.date && time === "PREORDER") {
      const index = pickerDates.findIndex(
        (data) => data.date === fulfillment.date
      );
      setPickerSlots([...pickerDates[index].slots]);
      setFulfillment({
        ...fulfillment,
        slot: pickerDates[index].slots[0],
      });
    }
  }, [fulfillment.date]);

  React.useEffect(() => {
    if (fulfillment.time && time === "PREORDER") {
      const index = pickerSlots.findIndex(
        (slot) => slot.time === fulfillment.time
      );
      setFulfillment({
        ...fulfillment,
        slot: pickerSlots[index],
      });
    }
  }, [fulfillment.time]);

  React.useEffect(() => {
    try {
      if (time && type) {
        setError("");
        switch (type) {
          case "PICKUP": {
            if (availability.pickup.isAvailable) {
              switch (time) {
                case "ONDEMAND": {
                  if (onDemandPickup[0]?.recurrences?.length) {
                    const result = isPickUpAvailable(
                      onDemandPickup[0].recurrences
                    );
                    if (result.status) {
                      const date = new Date();
                      setFulfillment({
                        date: date.toDateString(),
                        slot: {
                          time: date.getHours() + ":" + date.getMinutes(),
                        },
                      });
                    } else {
                      setError("Sorry! Option not available currently!");
                    }
                  } else {
                    setError("Sorry! Option not available currently.");
                  }
                  break;
                }
                case "PREORDER": {
                  if (preOrderPickup[0]?.recurrences?.length) {
                    const result = generatePickUpSlots(
                      preOrderPickup[0].recurrences
                    );
                    if (result.status) {
                      const miniSlots = generateMiniSlots(result.data, 15);
                      if (miniSlots.length) {
                        setPickerDates([...miniSlots]);
                        setFulfillment({
                          date: miniSlots[0].date,
                          slot: {
                            time: miniSlots[0].slots[0].time,
                          },
                        });
                      } else {
                        setError("Sorry! No time slots available.");
                      }
                    } else {
                      setError("Sorry! No time slots available.");
                    }
                  } else {
                    setError("Sorry! No time slots available.");
                  }
                  break;
                }
                default: {
                  return setError("Unknown error!");
                }
              }
            } else {
              setError("Sorry! Pickup not available currently.");
            }
            break;
          }
          case "DELIVERY": {
            if (!distance) {
              return setError("Please add an address first!");
            }
            if (availability.delivery.isAvailable) {
              switch (time) {
                case "ONDEMAND": {
                  if (onDemandDelivery[0]?.recurrences?.length) {
                    const result = isDeliveryAvailable(
                      onDemandDelivery[0].recurrences
                    );
                    if (result.status) {
                      const date = new Date();
                      setFulfillment({
                        distance,
                        date: date.toDateString(),
                        slot: {
                          time: date.getHours() + ":" + date.getMinutes(),
                          mileRangeId: result.mileRangeId,
                        },
                      });
                    } else {
                      setError(
                        result.message ||
                          "Sorry! Delivery not available at the moment."
                      );
                    }
                  } else {
                    setError("Sorry! Option not available currently.");
                  }
                  break;
                }
                case "PREORDER": {
                  if (preOrderDelivery[0]?.recurrences?.length) {
                    const result = generateDeliverySlots(
                      preOrderDelivery[0].recurrences
                    );
                    if (result.status) {
                      const miniSlots = generateMiniSlots(result.data, 15);
                      if (miniSlots.length) {
                        setPickerDates([...miniSlots]);
                        setFulfillment({
                          distance,
                          date: miniSlots[0].date,
                          slot: {
                            time: miniSlots[0].slots[0].time,
                            mileRangeId: miniSlots[0].slots[0]?.mileRangeId,
                          },
                        });
                      } else {
                        setError("Sorry! No time slots available.");
                      }
                    } else {
                      setError(
                        result.message ||
                          "Sorry! No time slots available for selected options."
                      );
                    }
                  } else {
                    setError("Sorry! No time slots available.");
                  }
                  break;
                }
                default: {
                  return setError("Unknown error!");
                }
              }
            } else {
              setError("Sorry! Delivery not available currently.");
            }
            break;
          }
          default: {
            return setError("Unknown error!");
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  }, [type, time, distance]);

  const handleSubmit = (e) => {
    try {
      e.preventDefault();
      if (error || !type || !time) {
        return console.log("Invalid selections!");
      }
      const fulfillmentInfo = {
        type: time + "_" + type,
        distance: storedDistance.current,
        slot: {
          mileRangeId: fulfillment.slot?.mileRangeId || null,
          ...generateTimeStamp(fulfillment.slot.time, fulfillment.date),
        },
      };
      updateCart({
        variables: {
          id: cart.id,
          _set: {
            fulfillmentInfo,
          },
        },
      });
    } catch (error) {
      console.log(error);
    }
  };

  const renderFulfillmentType = (type) => {
    switch (type) {
      case "ONDEMAND_DELIVERY":
        return "Deliver Now";
      case "ONDEMAND_PICKUP":
        return "Pickup Now";
      case "PREORDER_PICKUP":
        return "Pickup Later";
      case "PREORDER_DELIVERY":
        return "Deliver Later";
      default:
        "-";
    }
  };

  const renderFulfillmentAddress = (address) => {
    return `${address?.line1}, ${address?.line2}, ${address?.city}, ${address?.state}, ${address?.country}`;
  };

  return (
    <div className="Fulfillment">
      {cart.fulfillmentInfo && !isEditing ? (
        <div className="Fulfillment__details">
          <div className="Fulfillment__details-wrapper">
            <div className="Fulfillment__details-type">
              {renderFulfillmentType(cart.fulfillmentInfo.type)}
            </div>
            {cart.fulfillmentInfo?.type.includes("PREORDER") && (
              <p className="Fulfillment__details-time">
                {format(new Date(cart?.fulfillmentInfo?.slot?.from), "PPp")}
              </p>
            )}
            {cart.fulfillmentInfo?.type.includes("DELIVERY") && (
              <>
                {cart.address ? (
                  <p className="Fulfillment__details-address">
                    {renderFulfillmentAddress(cart.address)}
                  </p>
                ) : (
                  <small className="Fulfillment__error">
                    We could not resolve your address. Please select your
                    address again!
                  </small>
                )}
              </>
            )}
          </div>
          <Icon name="edit" onClick={() => setIsEditing(true)} />
        </div>
      ) : (
        <form className="Fulfillment__selection" onSubmit={handleSubmit}>
          <Icon
            name="close"
            className="Fulfillment__close"
            onClick={() => setIsEditing(false)}
          />
          <p className="Fulfillment__selection-text">
            Help us know your preference
          </p>
          {error && <small className="Fulfillment__error">{error}</small>}
          <div className="Fulfillment__selection-section">
            <h5 className="Fulfillment__selection-section-heading">
              Order for
            </h5>
            <div className="Fulfillment__selection-section-body Fulfillment__selection-section-options-wrapper">
              <Button
                className={clsx(
                  "Fulfillment__selection-section-option",
                  type === "DELIVERY" &&
                    "Fulfillment__selection-section-option--active"
                )}
                onClick={() => setType("DELIVERY")}
              >
                Delivery
              </Button>
              <Button
                className={clsx(
                  "Fulfillment__selection-section-option",
                  type === "PICKUP" &&
                    "Fulfillment__selection-section-option--active"
                )}
                onClick={() => setType("PICKUP")}
              >
                Pickup
              </Button>
            </div>
          </div>
          {type === "DELIVERY" && (
            <div className="Fulfillment__selection-section">
              <h5 className="Fulfillment__selection-section-heading">
                Address for delivery
              </h5>
              <div className="Fulfillment__selection-section-body">
                <AddressTile />
              </div>
            </div>
          )}
          <div className="Fulfillment__selection-section">
            <h5 className="Fulfillment__selection-section-heading">
              When would you like your order?
            </h5>
            <div className="Fulfillment__selection-section-options-wrapper">
              <Button
                className={clsx(
                  "Fulfillment__selection-section-option",
                  time === "ONDEMAND" &&
                    "Fulfillment__selection-section-option--active"
                )}
                onClick={() => setTime("ONDEMAND")}
              >
                Now
              </Button>
              <Button
                className={clsx(
                  "Fulfillment__selection-section-option",
                  time === "PREORDER" &&
                    "Fulfillment__selection-section-option--active"
                )}
                onClick={() => setTime("PREORDER")}
              >
                Later
              </Button>
            </div>
          </div>
          {time === "PREORDER" && (
            <div className="Fulfillment__selection-section">
              <h5 className="Fulfillment__selection-section-heading">
                Select a time slot
              </h5>
              <div className="Fulfillment__selection-section-dropdown-wrapper">
                <select
                  value={fulfillment.date}
                  onChange={(e) => setFulfillment({ data: e.target.value })}
                  className="Fulfillment__selection-section-dropdown"
                >
                  {pickerDates.map((data, index) => (
                    <option key={index} value={data.date}>
                      {data.date}
                    </option>
                  ))}
                </select>
                <select
                  value={fulfillment.time}
                  onChange={(e) =>
                    setFulfillment({ ...fulfillment, time: e.target.value })
                  }
                  className="Fulfillment__selection-section-dropdown"
                >
                  {pickerSlots.map((data, index) => (
                    <option key={index} value={data.time}>
                      {data.time}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
          <Button className="Fulfillment__cta" type="submit">
            Confirm
          </Button>
        </form>
      )}
    </div>
  );
};

export default Fulfillment;

/*
Case : PREORDER PICKUP (all the logics are in similiar fashion)
assume current time to be 15:00 (3pm) and date to be 11 June

1. get all recurences using subscriptions, so everytime they change any option, they see latest values
2. check if master pickup is on/off, if off then show message
3. check if I got any recurrences or not, if 0 then show message
4. pass recurrences to -> generatePickUpSlots(recurrences)
   - loop over each recurrence
   a- so let's say our first recurrence is 'DAILY'
   --- get all dates that satify this recurrence within next 7 days.
   --- loop over all the dates
   b--- so let's say first date is 11 June (today)
   ---- now in step 4a we have time slots, loop over all the time slots
   c----- let's say first time slot is: 14:00 - 18:00      (2pm - 6pm) 
   ------ check if current time + lead time < timeslot end time(to), if no then skip
   ------ if yes then check, if current time + lead time > timeslot start time(from)
   ------ if no -> then 14:00 - 18:00 is a perfect slot for this date(4b)
   ------ if yes -> then new timeslot start time will be = current time + lead time, i.e. 15:00 - 18:00
   ------ at the end of each step(4c), push data into an array according to dates, so all the time slots for same day will fall under one date
5. now we have data grouped according to our need, pass this data into -> generateMiniSlots(data, 15) [second params is size in minutes]
  - it will again loop over all the dates, slice all the time slots
  - make another array with dates and each date will have these 15 mins timestamps.
*/
