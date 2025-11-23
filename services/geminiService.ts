import { AnalysisResult } from '../types';

const API_KEY = process.env.OPENAI_API_KEY;
const BASE_URL = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';

export const analyzeSentence = async (sentence: string): Promise<AnalysisResult> => {
    if (!API_KEY) {
        throw new Error("OpenAI API Key is missing. Please configure OPENAI_API_KEY in environment variables.");
    }

    try {
        const response = await fetch(`${BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini', // Efficient and good with JSON
                messages: [
                    {
                        role: 'system',
                        content: `You are an expert English syntactic analysis tool. Analyze the user's sentence and provide a detailed breakdown in JSON format.
                        
                        The output must strictly adhere to the following JSON structure:
                        {
                            "components": [
                                { "part": "Grammar part in Chinese (e.g., 主语)", "text": "The corresponding text" }
                            ],
                            "clauses": [
                                { "type": "Clause type in Chinese (e.g., 主句)", "text": "The clause text", "explanation": "Brief explanation in Chinese" }
                            ],
                            "grammarCheck": [
                                { "original": "Original error text", "correction": "Corrected text", "explanation": "Explanation in Chinese" }
                            ]
                        }
                        
                        If no grammar errors are found, "grammarCheck" must be an empty array.
                        Ensure all descriptions and types are in Chinese.`
                    },
                    {
                        role: 'user',
                        content: `Analyze the following English sentence: "${sentence}"`
                    }
                ],
                response_format: { type: "json_object" },
                temperature: 0.2
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`API Error: ${response.status} ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        const jsonContent = data.choices[0]?.message?.content;

        if (!jsonContent) throw new Error("Empty response from AI");
        
        return JSON.parse(jsonContent) as AnalysisResult;

    } catch (error) {
        console.error("Error analyzing sentence:", error);
        throw new Error(error instanceof Error ? error.message : "Failed to analyze sentence. Please check your network or API configuration.");
    }
};