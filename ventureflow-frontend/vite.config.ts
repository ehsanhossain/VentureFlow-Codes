import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/masterdata': {
        target: 'https://api.tcg-hrvc-system.com', // No trailing slash
        changeOrigin: true,
        secure: false, // true if using proper SSL
      },
    },
  },
});
