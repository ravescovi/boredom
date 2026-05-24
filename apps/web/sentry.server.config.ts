// Sentry init for the Node.js server runtime (loaded from instrumentation.ts).
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://9b1711919648ff92287dc771a419342d@o4511153446912000.ingest.us.sentry.io/4511154370510848",
  // 100% of transactions in dev, a modest sample in prod (low-traffic v0).
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
  // Attach request headers + IP for easier debugging.
  sendDefaultPii: true
});
