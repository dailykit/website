import clsx from "clsx";
import React from "react";

import "./Input.scss";

const Input = ({ className, label, ...props }) => {
  return (
    <div className={clsx("Input", className)}>
      <label className="Input__label">{label}</label>
      <input className="Input__input" {...props} />
    </div>
  );
};

export default Input;
