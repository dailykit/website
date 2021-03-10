import React from "react";
import { gql, useMutation, useQuery } from "@apollo/client";
import {
  CardElement,
  Elements,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

import { createSetupIntent } from "../../api";
import { AuthContext, CustomerContext } from "../../context";
import { MUTATION, QUERY } from "../../graphql";
import { Button, Input, Loader } from "..";

import "./AddCard.scss";
import axios from "axios";
import { toast } from "react-toastify";

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: "#111",
      fontSize: "16px",
      "::placeholder": {
        color: "#aab7c4",
      },
    },
    invalid: {
      color: "#fa755a",
      iconColor: "#fa755a",
    },
  },
};

const AddCard = ({ onCompleted }) => {
  const [stripePromise, setStripePromise] = React.useState(undefined);

  const { loading } = useQuery(gql(QUERY.STRIPE_PK), {
    onCompleted: (data) => {
      console.log(data);
      if (data.organizations) {
        setStripePromise(
          loadStripe(data.organizations[0].stripePublishableKey)
        );
      }
    },
    onError: (error) => {
      console.log("Stripe key error: ", error);
    },
  });

  if (loading || !stripePromise) return <Loader />;
  return (
    <Elements stripe={stripePromise}>
      <CardForm onCompleted={onCompleted} />
    </Elements>
  );
};

export default AddCard;

const CardForm = ({ onCompleted }) => {
  const {
    customer: { customer = {} },
    refetchCustomer,
  } = React.useContext(CustomerContext);
  const { user } = React.useContext(AuthContext);

  const stripe = useStripe();
  const elements = useElements();

  const [intent, setIntent] = React.useState(null);
  const [status, setStatus] = React.useState("LOADING");
  const [error, setError] = React.useState("");
  const [name, setName] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [updateCustomer] = useMutation(gql(MUTATION.CUSTOMER.UPDATE), {
    onCompleted,
  });
  const [createPaymentMethod] = useMutation(
    gql(MUTATION.PLATFORM.PAYMENT_METHOD.CREATE),
    {
      onCompleted: refetchCustomer,
    }
  );

  React.useEffect(() => {
    console.log("customer", customer);
    console.log("customer?.stripeCustomerId", customer?.stripeCustomerId);
    if (customer?.platform_customer?.stripeCustomerId) {
      (async () => {
        try {
          const intent = await createSetupIntent(
            customer?.platform_customer?.stripeCustomerId
          );
          if (intent.id) {
            setIntent(intent);
            setStatus("SUCCESS");
          } else {
            setStatus("ERROR");
          }
        } catch (error) {
          setStatus("ERROR");
        }
      })();
    } else {
      console.log("No stripe customer ID!");
    }
  }, []);

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      setError("");
      setSaving(true);
      if (!stripe || !elements) {
        console.log("No stripe or elements");
        setError("Unknown error occured! Please try again later.");
        setSaving(false);
        return;
      }
      if (!name) {
        setError("All fields are required!");
        return;
      }
      if (!intent) {
        setError("Stripe Error: could not form intent!");
        return;
      }
      const result = await stripe.confirmCardSetup(intent.client_secret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name,
          },
        },
      });

      if (result.error) {
        console.log(result.error);

        setError(result.error.message);
      } else {
        const { setupIntent } = result;
        if (setupIntent.status === "succeeded") {
          const { data: { success, data = {} } = {} } = await axios.get(
            `${process.env.REACT_APP_PAYMENTS_API_URL}/api/payment-method/${setupIntent.payment_method}`
          );
          if (success) {
            const { data: response } = await createPaymentMethod({
              variables: {
                object: {
                  last4: data.card.last4,
                  brand: data.card.brand,
                  country: data.card.country,
                  funding: data.card.funding,
                  expYear: data.card.exp_year,
                  cvcCheck: data.card.cvc_check,
                  expMonth: data.card.exp_month,
                  stripePaymentMethodId: data.id,
                  keycloakId: user.id,
                  cardHolderName: data.billing_details.name,
                },
              },
            });
            if (response?.paymentMethod?.stripePaymentMethodId) {
              toast("Payment card added!");
              if (!customer.platform_customer.defaultPaymentMethodId) {
                await updateCustomer({
                  variables: {
                    keycloakId: user.id,
                    _set: {
                      defaultPaymentMethodId: data.id,
                    },
                  },
                });
              } else {
                onCompleted();
              }
            } else {
              throw Error("Failed to add card!");
            }
          } else {
            throw Error("Couldn't complete card setup, please try again");
          }
        } else {
          throw Error("Couldn't complete card setup, please try again");
        }
      }
    } catch (error) {
      console.log(error);
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="AddCard">
      <h3 className="AddCard__heading">Add a New Card</h3>
      {error && <small class="AddCard__error">{error}</small>}
      <form className="AddCard__form" onSubmit={handleSubmit}>
        <Input
          label="Card Holder Name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <CardElement
          options={CARD_ELEMENT_OPTIONS}
          onChange={({ error }) => setError(error?.message || "")}
        />
        <Button className="AddCard__cta" type="submit">
          Save
        </Button>
      </form>
    </div>
  );
};
