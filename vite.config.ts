import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const rawTarget = env.VITE_AI_BASE_URL || 'https://api.9router.com/v1';
  const target = rawTarget.replace(/\/+$/, '');

  return {
    plugins: [react()],
    server: {
      allowedHosts: true,
      proxy: {
        '/api/9router': {
          target: target,
          changeOrigin: true,
          secure: false,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
          rewrite: (path) => path.replace(/^\/api\/9router/, ''),
        },
      },
    },
    preview: {
      proxy: {
        '/api/9router': {
          target: target,
          changeOrigin: true,
          secure: false,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
          rewrite: (path) => path.replace(/^\/api\/9router/, ''),
        },
      },
    },
  };
});
