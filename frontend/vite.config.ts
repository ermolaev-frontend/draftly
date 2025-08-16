import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import federation from '@originjs/vite-plugin-federation';

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
    federation({
      name: 'draftly',
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/app/App.tsx',
      },
      shared: {
        react: { requiredVersion: '^19.1.0' },
        'react-dom': { requiredVersion: '^19.1.0' },
      },
    }),
  ],
  // Реальный домен для продакшена
  base: 'https://draftly.ermolaev-frontend.ru',
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        minifyInternalExports: false,
      },
    },
  },
  resolve: {
    alias: {
      shared: '/src/shared',
      pages: '/src/pages',
      entities: '/src/entities',
      widgets: '/src/widgets',
      assets: '/src/shared/assets',
    },
  },
});
