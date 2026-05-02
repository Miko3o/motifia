import type { NextConfig } from "next";
import path from "path";
import { loadEnvConfig } from "@next/env";

// Load `.env*` before reading BACKEND_URL; otherwise rewrites fall back to localhost:5000
// and `/api/*` proxy fails with 500 when no local API is running.
loadEnvConfig(process.cwd());

const backendUrl = (process.env.BACKEND_URL || "http://localhost:5000").replace(
  /\/$/,
  ""
);

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(process.cwd()),
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
