import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/ai/query",
        destination: "/api/ai/query",
      },
    ];
  },
};

export default nextConfig;
