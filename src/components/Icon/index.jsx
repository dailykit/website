import React from "react";
import clsx from "clsx";

import "./Icon.scss";

const Icon = ({ name, className, ...props }) => {
  const renderIcon = () => {
    switch (name) {
      case "edit":
        return <i className="far fa-edit" />;
      case "circle-check":
        return <i class="far fa-check-circle" />;
      case "close":
        return <i class="far fa-times-circle"></i>;
      case "email":
        return <i class="fas fa-envelope" />;
      case "home":
        return <i class="fas fa-home" />;
      case "card":
        return <i class="fas fa-credit-card" />;
      case "phone":
        return <i class="fas fa-phone" />;
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
