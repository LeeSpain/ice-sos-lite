import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
          supabase: ['@supabase/supabase-js'],
          tanstack: ['@tanstack/react-query'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    cssCodeSplit: true,
    sourcemap: false,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@supabase/supabase-js', '@tanstack/react-query'],
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest: {
        name: 'ICE SOS Lite',
        short_name: 'ICESOS',
        start_url: '/',
        display: 'standalone',
        background_color: '#0b0b0f',
        theme_color: '#ef4444',
        icons: [
          { src: '/lovable-uploads/7ad599e6-d1cd-4a1b-84f4-9b6b1e4242e1.png', sizes: '192x192', type: 'image/png' },
          { src: '/lovable-uploads/7ad599e6-d1cd-4a1b-84f4-9b6b1e4242e1.png', sizes: '512x512', type: 'image/png' }
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp}'],
        maximumFileSizeToCacheInBytes: 8 * 1024 * 1024, // 8MB to allow optimized images
        globIgnores: ['lovable-uploads/**'], // avoid precaching large uploads initially
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.origin.includes('supabase.co'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 },
            },
          },
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/lovable-uploads/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'optimized-images',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 90 }, // 90 days
              cacheableResponse: { statuses: [0, 200] },
              plugins: [{
                cacheKeyWillBeUsed: async ({ request }) => {
                  // Cache different sizes separately
                  return `${request.url}?optimized=true`;
                },
              }],
            },
          },
        ],
      },
    }),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
