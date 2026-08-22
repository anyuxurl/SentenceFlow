import { analyzeWithConfig, AnalysisError, UpstreamError } from '../services/geminiService';
import { checkSentence } from '../services/inputPolicy';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Runs on Vercel's Edge runtime. The built-in API key lives in the server
// environment and never reaches the browser bundle.
export const config = { runtime: 'edge' };

const json = (data: unknown, status = 200): Response =>
    new Response(JSON.stringify(data), {
        status,
        headers: {
            'Content-Type': 'application/json',
            // Nothing here should ever be held by a CDN or shared cache: the
            // rate-limit and budget rejections are per-caller and per-moment.
            'Cache-Control': 'no-store'
        }
    });

// Edge Functions must begin their response within the platform's window
// (~25s). Cutting the upstream off before then means a stalled provider
// surfaces as our own "请求超时" rather than a platform error page.
const UPSTREAM_TIMEOUT_MS = 20_000;

// Extra origins (beyond same-origin, which is always allowed) permitted to call
// this endpoint. Comma-separated; normally left empty. Useful only when you
// intentionally serve the app from another domain.
const EXTRA_ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

const redis =
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
        ? Redis.fromEnv()
        : null;

// Per-IP rate limit, active only when Upstash Redis env vars are present. This
// caps abuse of the shared built-in key; environments without Redis (e.g. a
// fork) fall back to no throttling rather than erroring.
const ratelimit = redis
    ? new Ratelimit({
          redis,
          // 30 requests / 10 min per IP — generous for a human study session,
          // tight enough to stop scripted abuse. Tune via RATELIMIT_REQUESTS.
          limiter: Ratelimit.slidingWindow(Number(process.env.RATELIMIT_REQUESTS) || 30, '10 m'),
          prefix: 'sf-analyze'
      })
    : null;

// The per-IP limit alone is bypassed by rotating IPs, and the bill for the
// shared key is the maintainer's. This is the backstop: one budget for the
// whole deployment per day, after which callers are asked to bring their own
// key. Tune via DAILY_BUDGET.
const dailyBudget = redis
    ? new Ratelimit({
          redis,
          limiter: Ratelimit.fixedWindow(Number(process.env.DAILY_BUDGET) || 500, '1 d'),
          prefix: 'sf-budget'
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

// What the browser is told when the upstream provider rejects us. The provider's
// own text is logged, never returned: its 401/403 bodies routinely echo key
// prefixes, org ids and account state.
const upstreamMessage = (status: number): string => {
    if (status === 401 || status === 403) return '内置线路鉴权失败，请联系维护者，或在设置中使用自定义配置。';
    if (status === 429) return '内置线路当前繁忙，请稍后重试。';
    if (status === 400 || status === 404) return '内置线路配置有误，请联系维护者。';
    return '内置线路暂时不可用，请稍后重试。';
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

    const rejection = checkSentence(sentence);
    if (rejection) {
        return json({ error: rejection.error }, rejection.status);
    }

    // Charged only once the request is known to be well-formed, so malformed
    // input can't burn the day's budget.
    if (dailyBudget) {
        const { success } = await dailyBudget.limit('global');
        if (!success) {
            return json(
                { error: '今日内置额度已用完，请在设置中填写你自己的 API Key。' },
                429
            );
        }
    }

    try {
        const result = await analyzeWithConfig(sentence as string, {
            apiKey,
            baseUrl: process.env.BUILTIN_BASE_URL || 'https://api.qnaigc.com/v1',
            model: process.env.BUILTIN_MODEL || 'deepseek/deepseek-v3.2-251201'
        }, {
            // Stop paying for a completion the caller has already walked away from.
            signal: req.signal,
            timeoutMs: UPSTREAM_TIMEOUT_MS
        });
        return json(result);
    } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
            return json({ error: '请求已取消。' }, 499);
        }
        if (err instanceof UpstreamError) {
            console.error('[analyze] upstream', err.status, err.detail);
            return json({ error: upstreamMessage(err.status) }, err.status === 429 ? 429 : 502);
        }
        // Authored by our own parsing/validation logic — carries no upstream detail.
        if (err instanceof AnalysisError) {
            return json({ error: err.message }, 502);
        }
        console.error('[analyze] unexpected', err);
        return json({ error: '内置线路暂时不可用，请稍后重试。' }, 502);
    }
}
