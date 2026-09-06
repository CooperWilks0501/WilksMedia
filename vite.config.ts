import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/",
  // Stamped into the UI so "which build am I running" is never a guess again.
  define: {
    __BUILD__: JSON.stringify(
      new Date().toISOString().slice(0, 16).replace("T", " ") + "Z"
    )
  },
  plugins: [react()]
});
