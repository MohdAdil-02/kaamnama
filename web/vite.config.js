import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
    server: {
      port: 5173,
      // Dev proxy: the browser calls /api on :5173, Vite forwards to your backend. No CORS setup needed.
      proxy: { '/api': { target: env.VITE_PROXY_TARGET || 'http://localhost:5000', changeOrigin: true } },
    },
    build: {
      rollupOptions: {
        output: { manualChunks: { react: ['react', 'react-dom', 'react-router-dom'], vendor: ['axios', 'zustand', 'lucide-react'] } },
      },
    },
    test: { environment: 'node', include: ['src/**/*.test.js'] },
  };
});
