import React from "react";
import { gql, useMutation } from "@apollo/client";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import GoogleMapReact from "google-map-react";

import { Button, Input, Loader } from "..";
import { AuthContext, CustomerContext, SettingsContext } from "../../context";
import { CUSTOMER, MUTATION } from "../../graphql";
import { useScript } from "../../utils";

import "./AddAddress.scss";

const AddAddress = ({ onCompleted }) => {
  const [loaded, error] = useScript(
    `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_MAPS_API_KEY}&libraries=places`
  );

  const { user } = React.useContext(AuthContext);
  const {
    customer: { customer = {} },
    refetchCustomer,
  } = React.useContext(CustomerContext);
  const {
    settings: { availability = {} },
  } = React.useContext(SettingsContext);

  const [updateCustomer] = useMutation(gql(MUTATION.CUSTOMER.UPDATE));
  const [createCustomerAddress] = useMutation(
    gql(MUTATION.PLATFORM.ADDRESS.CREATE),
    {
      onCompleted: () => {
        refetchCustomer();
        onCompleted();
      },
    }
  );

  const [mode, setMode] = React.useState("UNKNOWN");
  const [tracking, setTracking] = React.useState(false);
  const [isLocationDenied, setIsLocationDenied] = React.useState(false);
  const [populated, setPopulated] = React.useState(undefined);
  const [saving, setSaving] = React.useState(false);
  const [formError, setFormError] = React.useState("");

  const charLimit = 50;
  const handleChange = (text, field) => {
    if (text.length <= charLimit) {
      setPopulated({ ...populated, [field]: text });
    } else {
      const updatedText = text.slice(0, 50);
      setPopulated({ ...populated, [field]: updatedText });
    }
  };

  const setNewCoordinates = (pos) => {
    setFormError("");
    const newLat = pos.latLng.lat().toString();
    const newLng = pos.latLng.lng().toString();
    if (newLat && newLng) {
      setPopulated({
        ...populated,
        lat: newLat,
        lng: newLng,
      });
    } else {
      setFormError("Failed to set location!");
    }
  };

  const resolveAddress = (data) => {
    if (data.status === "OK" && data.results.length > 0) {
      const [result] = data.results;

      const address = {
        line2: "",
        lat: result.geometry.location.lat.toString(),
        lng: result.geometry.location.lng.toString(),
      };

      result.address_components.forEach((node) => {
        if (node.types.includes("street_number")) {
          address.line1 = `${node.long_name} `;
        }
        if (node.types.includes("route")) {
          address.line1 += node.long_name;
        }
        if (
          node.types.includes("locality") ||
          node.types.includes("sublocality")
        ) {
          address.city = node.long_name;
        }
        if (node.types.includes("administrative_area_level_1")) {
          address.state = node.long_name;
        }
        if (node.types.includes("country")) {
          address.country = node.long_name;
        }
        if (node.types.includes("postal_code")) {
          address.zipcode = node.long_name;
        }
      });

      if (!address.line1 || address.line1.includes("undefined")) {
        address.line1 = "";
      }

      setPopulated({ ...address, landmark: "", label: "", notes: "" });
    }
  };

  const formatAddress = async (address) => {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?key=${
        process.env.REACT_APP_MAPS_API_KEY
      }&address=${encodeURIComponent(address.value.description)}`
    );
    const data = await response.json();
    resolveAddress(data);
  };

  const validateFields = () => {
    if (
      populated &&
      populated.lat &&
      populated.lng &&
      populated.line1 &&
      populated.city &&
      populated.state &&
      populated.country &&
      populated.zipcode
    ) {
      return true;
    } else {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      setSaving(true);
      setFormError("");
      if (!validateFields()) {
        setFormError("Please fill in the required fields!");
        return;
      }
      const {
        data: { platform_createCustomerAddress: address = {} } = {},
      } = await createCustomerAddress({
        variables: {
          object: {
            ...populated,
            keycloakId: user.id,
          },
        },
      });
      if (address.id) {
        if (!customer?.platform_customer?.defaultCustomerAddress) {
          updateCustomer({
            variables: {
              keycloakId: user.id,
              _set: {
                defaultCustomerAddressId: address.id,
              },
            },
          });
        }
      } else {
        throw Error("An error occurred, please try again!");
      }
    } catch (err) {
      console.log(err);
      setFormError("An error occurred, please try again!");
    } finally {
      setSaving(false);
    }
  };

  const cannotFindLocation = () => {
    setMode("SELF");
    setTracking(false);
  };

  React.useEffect(() => {
    if (mode === "AUTOMATIC" && window.navigator) {
      setTracking(true);
      const timer = setTimeout(cannotFindLocation, 8000);
      window.navigator.geolocation.getCurrentPosition(
        async (data) => {
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?key=${
              process.env.REACT_APP_MAPS_API_KEY
            }&latlng=${data.coords.latitude.toString()},${data.coords.longitude.toString()}`
          );
          const res = await response.json();
          resolveAddress(res);
          setTracking(false);
        },
        (error) => {
          console.log(error);
          setIsLocationDenied(true);
          setTracking(false);
        }
      );
      return () => {
        if (timer) {
          clearTimeout(timer);
        }
      };
    }
  }, [mode]);

  if (!loaded || tracking) return <Loader />;

  if (mode === "UNKNOWN") {
    return (
      <div className="AddAddress">
        <p className="AddAddress__choice-text">
          How do you want to set your location?
        </p>
        <div className="AddAddress__choice-options-wrapper">
          <Button
            className="AddAddress__choice-option"
            onClick={() => setMode("AUTOMATIC")}
          >
            Automatic
          </Button>
          <Button
            className="AddAddress__choice-option"
            onClick={() => setMode("SELF")}
          >
            I'll add myself
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="AddAddress">
      <h3 className="AddAddress__heading">Add a new Address</h3>
      {error && <small className="AddAddress__error">{error}</small>}
      <form className="AddAddress__form" onSubmit={handleSubmit}>
        {loaded && !error && (
          <div className="AddAddress__google-autocomplete">
            <GooglePlacesAutocomplete
              apiKey={process.env.REACT_APP_MAPS_API_KEY}
              selectProps={{
                onChange: (data) => formatAddress(data),
                placeholder: "Search address on google...",
              }}
              debounce={300}
              //   autocompletionRequest={{
              //     componentRestrictions: {
              //       country: process.env.CURRENCY === "INR" ? "in" : "us",
              //     },
              //     types: "geocode",
              //   }}
            />
          </div>
        )}
        {Boolean(populated?.lat && populated?.lng) && (
          <div className="AddAddress__map-container">
            <div className="AddAddress__map">
              <GoogleMapReact
                bootstrapURLKeys={{ key: process.env.REACT_APP_MAPS_API_KEY }}
                defaultCenter={{
                  lat: +populated?.lat,
                  lng: +populated?.lng,
                }}
                defaultZoom={11}
              >
                {/* <AnyReactComponent
                lat={59.955413}
                lng={30.337844}
                text="My Marker"
              /> */}
              </GoogleMapReact>
            </div>
            <small>{`Lat: ${populated.lat} Lng:${populated.lng}`}</small>
          </div>
        )}
        <div className="AddAddress__field">
          <Input
            className="AddAddress__field-input"
            label="Address Line 1*"
            value={populated?.line1 || ""}
            onChange={(e) => handleChange(e.target.value, "line1")}
            placeholder="Enter House Number/Flat Number"
            required
          />
          {Boolean(populated?.line1) && (
            <small className="AddAddress__field-limit">{`${populated.line1.length}/${charLimit}`}</small>
          )}
        </div>
        <div className="AddAddress__field">
          <Input
            className="AddAddress__field-input"
            label="Address Line 2"
            value={populated?.line2 || ""}
            onChange={(e) => handleChange(e.target.value, "line2")}
            placeholder="Enter Apartment Building/Complex/Locality Name"
          />
          {Boolean(populated?.line2) && (
            <small className="AddAddress__field-limit">{`${populated.line2.length}/${charLimit}`}</small>
          )}
        </div>
        <div className="AddAddress__field">
          <Input
            className="AddAddress__field-input"
            label="Landmark"
            value={populated?.landmark || ""}
            onChange={(e) =>
              setPopulated({ ...populated, landmark: e.target.value })
            }
            placeholder="Enter Apartment Building/Complex/Locality Name"
          />
        </div>
        <div className="AddAddress__field-grid">
          <Input
            className="AddAddress__field-input"
            label="City*"
            value={populated?.city || ""}
            onChange={(e) =>
              setPopulated({ ...populated, city: e.target.value })
            }
            required
          />
          <Input
            className="AddAddress__field-input"
            label="State*"
            value={populated?.state || ""}
            onChange={(e) =>
              setPopulated({ ...populated, state: e.target.value })
            }
            required
          />
        </div>
        <div className="AddAddress__field-grid">
          <Input
            className="AddAddress__field-input"
            label="Country*"
            value={populated?.country || ""}
            onChange={(e) =>
              setPopulated({ ...populated, country: e.target.value })
            }
            required
          />
          <Input
            className="AddAddress__field-input"
            label="Zip Code*"
            value={populated?.zipcode || ""}
            onChange={(e) =>
              setPopulated({ ...populated, zipcode: e.target.value })
            }
            required
          />
        </div>
        <div className="AddAddress__field">
          <Input
            className="AddAddress__field-input"
            label="Save as (Label)"
            value={populated?.label || ""}
            onChange={(e) =>
              setPopulated({ ...populated, label: e.target.value })
            }
          />
        </div>
        <div className="AddAddress__field">
          <Input
            className="AddAddress__field-input"
            label="Drop off instructions"
            value={populated?.notes || ""}
            onChange={(e) =>
              setPopulated({ ...populated, notes: e.target.value })
            }
          />
        </div>
        <Button className="AddAddress__cta" type="submit">
          Save
        </Button>
      </form>
    </div>
  );
};

export default AddAddress;
