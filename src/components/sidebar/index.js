import React from "react";
import { Link } from "react-router-dom";
import { LoginForm, SignUpForm, Modal } from "..";
import { SettingsContext, AuthContext } from "../../context";
import { StyledNav, StyledSidebar } from "./styled";

export default function Sidebar({ open, close }) {
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

  const authHandler = (type) => {
    close();
    if (type === "login") {
      toggleModal("login");
    } else {
      toggleModal("signup");
    }
  };

  return (
    <StyledSidebar show={open}>
      <StyledNav show={open}>
        <span className="close-sidebar" onClick={close}>
          <i className="fas fa-times close-icon" />
        </span>
        <div className="brand-logo-wrapper">
          <img alt="Logo" src={settings.brand?.logo} />
        </div>
        <ul className="nav-list">
          <li className="nav-list-item">
            <Link to="/">
              <i class="fas fa-home"></i>Home
            </Link>
          </li>
          <li className="nav-list-item">
            <Link to="/cart">
              <i class="fas fa-shopping-cart"></i>Cart
            </Link>
          </li>
          {isAuthenticated && (
            <>
              <li className="nav-list-item">
                <Link to="/profile">
                  <i class="fas fa-user-circle"></i>Profile
                </Link>
              </li>
              <li className="nav-list-item">
                <Link to="/orders">
                  <i class="fas fa-box-open"></i>Orders
                </Link>
              </li>
              <li className="nav-list-item" onClick={logout}>
                <i class="fas fa-sign-out-alt"></i>
                Logout
              </li>
            </>
          )}
          {!isAuthenticated && (
            <>
              <li
                className="nav-list-item"
                onClick={() => authHandler("login")}
              >
                <i class="fas fa-sign-in-alt"></i>
                Login
              </li>
              {isLoginModalOpen && (
                <>
                  <Modal close={() => authHandler("login")}>
                    <LoginForm />
                  </Modal>
                </>
              )}
              <li
                className="nav-list-item"
                onClick={() => authHandler("signup")}
              >
                <i class="fas fa-user-plus"></i>
                Sign Up
              </li>
              {isSignUpModalOpen && (
                <>
                  <Modal close={() => authHandler("signup")}>
                    <SignUpForm />
                  </Modal>
                </>
              )}
            </>
          )}
        </ul>
      </StyledNav>
    </StyledSidebar>
  );
}
