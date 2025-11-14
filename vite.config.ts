import { defineConfig } from "vite";
import react from "@vitejs/plugin-react"; // ✅ correct plugin
import path from "path";                  // ✅ correct import

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),  // ✅ alias works now
    },
  },
  server: {
    port: 5173,
  },
});
