import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  transpilePackages: ["@bordon-ai/ai", "@bordon-ai/shared"]
};

export default withSentryConfig(nextConfig, {
  // Only log source-map work in CI.
  silent: !process.env.CI,
  // Source-map upload (readable stack traces) runs only when SENTRY_AUTH_TOKEN is
  // set; without it the build still injects the SDK and captures errors (with
  // minified stack traces). Add the token + org/project later for symbolication.
  authToken: process.env.SENTRY_AUTH_TOKEN,
  widenClientFileUpload: true
});
