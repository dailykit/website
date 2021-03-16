import clsx from "clsx";
import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { LoginForm, SignUpForm, Modal } from "..";
import { SettingsContext, AuthContext } from "../../context";
import "./Sidebar.scss";

export default function Sidebar({ open, close }) {
  const wrapperRef = useRef(null);
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

  useEffect(() => {
    /**
     * Alert if clicked on outside of element
     */
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        close();
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  // close sidebar when clicked outside

  // document.onclick = (e) => {
  //   close();
  // };

  return (
    <div
      className={clsx("StyledNav", open ? "SlidesFromleft" : "SlidesToleft")}
      ref={wrapperRef}
    >
      <span className="StyledNav__close-sidebar" onClick={close}>
        <i className="fas fa-times StyledNav__close-sidebar__close-icon" />
      </span>
      <div className="StyledNav__brand-logo-wrapper">
        <img alt="Logo" src={settings.brand?.logo} />
      </div>
      <ul className="StyledNav__nav-list">
        <li className="StyledNav__nav-list__nav-list-item">
          <Link to="/">
            <i class="fas fa-home"></i>Home
          </Link>
        </li>
        <li className="StyledNav__nav-list__nav-list-item">
          <Link to="/cart">
            <i class="fas fa-shopping-cart"></i>Cart
          </Link>
        </li>
        {isAuthenticated && (
          <>
            <li className="StyledNav__nav-list__nav-list-item">
              <Link to="/profile">
                <i class="fas fa-user-circle"></i>Profile
              </Link>
            </li>
            <li className="StyledNav__nav-list__nav-list-item">
              <Link to="/orders">
                <i class="fas fa-box-open"></i>Orders
              </Link>
            </li>
            <li className="StyledNav__nav-list__nav-list-item" onClick={logout}>
              <i class="fas fa-sign-out-alt"></i>
              Logout
            </li>
          </>
        )}
        {!isAuthenticated && (
          <>
            <li
              className="StyledNav__nav-list__nav-list-item"
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
              className="StyledNav__nav-list__nav-list-item"
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
    </div>
  );
}
