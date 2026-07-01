import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 5000,
    allowedHosts: true,
    hmr: {
      overlay: false,
    },
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split major dependencies into separate chunks
          react: ["react", "react-dom"],
          router: ["react-router-dom"],
          motion: ["framer-motion"],
          query: ["@tanstack/react-query"],
          icons: ["lucide-react"],
          ui: ["@radix-ui/primitive", "@radix-ui/slot"],
        },
      },
    },
    // Optimize for production
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
    cssCodeSplit: true,
    sourcemap: false,
    reportCompressedSize: true,
  },
  // Bundle CJS-only deps into the SSR/prerender output so Node ESM can import
  // them without named-export interop errors.
  ssr: {
    noExternal: ["react-helmet-async"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime"],
  },
});
