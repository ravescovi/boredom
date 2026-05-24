// Sentry init for the browser. Next.js loads this automatically (15.3+).
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://d416f42f5b3a04680ba063e5d7546338@o4511153446912000.ingest.us.sentry.io/4511445536604160",
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
  sendDefaultPii: true
  // Session Replay intentionally omitted to keep the client bundle lean.
});

// Instruments client-side navigations for tracing.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
