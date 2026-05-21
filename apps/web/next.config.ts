import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@bordon-ai/ai", "@bordon-ai/shared"],
  // Ensure Prisma engine binary + generated client are traced into the Vercel
  // function bundle (pnpm hoists them to .pnpm and Next's tracer can miss them).
  outputFileTracingIncludes: {
    "/api/**/*": [
      "../../node_modules/.pnpm/**/node_modules/.prisma/client/**",
      "../../node_modules/.pnpm/**/node_modules/@prisma/client/**"
    ],
    "/g/**/*": [
      "../../node_modules/.pnpm/**/node_modules/.prisma/client/**",
      "../../node_modules/.pnpm/**/node_modules/@prisma/client/**"
    ],
    "/scoreboard": [
      "../../node_modules/.pnpm/**/node_modules/.prisma/client/**",
      "../../node_modules/.pnpm/**/node_modules/@prisma/client/**"
    ]
  }
};

export default nextConfig;
