import { useEffect } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { toast } from "sonner";

function isPreviewOrDev(): boolean {
  if (!import.meta.env.PROD) return true;
  if (typeof window === "undefined") return true;
  try {
    if (window.self !== window.top) return true;
  } catch {
    return true;
  }
  const h = window.location.hostname;
  if (h.startsWith("id-preview--") || h.startsWith("preview--")) return true;
  if (h === "lovableproject.com" || h.endsWith(".lovableproject.com")) return true;
  if (h === "lovableproject-dev.com" || h.endsWith(".lovableproject-dev.com")) return true;
  if (h === "beta.lovable.dev" || h.endsWith(".beta.lovable.dev")) return true;
  if (new URLSearchParams(window.location.search).get("sw") === "off") return true;
  return false;
}

export const PWAUpdatePrompt = () => {
  const skip = isPreviewOrDev();

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    immediate: !skip,
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return;
      // Poll for updates every 60 minutes
      setInterval(() => {
        registration.update().catch(() => {});
      }, 60 * 60 * 1000);
    },
  });

  useEffect(() => {
    if (skip) {
      // Clean any stale registration in preview/dev
      if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
        navigator.serviceWorker.getRegistrations().then((regs) => {
          regs.forEach((r) => {
            if (r.active?.scriptURL.endsWith("/sw.js")) r.unregister();
          });
        }).catch(() => {});
      }
      return;
    }
    if (!needRefresh) return;

    toast("Nayi version available hai 🎉", {
      description: "Update karein latest features ke liye.",
      duration: Infinity,
      action: {
        label: "Update Now",
        onClick: () => {
          updateServiceWorker(true);
        },
      },
      onDismiss: () => setNeedRefresh(false),
    });
  }, [needRefresh, skip, setNeedRefresh, updateServiceWorker]);

  return null;
};
