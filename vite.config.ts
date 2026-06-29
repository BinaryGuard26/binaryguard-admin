import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  preview: {
    host: "0.0.0.0",
    port: 8080,
    allowedHosts: [
      "binaryguard-admin-u5ahk.ondigitalocean.app",
      "admin.binaryguard.ca"
    ]
  },
  server: {
    host: "0.0.0.0",
    port: 8080
  }
});
