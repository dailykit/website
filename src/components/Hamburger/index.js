import React from "react";
import "./Hamburger.scss";

export default function Hamburger({ open }) {
  return (
    <div className="HamburgerButton" onClick={open}>
      <div className="HamburgerButton__horzline"></div>
      <div className="HamburgerButton__horzline"></div>
      <div className="HamburgerButton__horzline"></div>
    </div>
  );
}
