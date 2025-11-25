import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"
import tailwindcss from "@tailwindcss/vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: ['pdfjs-dist'],
  },
  server: {
    host: true, // Listen on all network interfaces (0.0.0.0)
    port: 5173,
    strictPort: false,
    open: true, // Automatically open browser
    proxy: {
      '/api': {
        target: 'http://10.10.0.60',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.log('Proxy error:', err);
          });
          proxy.on('proxyReq', (_proxyReq, req) => {
            console.log('→', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req) => {
            console.log('←', proxyRes.statusCode, req.url);
          });
        },
      },
    },
  },
})
