import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { mockApiPlugin } from "./server/server.js";

export default defineConfig({
  plugins: [react(), mockApiPlugin()],
  server: { port: 3000 },
  root: ".",
  build: { outDir: "dist", assetsDir: "assets" },
});