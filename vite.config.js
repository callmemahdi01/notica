import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallbackDenylist: [/^\/notes\//],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => {
              return url.hostname === 'callmemahdi01.github.io' ||
                     url.hostname === 'fonts.googleapis.com' ||
                     url.hostname === 'fonts.gstatic.com' ||
                     url.hostname === 'payment.ryzencloud910.workers.dev' ||
                     url.hostname === 'cdn.tailwindcss.com';
            },
            handler: 'CacheFirst',
            options: {
              cacheName: 'cdn-assets-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 روز
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
      manifest: {
        name: 'Notica',
        short_name: 'Notica',
        description: 'اپلیکیشن مدیریت دانشجویی نوتیکا',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        orientation: 'portrait',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://notica.pages.dev',
        changeOrigin: true,
      },
      '/notes': {
        target: 'https://notica.pages.dev',
        changeOrigin: true,
      },
    },
  },
});
