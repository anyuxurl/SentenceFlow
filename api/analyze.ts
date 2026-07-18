import { analyzeWithConfig } from '../services/geminiService';

// Runs on Vercel's Edge runtime — only needs fetch, so no extra deps and no
// Node types. The built-in API key lives in the server environment and never
// reaches the browser bundle.
export const config = { runtime: 'edge' };

const json = (data: unknown, status = 200): Response =>
    new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' }
    });

export default async function handler(req: Request): Promise<Response> {
    if (req.method !== 'POST') {
        return json({ error: 'Method not allowed' }, 405);
    }

    const apiKey = process.env.BUILTIN_API_KEY;
    if (!apiKey) {
        return json({ error: '服务端未配置内置 API Key（BUILTIN_API_KEY）。' }, 500);
    }

    let sentence: unknown;
    try {
        ({ sentence } = await req.json());
    } catch {
        return json({ error: '请求体解析失败。' }, 400);
    }

    if (typeof sentence !== 'string' || !sentence.trim()) {
        return json({ error: '缺少 sentence 参数。' }, 400);
    }
    if (sentence.length > 1000) {
        return json({ error: '句子过长（上限 1000 字符）。' }, 413);
    }

    try {
        const result = await analyzeWithConfig(sentence, {
            apiKey,
            baseUrl: process.env.BUILTIN_BASE_URL || 'https://api.qnaigc.com/v1',
            model: process.env.BUILTIN_MODEL || 'deepseek/deepseek-v3.2-251201'
        });
        return json(result);
    } catch (err) {
        return json({ error: err instanceof Error ? err.message : '分析失败。' }, 502);
    }
}
