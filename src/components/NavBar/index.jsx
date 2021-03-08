import React from "react";
import { Link } from "react-router-dom";
import { Button } from "..";
import { SettingsContext, AuthContext } from "../../context";

import "./NavBar.scss";

const NavBar = () => {
  const { settings } = React.useContext(SettingsContext);
  const { isAuthenticated } = React.useContext(AuthContext);

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
      <ul className="NavBar__nav-list">
        {isAuthenticated && (
          <>
            <li className="NavBar__nav-list-item">
              <Link to="/cart">Profile</Link>
            </li>
            <li className="NavBar__nav-list-item">
              <Link to="/cart">Orders</Link>
            </li>
          </>
        )}
        <li className="NavBar__nav-list-item">
          <Link to="/cart">Cart</Link>
        </li>
        {!isAuthenticated && (
          <>
            <Button className="NavBar__nav-list-item">Login</Button>
            <Button className="NavBar__nav-list-item">Sign Up</Button>
          </>
        )}
      </ul>
    </nav>
  );
};

export default NavBar;
