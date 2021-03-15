import styled, { css } from "styled-components";

export const StyledSidebar = styled.div``;

export const StyledNav = styled.nav`
  display: block;
  height: 100%;
  width: 70%;
  max-width: 400px;
  background: #fff;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100;
  transform: ${(props) =>
    props.show ? "translate3d(0px, 0px, 0px)" : "translate3d(-100%, 0px, 0px)"};
  transition: all 0.5s ease 0s;
  visibility: visible;
  .brand-logo-wrapper {
    border-radius: 40px;
    height: 80px;
    width: 80px;
    margin: 20px auto;
  }
  .brand-logo-wrapper img {
    width: 100%;
    height: 100%;
    border-radius: 40px;
  }
  a {
    text-decoration: none;
    color: #111;
  }
  ul {
    list-style: none;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 16px;
    margin: 0;
  }
  .nav-list-item {
    margin: 20px;
    color: #111;
    font-size: 18px;
    text-decoration: none;
    i {
      margin-right: 1rem;
    }
  }
  .nav-list-item:hover {
    text-decoration: underline;
  }

  .close-sidebar {
    position: absolute;
    text-align: center;
    top: 12px;
    right: 12px;
    cursor: pointer;
    .close-icon {
      color: #1d3557;
      font-size: 1.5rem;
    }
    &:hover {
      .close-icon {
        color: #e63946;
      }
    }
  }
`;
