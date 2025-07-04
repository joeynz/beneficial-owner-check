import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.yaml'],
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
}) 