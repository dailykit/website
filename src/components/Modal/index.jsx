import clsx from "clsx";
import React from "react";
import { createPortal } from "react-dom";

import "./Modal.scss";

const Modal = ({ className, children, close, ...props }) => {
  return (
    <>
      {createPortal(
        <div className={clsx("Modal", className)} {...props}>
          <div className="Modal__content">
            <span className="Modal__close-icon" onClick={close}>
              &times;
            </span>
            {children}
          </div>
        </div>,
        document.getElementById("modal-root")
      )}
    </>
  );
};

export default Modal;
