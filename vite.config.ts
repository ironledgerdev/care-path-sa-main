import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // Configure HMR to use WSS through the proxy host. Set DEV_HMR_HOST and optionally DEV_HMR_CLIENT_PORT in the environment when running behind a proxy.
    hmr: {
      protocol: 'wss',
      host: process.env.DEV_HMR_HOST || process.env.DEV_HOST || undefined,
      clientPort: Number(process.env.DEV_HMR_CLIENT_PORT) || 443,
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
