import type { NextConfig } from "next";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { loadEnvConfig } from "@next/env";

function resolveTurbopackRoot(): string {
  const configDir = path.dirname(fileURLToPath(import.meta.url));
  const withNext = (dir: string) =>
    fs.existsSync(path.join(dir, "node_modules", "next", "package.json"));

  try {
    const realConfigDir = fs.realpathSync(configDir);
    if (withNext(realConfigDir)) return realConfigDir;
  } catch {
    if (withNext(configDir)) return path.normalize(configDir);
  }

  const cwd = process.cwd();
  try {
    const realCwd = fs.realpathSync(cwd);
    if (withNext(realCwd)) return realCwd;
  } catch {
    if (withNext(cwd)) return path.normalize(cwd);
  }

  try {
    return fs.realpathSync(configDir);
  } catch {
    return path.normalize(configDir);
  }
}

// Turbopack picks the wrong root when multiple lockfiles exist (e.g. user home +
// this repo). Force a root that actually contains this app's `node_modules/next`.
const projectRoot = resolveTurbopackRoot();

// Load `.env*` before reading BACKEND_URL for rewrites.
loadEnvConfig(process.cwd());

const backendRaw = process.env.BACKEND_URL?.trim();
const backendUrl = backendRaw?.replace(/\/$/, "");

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
  async rewrites() {
    // Only proxy when BACKEND_URL is set. Otherwise `/api/*` is handled by
    // Route Handlers (see README). Defaulting to localhost:5000 caused 500s
    // when no Express server was running.
    if (!backendUrl) {
      return [];
    }
    // Use beforeFiles so these run before App Router `/app/api/*` handlers;
    // otherwise the local Route Handlers can satisfy `/api/*` and Railway is never hit.
    return {
      beforeFiles: [
        {
          source: "/api/:path*",
          destination: `${backendUrl}/api/:path*`,
        },
      ],
    };
  },
};

export default nextConfig;
