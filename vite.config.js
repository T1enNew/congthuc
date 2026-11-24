import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base "./": đường dẫn tương đối — chạy được ở https://t1ennew.github.io/congthuc/, ở máy local và trong Claude.
export default defineConfig({
  plugins: [react()],
  base: "./",
  server: { host: true, port: 5173 },
  preview: { host: true, port: 5174 },
  build: { outDir: "dist", assetsInlineLimit: 0, chunkSizeWarningLimit: 900 }
});
