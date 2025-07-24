// vite.config.js

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const CACHE_VERSION = '1.0.1';
const CACHE_PREFIX = 'notica';
const CACHE_NAMES = {
  STATIC: `${CACHE_PREFIX}-static-${CACHE_VERSION}`,
  API: `${CACHE_PREFIX}-api-${CACHE_VERSION}`,
  FONTS: `${CACHE_PREFIX}-fonts-${CACHE_VERSION}`,
  ASSETS: `${CACHE_PREFIX}-assets-${CACHE_VERSION}`,
};

export default defineConfig({
  esbuild: {
    legalComments: 'none',
    treeShaking: true,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        navigateFallbackDenylist: [/^\/notes\//, /^\/api\//],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: CACHE_NAMES.FONTS,
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/callmemahdi01\.github\.io\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: CACHE_NAMES.STATIC,
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/cdn\.tailwindcss\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: CACHE_NAMES.STATIC,
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|ico|webp|woff2|woff|ttf)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: CACHE_NAMES.STATIC,
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /\.(?:js|css)$/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: CACHE_NAMES.ASSETS,
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/') || url.pathname.startsWith('/notes/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: CACHE_NAMES.API,
              networkTimeoutSeconds: 10,
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 7 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      manifest: {
        name: 'Notica',
        short_name: 'Notica',
        description: 'اپلیکیشن دانشجویی نوتیکا',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        orientation: 'portrait',
        lang: 'fa-IR',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
    }),
  ],
  build: {
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.warn'],
        passes: 2,
      },
      mangle: {
        toplevel: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('lucide-react')) {
              return 'icons';
            }
            return 'vendor';
          }
        },
        chunkFileNames: 'assets/[name].[hash].js',
        entryFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
      },
      treeshake: {
        preset: 'smallest',
        moduleSideEffects: false,
      },
    },
    reportCompressedSize: true,
    chunkSizeWarningLimit: 1000,
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://notica.pages.dev',
        changeOrigin: true,
        secure: true,
      },
      '/notes': {
        target: 'https://notica.pages.dev',
        changeOrigin: true,
        secure: true,
      },
    },
  },
});