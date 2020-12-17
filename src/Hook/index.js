import { useEffect } from "react";
export const useWeb = () => {
  const ImportScript = (resourceUrl) => {
    useEffect(() => {
      const script = document.createElement("script");
      script.src = resourceUrl;
      script.async = true;
      document.body.appendChild(script);
      return () => {
        document.body.removeChild(script);
      };
    }, [resourceUrl]);
  };

  return { ImportScript };
};
