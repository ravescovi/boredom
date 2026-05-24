// Sentry init for the browser. Next.js loads this automatically (15.3+).
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://9b1711919648ff92287dc771a419342d@o4511153446912000.ingest.us.sentry.io/4511154370510848",
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
  sendDefaultPii: true
  // Session Replay intentionally omitted to keep the client bundle lean.
});

// Instruments client-side navigations for tracing.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
