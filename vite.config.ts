import { execSync } from "node:child_process";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/",
  // Stamped into the UI so "which build am I running" is never a guess again.
  // The commit sha, not a timestamp: it maps to an actual commit and keeps
  // builds reproducible, so output hashes still match across machines.
  define: {
    __BUILD__: JSON.stringify(
      (() => {
        try {
          return execSync("git rev-parse --short HEAD").toString().trim();
        } catch {
          return "dev";
        }
      })()
    )
  },
  plugins: [react()]
});
