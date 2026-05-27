import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  transpilePackages: ["@bordom-ai/ai", "@bordom-ai/shared"]
};

export default withSentryConfig(nextConfig, {
  // Sentry org + project (corgi-code/boredom). Source-map upload (readable
  // stack traces) runs only when SENTRY_AUTH_TOKEN is set (e.g. in Vercel prod);
  // without it the build still injects the SDK and captures errors, just with
  // minified stack traces.
  org: "corgi-code",
  project: "boredom",
  authToken: process.env.SENTRY_AUTH_TOKEN,
  // Only log source-map work in CI.
  silent: !process.env.CI,
  widenClientFileUpload: true,
  // Errors-only: tree-shake performance tracing and all Session Replay code
  // paths out of the bundle. Trims the client First Load JS — we capture
  // exceptions, not transactions/replays.
  bundleSizeOptimizations: {
    excludeDebugStatements: true,
    excludeTracing: true,
    excludeReplayShadowDom: true,
    excludeReplayIframe: true,
    excludeReplayWorker: true
  }
});
