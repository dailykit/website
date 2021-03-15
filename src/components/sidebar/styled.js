import styled, { css } from "styled-components";

export const StyledSidebar = styled.div`
  display: ${(props) => (props.show ? "block" : "none")};
  background: ${(props) => props.show && "rgba(0,0,0,0.6)"};
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 15;
`;

export const StyledNav = styled.nav`
  height: 100%;
  width: 70%;
  max-width: 400px;
  background: #fff;
  box-shadow: 2px 0 7px rgba(0, 0, 0, 0.5);
  position: absolute;
  transform: translateX(-100%);
  ${(props) =>
    props.show &&
    css`
      transform: translateX(0);
    `};
  transition: transform 0.4s ease-out;

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
