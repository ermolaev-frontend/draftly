import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Draftly',
        short_name: 'Draftly',
        icons: [
          {
            src: '/assets/favicon_io/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/assets/favicon_io/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '.',
      },
    }),
  ],
  resolve: {
    alias: {
      shared: '/src/shared',
      pages: '/src/pages',
      entities: '/src/entities',
      widgets: '/src/widgets',
      assets: '/src/assets',
    },
  },
});
