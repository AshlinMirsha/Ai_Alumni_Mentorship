import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  serverExternalPackages: ["pdf-parse", "@napi-rs/canvas"],
  turbopack: {
    resolveAlias: {
      fs: { browser: "./src/lib/empty-browser-module.ts" },
      path: { browser: "./src/lib/empty-browser-module.ts" },
      "ort.bundle.min.mjs": "onnxruntime-web",
    },
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
