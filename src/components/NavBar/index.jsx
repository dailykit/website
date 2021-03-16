import React from "react";
import { Link } from "react-router-dom";
import { Button, LoginForm, SignUpForm, Modal } from "..";
import { SettingsContext, AuthContext } from "../../context";
import HamburgerButton from "../Hamburger";

import "./NavBar.scss";

const NavBar = ({ open }) => {
  const { settings } = React.useContext(SettingsContext);
  const { isAuthenticated, logout } = React.useContext(AuthContext);

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
      <div className="NavBar__hamburger-wrapper">
        <HamburgerButton open={open} />
      </div>
      <Link className="NavBar__brand" to="/">
        <img
          alt="Logo"
          className="NavBar__brand-logo"
          src={settings.brand?.logo}
        />
        <h3 className="NavBar__brand-name">{settings.brand?.name}</h3>
      </Link>
      <ul className="NavBar__nav-list">
        <li className="NavBar__nav-list-item">
          <Link to="/search">
            <i class="fas fa-search"></i>
          </Link>
        </li>
        <li className="NavBar__nav-list-item">
          <Link to="/cart">Cart</Link>
        </li>
        {isAuthenticated && (
          <>
            <li className="NavBar__nav-list-item">
              <Link to="/profile">Profile</Link>
            </li>
            <li className="NavBar__nav-list-item">
              <Link to="/orders">Orders</Link>
            </li>
            <Button className="NavBar__nav-list-item" onClick={logout}>
              Logout
            </Button>
          </>
        )}
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
      <div className="NavBar__spacer" />
      <ul className="NavBar__nav-list-mv">
        <li className="NavBar__nav-list-item">
          <Link to="/search">
            <i class="fas fa-search"></i>
          </Link>
        </li>
        <li className="NavBar__nav-list-item">
          <Link to="/cart">
            <i class="fas fa-shopping-cart"></i>
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default NavBar;
