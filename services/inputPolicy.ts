/**
 * Input rules for the shared built-in route only.
 *
 * The built-in endpoint is open and spends the maintainer's own quota, so the
 * user's sentence is interpolated into a prompt we pay for. Without a shape
 * check, a crafted "sentence" turns the endpoint into a free general-purpose
 * LLM proxy (the model's answer just comes back in the `translation` field).
 * Constraining the input to something that actually looks like one English
 * sentence removes most of that value while leaving real usage untouched.
 *
 * Custom mode is deliberately exempt: there the user is spending their own key
 * against their own endpoint, and none of this is our business.
 *
 * Shared by the Edge handler and the dev middleware so a request that is
 * rejected in production is rejected identically under `npm run dev`.
 */

// A sentence to be parsed syntactically. Long enough for a dense academic
// sentence, short enough that the endpoint is useless as a prompt channel.
export const MAX_SENTENCE_LENGTH = 400;

// Minimum Latin letters, and the share of the input they must make up. English
// prose sits far above this floor (a typical sentence is ~0.75); pasted code,
// instruction payloads and non-English text fall below it.
const MIN_LETTERS = 8;
const MIN_LETTER_RATIO = 0.5;

// Real input is one sentence. A multi-line block is a prompt, not a sentence.
const MAX_NEWLINES = 2;

export type SentenceRejection = { error: string; status: number };

/**
 * Returns null when the input is acceptable, or the response to send back.
 */
export const checkSentence = (sentence: unknown): SentenceRejection | null => {
    if (typeof sentence !== 'string' || !sentence.trim()) {
        return { error: '缺少 sentence 参数。', status: 400 };
    }
    if (sentence.length > MAX_SENTENCE_LENGTH) {
        return { error: `句子过长（上限 ${MAX_SENTENCE_LENGTH} 字符）。`, status: 413 };
    }
    if ((sentence.match(/\n/g) || []).length > MAX_NEWLINES) {
        return { error: '请一次只分析一句英文。', status: 400 };
    }
    const letters = sentence.match(/[A-Za-z]/g)?.length ?? 0;
    if (letters < MIN_LETTERS || letters / sentence.length < MIN_LETTER_RATIO) {
        return { error: '请输入一句英文（内置线路仅支持英文句法分析）。', status: 400 };
    }
    return null;
};
