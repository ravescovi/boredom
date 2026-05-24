import * as Sentry from "@sentry/nextjs";

// Next.js server instrumentation hook: load the runtime-appropriate Sentry init.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

// Captures errors thrown in Server Components, route handlers, and middleware.
export const onRequestError = Sentry.captureRequestError;
