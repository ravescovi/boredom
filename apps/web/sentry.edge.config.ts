// Sentry init for the Edge runtime (middleware / edge routes), loaded from
// instrumentation.ts. The app currently runs everything on the Node runtime, but
// this keeps coverage complete and is cheap.
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://d416f42f5b3a04680ba063e5d7546338@o4511153446912000.ingest.us.sentry.io/4511445536604160",
  // Production-only — keep local dev errors out of the issue list.
  enabled: process.env.NODE_ENV === "production",
  environment: process.env.NODE_ENV,
  // Errors-only (performance tracing tree-shaken out via bundleSizeOptimizations).
  sendDefaultPii: true
});
