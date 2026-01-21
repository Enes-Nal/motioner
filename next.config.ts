import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next.js 16 uses Turbopack by default. Adding an explicit (even empty)
  // turbopack config prevents build errors when a legacy `webpack` config exists.
  turbopack: {},
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }
    return config;
  },
  transpilePackages: ['remotion'],
};

export default nextConfig;
