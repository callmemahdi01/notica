// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa'; // 

export default defineConfig({
  plugins: [
    react(),
    //
    VitePWA({
      registerType: 'autoUpdate',
      // این بخش برای ساخت Service Worker است
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'], //
        // FIX: به سرویس ورکر می‌گوییم مسیر جزوات را نادیده بگیرد
        navigateFallbackDenylist: [/^\/notes\//],
      },
      // این بخش برای ساخت فایل manifest.json است
      manifest: {
        name: 'Notica', //
        short_name: 'Notica', //
        description: 'اپلیکیشن مدیریت دانشجویی نوتیکا', //
        theme_color: '#ffffff', //
        background_color: '#ffffff', //
        display: 'standalone', //
        scope: '/', //
        start_url: '/', //
        orientation: 'portrait', //
        icons: [ //
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
  // ... سایر تنظیمات شما مثل پراکسی
  server: { //
    proxy: {
      '/api': { //
        target: 'https://notica.pages.dev', //
        changeOrigin: true, //
      },
      // این بخش را برای حل مشکل در محیط توسعه اضافه کنید
      '/notes': { //
        target: 'https://notica.pages.dev', // آدرس سایت خود را اینجا بگذارید //
        changeOrigin: true, //
      },
    },
  },
});