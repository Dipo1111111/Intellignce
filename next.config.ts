import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fully static, local-first build: no server, no server actions.
  // The app runs SQLite (WASM) in the browser with IndexedDB persistence.
  output: "export",
};

export default nextConfig;
