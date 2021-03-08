import React from "react";
import { Link } from "react-router-dom";
import { Button, LoginForm, SignUpForm, Modal } from "..";
import { SettingsContext, AuthContext } from "../../context";

import "./NavBar.scss";

const NavBar = () => {
  const { settings } = React.useContext(SettingsContext);
  const { isAuthenticated } = React.useContext(AuthContext);

  const [isLoginModalOpen, setIsLoginModalOpen] = React.useState(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = React.useState(false);

  const toggleModal = (modal) => {
    switch (modal) {
      case "login":
        return setIsLoginModalOpen(!isLoginModalOpen);
      case "signup":
        return setIsSignUpModalOpen(!isSignUpModalOpen);
      default:
        return null;
    }
  };

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
            <Button
              className="NavBar__nav-list-item"
              onClick={() => toggleModal("login")}
            >
              Login
            </Button>
            {isLoginModalOpen && (
              <>
                <Modal close={() => toggleModal("login")}>
                  <LoginForm />
                </Modal>
              </>
            )}
            <Button
              className="NavBar__nav-list-item"
              onClick={() => toggleModal("signup")}
            >
              Sign Up
            </Button>
            {isSignUpModalOpen && (
              <>
                <Modal close={() => toggleModal("signup")}>
                  <SignUpForm />
                </Modal>
              </>
            )}
          </>
        )}
      </ul>
    </nav>
  );
};

export default NavBar;
