import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import Sitemap from 'vite-plugin-sitemap';

export default defineConfig({
  plugins: [
    react(),
    Sitemap({
      hostname: 'https://nerdwaretechnologies.com',
      dynamicRoutes: [
        '/',
        '/about',
        '/services',
        '/portfolio',
        '/blog',
        '/contact'
      ],
      generateRobotsTxt: false  // ← add this line
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom']
        }
      }
    }
  }
});