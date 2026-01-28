import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from '../types';

/**
 * Expert English syntactic analysis service powered by Gemini 3.
 * Uses the system-provided API key for secure and reliable operation.
 */
export const analyzeSentence = async (sentence: string): Promise<AnalysisResult> => {
    // Initialize the Gemini API client using the environment variable
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Analyze this English sentence for a Chinese learner: "${sentence}"`,
            config: {
                systemInstruction: 'You are an expert English syntactic analysis tool. Provide a detailed breakdown in JSON format. All explanations and grammatical terms must be in Chinese.',
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        components: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    part: { type: Type.STRING, description: 'Grammar part in Chinese (e.g. 主语, 谓语)' },
                                    text: { type: Type.STRING, description: 'The text segment' }
                                },
                                required: ['part', 'text']
                            }
                        },
                        clauses: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    type: { type: Type.STRING, description: 'Clause type in Chinese (e.g. 定语从句)' },
                                    text: { type: Type.STRING, description: 'The clause text' },
                                    explanation: { type: Type.STRING, description: 'Brief explanation in Chinese' }
                                },
                                required: ['type', 'text', 'explanation']
                            }
                        },
                        grammarCheck: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    original: { type: Type.STRING },
                                    correction: { type: Type.STRING },
                                    explanation: { type: Type.STRING, description: 'Why it is wrong in Chinese' }
                                },
                                required: ['original', 'correction', 'explanation']
                            }
                        }
                    },
                    required: ['components', 'clauses', 'grammarCheck']
                },
                temperature: 0.2,
            }
        });

        const textOutput = response.text;
        if (!textOutput) {
            throw new Error("The AI model returned an empty response. Please try a different sentence.");
        }

        return JSON.parse(textOutput) as AnalysisResult;

    } catch (error) {
        console.error("Syntactic Analysis Error:", error);
        if (error instanceof Error) {
            throw new Error(`Analysis failed: ${error.message}`);
        }
        throw new Error("An unexpected error occurred during sentence analysis.");
    }
};