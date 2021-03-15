import styled from "styled-components";

export const HamburgerButton = styled.button`
  width: 30px;
  height: 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  box-sizing: border-box;
  &:focus {
    outline: none;
  }

  .horz-line {
    background: #1d3557;
    width: 100%;
    height: 2px;
  }
`;
