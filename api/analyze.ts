import { analyzeWithConfig } from '../services/geminiService';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Runs on Vercel's Edge runtime. The built-in API key lives in the server
// environment and never reaches the browser bundle.
export const config = { runtime: 'edge' };

const json = (data: unknown, status = 200): Response =>
    new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' }
    });

// Extra origins (beyond same-origin, which is always allowed) permitted to call
// this endpoint. Comma-separated; normally left empty. Useful only when you
// intentionally serve the app from another domain.
const EXTRA_ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

// Per-IP rate limit, active only when Upstash Redis env vars are present. This
// caps abuse of the shared built-in key; environments without Redis (e.g. a
// fork) fall back to no throttling rather than erroring.
const ratelimit =
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
        ? new Ratelimit({
              redis: Redis.fromEnv(),
              // 30 requests / 10 min per IP — generous for a human study session,
              // tight enough to stop scripted abuse. Tune via RATELIMIT_REQUESTS.
              limiter: Ratelimit.slidingWindow(Number(process.env.RATELIMIT_REQUESTS) || 30, '10 m'),
              prefix: 'sf-analyze'
          })
        : null;

// Allow same-origin browser requests (Origin host === the deployment's own
// host, which holds for production and every preview URL with no config) plus
// any explicitly configured extra origins. A request with no Origin header
// (curl/server-side) is let through and constrained by the rate limit instead.
const isOriginAllowed = (req: Request): boolean => {
    const origin = req.headers.get('origin');
    if (!origin) return true;
    let originHost = '';
    try {
        originHost = new URL(origin).host;
    } catch {
        return false;
    }
    const reqHost = req.headers.get('x-forwarded-host') || req.headers.get('host');
    if (originHost && originHost === reqHost) return true;
    return EXTRA_ALLOWED_ORIGINS.includes(origin);
};

export default async function handler(req: Request): Promise<Response> {
    if (req.method !== 'POST') {
        return json({ error: 'Method not allowed' }, 405);
    }

    if (!isOriginAllowed(req)) {
        return json({ error: '来源不被允许。' }, 403);
    }

    if (ratelimit) {
        const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'anonymous';
        const { success } = await ratelimit.limit(ip);
        if (!success) {
            return json({ error: '请求过于频繁，请稍后再试。' }, 429);
        }
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
