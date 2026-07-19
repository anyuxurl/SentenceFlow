
import { AnalysisResult, SentenceComponent, Clause, GrammarError } from '../types';

export interface OpenAIConfig {
    apiKey: string;
    baseUrl: string;
    model: string;
}

export interface AnalyzeOptions {
    signal?: AbortSignal;
}

// Hard ceiling so a stalled upstream never hangs the spinner forever. Applies
// on both the client and the server proxy.
const REQUEST_TIMEOUT_MS = 30_000;

// Combine the caller's abort signal (used to cancel a superseded request) with
// an internal timeout signal. Dependency-free so it works in the browser and on
// Vercel's Edge runtime without relying on AbortSignal.any support.
const anySignal = (signals: AbortSignal[]): AbortSignal => {
    const controller = new AbortController();
    const onAbort = (s: AbortSignal) => controller.abort(s.reason);
    for (const s of signals) {
        if (s.aborted) {
            onAbort(s);
            break;
        }
        s.addEventListener('abort', () => onAbort(s), { once: true });
    }
    return controller.signal;
};

const SYSTEM_PROMPT = `You are an expert English syntactic analysis tool.
    Analyze the given English sentence for a Chinese learner.

    Return ONLY a raw JSON object (no markdown formatting, no code blocks) with the following structure:
    {
      "translation": "A fluent, natural, and accurate Chinese translation of the sentence",
      "components": [
        { "part": "Grammar part in Chinese (e.g. 主语, 谓语)", "text": "The text segment" }
      ],
      "clauses": [
        { "type": "Clause type in Chinese (e.g. 定语从句)", "text": "The clause text", "explanation": "Brief explanation in Chinese" }
      ],
      "grammarCheck": [
        { "original": "Original text", "correction": "Corrected text", "explanation": "Why it is wrong in Chinese" }
      ]
    }

    If there are no grammar errors, "grammarCheck" should be an empty array.
    Ensure all explanations and grammatical terms are in Chinese.
    The translation should be polished and suitable for a language learner to understand the meaning deeply.`;

const asString = (v: unknown): string => (typeof v === 'string' ? v : '');

/**
 * Pull a JSON object out of a model response. Handles the two things models do
 * despite being told not to: wrap the JSON in a ```json code fence, and add
 * stray prose before/after it. Narrowing to the outermost braces is a no-op for
 * a clean pure-JSON response.
 */
const extractJson = (raw: string): string => {
    let s = raw.trim();
    const fenced = s.match(/```(?:[a-zA-Z]+)?\s*\n?([\s\S]*?)```/);
    if (fenced) s = fenced[1].trim();
    const start = s.indexOf('{');
    const end = s.lastIndexOf('}');
    if (start !== -1 && end > start) s = s.slice(start, end + 1);
    return s;
};

/**
 * Coerce arbitrary parsed JSON into a well-formed AnalysisResult. The UI maps
 * over these arrays and reads .length, so a missing or wrongly-typed field must
 * never reach it — we default arrays to [] and drop entries with no usable text.
 */
const normalizeResult = (raw: unknown): AnalysisResult => {
    const obj = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
    const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
    const at = (item: unknown, key: string): string => asString((item as Record<string, unknown>)?.[key]);

    return {
        translation: asString(obj.translation),
        components: arr(obj.components)
            .map((c): SentenceComponent => ({ part: at(c, 'part'), text: at(c, 'text') }))
            .filter((c) => c.text !== ''),
        clauses: arr(obj.clauses)
            .map((c): Clause => ({ type: at(c, 'type'), text: at(c, 'text'), explanation: at(c, 'explanation') }))
            .filter((c) => c.text !== ''),
        grammarCheck: arr(obj.grammarCheck)
            .map((g): GrammarError => ({ original: at(g, 'original'), correction: at(g, 'correction'), explanation: at(g, 'explanation') }))
            .filter((g) => g.original !== '' || g.correction !== ''),
    };
};

