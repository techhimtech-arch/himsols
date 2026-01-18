import { useEffect } from "react";
import { useLocation } from "react-router-dom";

declare global {
  interface Window {
    gtag: (command: string, ...args: unknown[]) => void;
  }
}

export const useAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    if (typeof window.gtag === "function") {
      window.gtag("config", "G-QCBSWVTQS4", {
        page_path: location.pathname + location.search,
      });
    }
  }, [location]);
};

export const trackEvent = (
  eventName: string,
  parameters?: Record<string, unknown>
) => {
  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, parameters);
  }
};
