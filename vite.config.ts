import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  
  // Base path - use environment variable or default for GitHub Pages
  base: process.env.VITE_BASE_PATH || '/samta-matrimony/',
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@components': path.resolve(__dirname, './components'),
      '@pages': path.resolve(__dirname, './pages'),
      '@contexts': path.resolve(__dirname, './contexts'),
      '@services': path.resolve(__dirname, './services'),
      '@api': path.resolve(__dirname, './api'),
    },
  },

  server: {
    port: 5173,
    strictPort: false,
    open: true,
  },

  build: {
    target: 'ES2020',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // Set to true for debugging production issues
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },

  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
})
