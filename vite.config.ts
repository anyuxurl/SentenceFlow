import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { analyzeWithConfig } from './services/geminiService';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        {
          // 仅开发环境：模拟 /api/analyze 服务端代理，让内置线路在 `npm run dev`
          // 下也能用。从 .env.local 读取 BUILTIN_*，这些变量不进 `define`，
          // 因此永远不会被打包进客户端 bundle。
          name: 'dev-builtin-analyze',
          configureServer(server) {
            server.middlewares.use('/api/analyze', async (req, res) => {
              if (req.method !== 'POST') { res.statusCode = 405; return res.end(); }
              let body = '';
              for await (const chunk of req) body += chunk;
              try {
                const { sentence } = JSON.parse(body || '{}');
                const result = await analyzeWithConfig(sentence, {
                  apiKey: env.BUILTIN_API_KEY,
                  baseUrl: env.BUILTIN_BASE_URL || 'https://api.qnaigc.com/v1',
                  model: env.BUILTIN_MODEL || 'deepseek/deepseek-v3.2-251201',
                });
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(result));
              } catch (e) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: e instanceof Error ? e.message : 'error' }));
              }
            });
          },
        },
      ],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
