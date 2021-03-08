import React from "react";

import { SettingsContext } from "../../context";

import "./Footer.scss";

const Footer = () => {
  const { settings } = React.useContext(SettingsContext);

  return (
    <footer className="Footer">
      <div className="Footer__left">
        <h3 className="Footer__brand-name">{settings.brand?.name}</h3>
        <p className="Footer__help-text">
          Have trouble placing an order? Call{" "}
          <span className="Footer__brand-phone">
            {settings.brand?.contact?.phoneNo}
          </span>
        </p>
        <p className="Footer__brand-email">{settings.brand?.contact?.email}</p>
      </div>
      <div className="Footer__right">
        <h5>Powered by DailyKIT</h5>
      </div>
    </footer>
  );
};

export default Footer;
