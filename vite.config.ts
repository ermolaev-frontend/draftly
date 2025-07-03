import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      shared: resolve(__dirname, 'src/shared'),
      pages: resolve(__dirname, 'src/pages'),
      entities: resolve(__dirname, 'src/entities'),
      widgets: resolve(__dirname, 'src/widgets'),
      assets: resolve(__dirname, 'src/assets'),
    },
  },
})
