import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" }); 
  }, [pathname]);

  return null; // this component doesn’t render anything visible
};

export default ScrollToTop;
