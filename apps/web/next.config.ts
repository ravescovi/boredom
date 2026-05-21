import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@bordon-ai/ai", "@bordon-ai/shared"]
};

export default nextConfig;