/**
 * Core analysis routine against any OpenAI-compatible endpoint.
 * Isomorphic: relies only on fetch/JSON, so it is reused both by the
 * client (custom mode) and by the server-side proxy (api/analyze.ts).
 */
export const analyzeWithConfig = async (sentence: string, config: OpenAIConfig, options: AnalyzeOptions = {}): Promise<AnalysisResult> => {
    if (!config.apiKey) {
        throw new Error("API Key 未配置。请点击右上角设置图标填写您的 OpenAI API Key。");
    }

    const baseUrl = config.baseUrl.replace(/\/$/, "");
    const endpoint = `${baseUrl}/chat/completions`;

    const timeoutController = new AbortController();
    const timeoutId = setTimeout(
        () => timeoutController.abort(new DOMException('请求超时', 'TimeoutError')),
        REQUEST_TIMEOUT_MS
    );
    const signal = options.signal
        ? anySignal([options.signal, timeoutController.signal])
        : timeoutController.signal;

    const callChat = (useJsonFormat: boolean): Promise<Response> =>
        fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`
            },
            body: JSON.stringify({
                model: config.model,
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'user', content: `Analyze this English sentence: "${sentence}"` }
                ],
                // Not all OpenAI-compatible endpoints support response_format; if
                // the first attempt 400s we retry once without it (see below).
                ...(useJsonFormat ? { response_format: { type: "json_object" } } : {}),
                temperature: 0.2
            }),
            signal
        });

    try {
        let response = await callChat(true);
        if (response.status === 400) {
            response = await callChat(false);
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            let errorMessage = `API 请求失败 (${response.status})`;
            if (errorData && errorData.error && errorData.error.message) {
                errorMessage += `: ${errorData.error.message}`;
            }
            throw new Error(errorMessage);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (!content || typeof content !== 'string') {
            throw new Error("AI 模型返回了空响应。");
        }

        let parsed: unknown;
        try {
            parsed = JSON.parse(extractJson(content));
        } catch {
            throw new Error("AI 返回的内容无法解析为 JSON，请重试。");
        }

        const result = normalizeResult(parsed);
        if (result.components.length === 0 && result.translation === '') {
            throw new Error("AI 返回的分析结果为空或格式异常，请重试。");
        }
        return result;

    } catch (error) {
        // A timeout surfaces as a friendly message; a caller-initiated abort
        // (superseded by a newer request) is re-thrown untouched so the caller
        // can recognise and ignore it.
        if (error instanceof Error && error.name === 'TimeoutError') {
            throw new Error("请求超时，请稍后重试。");
        }
        if (error instanceof Error && error.name === 'AbortError') {
            throw error;
        }
        console.error("Syntactic Analysis Error:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("分析过程中发生未知错误。");
    } finally {
        clearTimeout(timeoutId);
    }
};

/**
 * Built-in ("默认线路") analysis. Routes through the server-side proxy at
 * /api/analyze so the shared API key stays in the server environment and is
 * never shipped to the browser.
 */
export const analyzeBuiltIn = async (sentence: string, options: AnalyzeOptions = {}): Promise<AnalysisResult> => {
    const timeoutController = new AbortController();
    const timeoutId = setTimeout(
        () => timeoutController.abort(new DOMException('请求超时', 'TimeoutError')),
        REQUEST_TIMEOUT_MS
    );
    const signal = options.signal
        ? anySignal([options.signal, timeoutController.signal])
        : timeoutController.signal;

    try {
        const res = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sentence }),
            signal
        });

        if (!res.ok) {
            const data = await res.json().catch(() => null);
            throw new Error(data?.error || `内置线路请求失败 (${res.status})`);
        }

        return res.json() as Promise<AnalysisResult>;
    } catch (error) {
        if (error instanceof Error && error.name === 'TimeoutError') {
            throw new Error("请求超时，请稍后重试。");
        }
        throw error;
    } finally {
        clearTimeout(timeoutId);
    }
};
