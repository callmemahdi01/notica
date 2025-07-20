// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        // این بخش جدید، وظیفه کش کردن جزوات را بر عهده دارد
        runtimeCaching: [
          {
            // هر درخواستی که با آدرس /notes/ شروع شود را شناسایی می‌کند
            urlPattern: /^\/notes\//,
            // از استراتژی "اول حافظه پنهان" (CacheFirst) استفاده می‌کند
            handler: 'CacheFirst',
            options: {
              // یک نام منحصر به فرد برای کش جزوات
              cacheName: 'notica-notes-cache',
              expiration: {
                // حداکثر ۵۰ جزوه در حافظه پنهان نگهداری می‌شود
                maxEntries: 10,
                // هر جزوه به مدت ۳۰ روز در حافظه پنهان باقی می‌ماند
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 روز
              },
              cacheableResponse: {
                // فقط پاسخ‌های موفق (status: 200) را کش می‌کند
                statuses: [200],
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