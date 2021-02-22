import React from "react";
import { useHistory } from "react-router-dom";
export default function LocationBlocker() {
  const history = useHistory();
  function applyBrowserLocationBlocker() {
    let currentLocation = null;
    history.block((location, action) => {
      const nextLocation = location.pathname + location.search;

      if (action === "PUSH") {
        if (currentLocation === nextLocation) {
          return false;
        }
      }

      currentLocation = nextLocation;
    });
  }
  React.useEffect(() => {
    applyBrowserLocationBlocker();
  }, []);
}
