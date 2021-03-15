import React from "react";
import { HamburgerButton } from "./styled";

export default function Hamburger({ open }) {
  return (
    <HamburgerButton onClick={open}>
      <div className="horz-line"></div>
      <div className="horz-line"></div>
      <div className="horz-line"></div>
    </HamburgerButton>
  );
}
