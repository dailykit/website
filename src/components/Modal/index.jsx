import clsx from "clsx";
import React from "react";
import { createPortal } from "react-dom";

import "./Modal.scss";

const Modal = ({ className, children, close, ...props }) => {
  return (
    <>
      {createPortal(
        <div className={clsx("Modal", className)} {...props}>
          <span className="Modal__close-icon" onClick={close}>
            &times;
          </span>
          <div className="Modal__content">{children}</div>
        </div>,
        document.getElementById("modal-root")
      )}
    </>
  );
};

export default Modal;
