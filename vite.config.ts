import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      port: 8081,
    },
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    },
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('error', (err, req, res) => {
            // Silently ignore ECONNREFUSED during server startup
            if (err.code !== 'ECONNREFUSED') {
              console.error('Proxy error:', err);
            }
          });
        }
      },
      "/uploads": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  optimizeDeps: {
    include: ["react", "react-dom"],
    exclude: [
      "lovable-tagger",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu", 
      "@radix-ui/react-select",
      "@tanstack/react-query",
      "embla-carousel-react",
      "embla-carousel-autoplay"
    ]
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          radix: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
          router: ['react-router-dom'],
          ui: ['@radix-ui/react-slot', 'class-variance-authority', 'clsx', 'tailwind-merge'],
          query: ['@tanstack/react-query'],
        },
      },
    },
    chunkSizeWarningLimit: 300,
    target: ['es2015', 'edge88', 'firefox78', 'chrome87', 'safari14'],
    minify: 'esbuild',
    assetsInlineLimit: 4096, // Inline small assets as base64
  },
}));
