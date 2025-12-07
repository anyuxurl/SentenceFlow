import { AnalysisResult } from '../types';

// =================================================================
// 配置区域 / CONFIGURATION AREA
// 请在下方引号内填入您的 OpenAI API Key 和 代理地址 (如有)
// =================================================================

const OPENAI_API_KEY = "sk-L8Ye7NU2LEgQsMPv88199e17E39e476aA0010e0aF4C951Eb"; // 在这里填入您的 Key
const OPENAI_BASE_URL = "https://oneapi.lzzxt.com/v1"; // 如果使用中转，请修改此地址

// =================================================================

export const analyzeSentence = async (sentence: string): Promise<AnalysisResult> => {
    
    // Safety check
    if (OPENAI_API_KEY.startsWith("sk-xxxx")) {
        console.warn("Please configure your OpenAI API Key in services/geminiService.ts");
    }

    const prompt = `
    You are an expert English syntactic analysis tool designed for Chinese learners. Analyze the user's sentence and provide a detailed breakdown in JSON format.

    Strictly adhere to this JSON structure:
    {
      "components": [
        { "part": "Grammar part in Chinese (e.g. 主语, 谓语)", "text": "The text segment" }
      ],
      "clauses": [
        { "type": "Clause type in Chinese (e.g. 定语从句)", "text": "The clause text", "explanation": "Brief explanation in Chinese" }
      ],
      "grammarCheck": [
        { "original": "Error text", "correction": "Corrected text", "explanation": "Why it is wrong in Chinese" }
      ]
    }

    Rules:
    1. Descriptions must be in Chinese.
    2. If no grammar errors are found, "grammarCheck" must be an empty array [].
    3. Be precise with linguistic terminology.
    
    User Input: "${sentence}"
    `;

    try {
        const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini", // 或者 gpt-3.5-turbo
                messages: [
                    { role: "system", content: "You are a helpful assistant that outputs JSON." },
                    { role: "user", content: prompt }
                ],
                response_format: { type: "json_object" },
                temperature: 0.3
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`API Error: ${response.status} ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content;

        if (!content) {
            throw new Error("Empty response from AI");
        }

        return JSON.parse(content) as AnalysisResult;

    } catch (error) {
        console.error("Error analyzing sentence:", error);
        throw error;
    }
};