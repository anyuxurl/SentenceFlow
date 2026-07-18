
import { AnalysisResult } from '../types';

export interface OpenAIConfig {
    apiKey: string;
    baseUrl: string;
    model: string;
}

/**
 * Core analysis routine against any OpenAI-compatible endpoint.
 * Isomorphic: relies only on fetch/JSON, so it is reused both by the
 * client (custom mode) and by the server-side proxy (api/analyze.ts).
 */
export const analyzeWithConfig = async (sentence: string, config: OpenAIConfig): Promise<AnalysisResult> => {
    if (!config.apiKey) {
        throw new Error("API Key 未配置。请点击右上角设置图标填写您的 OpenAI API Key。");
    }

    const systemPrompt = `You are an expert English syntactic analysis tool. 
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

    try {
        const baseUrl = config.baseUrl.replace(/\/$/, "");
        const endpoint = `${baseUrl}/chat/completions`;

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`
            },
            body: JSON.stringify({
                model: config.model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: `Analyze this English sentence: "${sentence}"` }
                ],
                response_format: { type: "json_object" },
                temperature: 0.2
            })
        });

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

        if (!content) {
            throw new Error("AI 模型返回了空响应。");
        }

        return JSON.parse(content) as AnalysisResult;

    } catch (error) {
        console.error("Syntactic Analysis Error:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("分析过程中发生未知错误。");
    }
};

/**
 * Built-in ("默认线路") analysis. Routes through the server-side proxy at
 * /api/analyze so the shared API key stays in the server environment and is
 * never shipped to the browser.
 */
export const analyzeBuiltIn = async (sentence: string): Promise<AnalysisResult> => {
    const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sentence })
    });

    if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || `内置线路请求失败 (${res.status})`);
    }

    return res.json() as Promise<AnalysisResult>;
};