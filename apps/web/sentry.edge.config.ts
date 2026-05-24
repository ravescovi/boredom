// Sentry init for the Edge runtime (middleware / edge routes), loaded from
// instrumentation.ts. The app currently runs everything on the Node runtime, but
// this keeps coverage complete and is cheap.
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://9b1711919648ff92287dc771a419342d@o4511153446912000.ingest.us.sentry.io/4511154370510848",
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
  sendDefaultPii: true
});
