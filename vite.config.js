import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    proxy: {
      '/products': {
        target: 'https://petshop-api-6gix.onrender.com',
        changeOrigin: true,
        secure: false
      },
      // เพิ่ม proxy สำหรับ auth routes
      '/auth': {
        target: 'https://petshop-api-6gix.onrender.com',
        changeOrigin: true,
        secure: false
      }
    }
  },
  plugins: [
    vue(),
  ],
  define: {
    'process.env': process.env
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  }
})
