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
