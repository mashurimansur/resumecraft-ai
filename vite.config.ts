import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const rawTarget = env.VITE_AI_BASE_URL || 'https://api.openai.com/v1';
  const target = rawTarget.replace(/\/+$/, '');

  const proxyConfig = {
    target: target,
    changeOrigin: true,
    secure: false,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
    rewrite: (path: string) => path.replace(/^\/api\/(ai|9router)/, ''),
  };

  return {
    plugins: [react()],
    server: {
      allowedHosts: true,
      proxy: {
        '/api/ai': proxyConfig,
        '/api/9router': proxyConfig,
      },
    },
    preview: {
      proxy: {
        '/api/ai': proxyConfig,
        '/api/9router': proxyConfig,
      },
    },
  };
});
