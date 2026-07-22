import { supabase } from "@/integrations/supabase/client";

type Severity = "error" | "warning" | "info";

const recent = new Map<string, number>();
const DEDUPE_MS = 10_000;

async function logError(payload: {
  message: string;
  stack?: string;
  source?: string;
  severity?: Severity;
  metadata?: Record<string, any>;
}) {
  try {
    const message = (payload.message || "Unknown error").slice(0, 2000);
    const key = message + "|" + (payload.source || "");
    const now = Date.now();
    const last = recent.get(key);
    if (last && now - last < DEDUPE_MS) return;
    recent.set(key, now);

    const { data: userData } = await supabase.auth.getUser();

    await supabase.from("client_error_logs").insert({
      user_id: userData?.user?.id ?? null,
      message,
      stack: payload.stack?.slice(0, 5000) ?? null,
      source: payload.source ?? null,
      url: typeof window !== "undefined" ? window.location.href : null,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
      severity: payload.severity ?? "error",
      metadata: payload.metadata ?? null,
    });
  } catch {
    // never let logger break the app
  }
}

function shortenUrl(u: string) {
  try {
    const url = new URL(u);
    return url.pathname + url.search.slice(0, 100);
  } catch {
    return u.slice(0, 200);
  }
}

let installed = false;
export function installErrorLogger() {
  if (installed || typeof window === "undefined") return;
  installed = true;

  window.addEventListener("error", (e) => {
    logError({
      message: e.message || String(e.error),
      stack: e.error?.stack,
      source: e.filename ? `${e.filename}:${e.lineno}:${e.colno}` : "window.onerror",
    });
  });

  window.addEventListener("unhandledrejection", (e) => {
    const reason: any = e.reason;
    logError({
      message: reason?.message || String(reason),
      stack: reason?.stack,
      source: "unhandledrejection",
    });
  });

  // Intercept fetch to catch API errors (Supabase REST/functions, RLS violations, etc.)
  const origFetch = window.fetch.bind(window);
  window.fetch = async (input: any, init?: any) => {
    const url = typeof input === "string" ? input : (input?.url || "");
    try {
      const res = await origFetch(input, init);
      if (!res.ok && res.status >= 400 && !url.includes("client_error_logs")) {
        const isAppApi = url.includes("supabase.co") || url.includes("/rest/v1") || url.includes("/functions/v1") || url.includes("/auth/v1");
        if (isAppApi) {
          let bodyText = "";
          try { bodyText = await res.clone().text(); } catch {}
          const method = (init?.method || "GET").toUpperCase();
          logError({
            message: `API ${res.status} ${method} ${shortenUrl(url)}: ${bodyText.slice(0, 500)}`,
            source: "fetch",
            severity: res.status >= 500 ? "error" : "warning",
            metadata: { status: res.status, method, url: shortenUrl(url) },
          });
        }
      }
      return res;
    } catch (err: any) {
      if (!url.includes("client_error_logs")) {
        logError({
          message: `Network error ${shortenUrl(url)}: ${err?.message || String(err)}`,
          stack: err?.stack,
          source: "fetch",
        });
      }
      throw err;
    }
  };
}

export function reportError(err: unknown, meta?: Record<string, any>) {
  const e = err as any;
  logError({
    message: e?.message || String(err),
    stack: e?.stack,
    source: "manual",
    metadata: meta,
  });
}
