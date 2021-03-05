import React from "react";
import { Link } from "react-router-dom";
import { SettingsContext } from "../../context";

import "./NavBar.scss";

const NavBar = () => {
  const { settings } = React.useContext(SettingsContext);

  const navLinks = [
    {
      title: "Profile",
      pathname: "/profile",
    },
    {
      title: "Orders",
      pathname: "/orders",
    },
    {
      title: "Cart",
      pathname: "/cart",
    },
  ];

  const renderNavLinks = () =>
    navLinks.map((navLink) => (
      <li className="NavBar__nav-list-item">
        <Link to={navLink.pathname}>{navLink.title}</Link>
      </li>
    ));

  return (
    <nav className="NavBar">
      <Link className="NavBar__brand" to="/">
        <img
          alt="Logo"
          className="NavBar__brand-logo"
          src={settings.brand?.logo}
        />
        <h3 className="NavBar__brand-name">{settings.brand?.name}</h3>
      </Link>
      <ul className="NavBar__nav-list">{renderNavLinks()}</ul>
    </nav>
  );
};

export default NavBar;
