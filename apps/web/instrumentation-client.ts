// Sentry init for the browser. Next.js loads this automatically (15.3+).
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://d416f42f5b3a04680ba063e5d7546338@o4511153446912000.ingest.us.sentry.io/4511445536604160",
  // Production-only: dev hot-reload throws transient ReferenceErrors mid-edit
  // that would otherwise flood the issue list. enabled:false keeps the SDK wired
  // (onRouterTransitionStart etc.) but drops all events outside production.
  enabled: process.env.NODE_ENV === "production",
  environment: process.env.NODE_ENV,
  // Errors-only: performance tracing and Session Replay are tree-shaken out of
  // the bundle (see bundleSizeOptimizations in next.config), keeping the client
  // First Load JS lean. We capture exceptions, not transactions.
  sendDefaultPii: true
});

// Exported to satisfy @sentry/nextjs's build-time check; a no-op while
// performance tracing is tree-shaken out (errors-only).
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
