// vite.config.js

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const CACHE_VERSION = '1.0.10';
const CACHE_PREFIX = 'notica';
const CACHE_NAMES = {
  STATIC: `${CACHE_PREFIX}-static-${CACHE_VERSION}`,
  API: `${CACHE_PREFIX}-api-${CACHE_VERSION}`,
  FONTS: `${CACHE_PREFIX}-fonts-${CACHE_VERSION}`,
  ASSETS: `${CACHE_PREFIX}-assets-${CACHE_VERSION}`,
  COMPONENTS: `${CACHE_PREFIX}-components-${CACHE_VERSION}`,
};

export default defineConfig({
  base: '/',
  esbuild: {
    legalComments: 'none',
    treeShaking: true,
    sourcemap: false,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//, /^\/notes\//],
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
            urlPattern: /\.(?:js|jsx|css)$/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: CACHE_NAMES.ASSETS,
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: ({ url }) => url.pathname.includes('/components/') || url.pathname.includes('SplashScreen'),
            handler: 'CacheFirst',
            options: {
              cacheName: CACHE_NAMES.COMPONENTS,
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 7 },
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
        start_url: '/app',
        orientation: 'any',
        lang: 'fa-IR',
        dir: 'rtl',
        categories: ['education', 'productivity'],
        icons: [
          {
            src: 'pwa-64x64.png',
            sizes: '64x64',
            type: 'image/png'
          },
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        shortcuts: [
          {
            name: 'اپلیکیشن اصلی',
            short_name: 'اپ',
            description: 'باز کردن اپلیکیشن اصلی نوتیکا',
            url: '/app',
            icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }]
          }
        ],
        edge_side_panel: {
          preferred_width: 480
        }
      },
      devOptions: {
        enabled: false,
        type: 'module'
      }
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
        // حذف passes برای سرعت بیشتر
      },
      mangle: {
        toplevel: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // بهینه‌سازی code splitting
          'react': ['react', 'react-dom', 'react-router-dom'],
          'auth': ['./src/contexts/AuthContext.jsx'],
          'splash': ['./src/components/SplashScreen.jsx'],
          'print': ['./src/components/PrintComponent.jsx'],
          'routes': ['./src/components/LoginPage.jsx', './src/components/SignupPage.jsx', './src/components/PayPage.jsx'],
          'layout': ['./src/components/ProtectedRoute.jsx', './src/components/GuestRoute.jsx', './src/components/Site.jsx'],
          'main': ['./src/App.jsx', './src/main.jsx']
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