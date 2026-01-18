import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'classic',
    }),
    tailwindcss(),
  ],
  root: '.',
  publicDir: false,
  base: '/assets/',
  build: {
    outDir: 'public/assets',
    emptyDirOnBuild: true,
    manifest: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'frontend/learningHall.jsx'),
      output: {
        entryFileNames: 'bundle.js',
        chunkFileNames: '[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'bundle.css';
          }
          return '[name]-[hash][extname]';
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'frontend'),
    },
    extensions: ['.js', '.jsx', '.json'],
  },
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
