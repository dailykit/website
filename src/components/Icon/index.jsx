import React from "react";
import clsx from "clsx";

import "./Icon.scss";

const Icon = ({ name, className, ...props }) => {
  const renderIcon = () => {
    switch (name) {
      case "edit":
        return <i className="far fa-edit" />;
      case "chevron-down":
        return <i class="fas fa-chevron-down" />;
      case "chevron-up":
        return <i class="fas fa-chevron-up" />;
      case "circle-check":
        return <i className="far fa-check-circle" />;
      case "close":
        return <i class="far fa-times-circle" />;
      case "email":
        return <i className="fas fa-envelope" />;
      case "home":
        return <i className="fas fa-home" />;
      case "card":
        return <i className="fas fa-credit-card" />;
      case "phone":
        return <i className="fas fa-phone" />;
      case "hamburger":
        return <i className="fas fa-bars" />;
      default:
        return null;
    }
  };

  return (
    <span className={clsx("Icon", className)} role="button" {...props}>
      {renderIcon()}
    </span>
  );
};

export default Icon;
