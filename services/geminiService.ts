
import { AnalysisResult } from '../types';

export interface OpenAIConfig {
    apiKey: string;
    baseUrl: string;
    model: string;
}

/**
 * Expert English syntactic analysis service powered by OpenAI.
 * Uses client-provided configuration for flexibility.
 */
export const analyzeSentence = async (sentence: string, config: OpenAIConfig): Promise<AnalysisResult> => {
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