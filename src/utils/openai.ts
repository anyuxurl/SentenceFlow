import OpenAI from 'openai';
import SentenceCache from './cache';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
const model = import.meta.env.VITE_OPENAI_API_MODEL;
const baseURL = import.meta.env.VITE_OPENAI_BASE_URL;

const openai = new OpenAI({
  apiKey,
  baseURL,
  dangerouslyAllowBrowser: true
});

const MAX_SENTENCE_LENGTH = 500; // 最大句子长度限制
const API_COOLDOWN = 2000; // API调用冷却时间（毫秒）
let lastApiCall = 0; // 上次API调用时间戳

export interface ClauseAnalysis {
  type: string;
  content: string;
  description: string;
}

export interface SentenceAnalysis {
  components: string[];
  clauses: ClauseAnalysis[];
  errors: { message: string; suggestion: string }[];
}

export async function analyzeSentenceWithGPT(sentence: string): Promise<SentenceAnalysis> {
  // 检查句子长度
  if (sentence.length > MAX_SENTENCE_LENGTH) {
    return {
      components: ['句子过长'],
      clauses: [],
      errors: [{
        message: `句子长度超过${MAX_SENTENCE_LENGTH}个字符`,
        suggestion: '请缩短句子长度，或将长句拆分为多个短句分别分析'
      }]
    };
  }

  // 检查API调用冷却时间
  const now = Date.now();
  if (now - lastApiCall < API_COOLDOWN) {
    return {
      components: ['请求过于频繁'],
      clauses: [],
      errors: [{
        message: '请求过于频繁',
        suggestion: `请等待${Math.ceil((API_COOLDOWN - (now - lastApiCall)) / 1000)}秒后再试`
      }]
    };
  }

  // 检查缓存
  const cache = SentenceCache.getInstance();
  const cachedResult = cache.get(sentence);
  if (cachedResult) {
    return cachedResult;
  }

  lastApiCall = now;
  try {
    const prompt = `请分析以下英语句子的语法结构，并以JSON格式返回分析结果。句子："${sentence}"

请包含以下内容：
1. 句子成分（主语、谓语、宾语等）
2. 从句分析（如果有），包括：
   - 从句类型（名词性从句、定语从句、状语从句等）
   - 从句内容
   - 从句功能说明
3. 语法错误检查和建议，请详细说明：
   - 错误的具体位置
   - 错误的类型（如时态错误、主谓一致性错误、介词使用错误等）
   - 错误的原因分析
   - 具体的改进建议和正确用法示例

请确保返回的JSON格式如下：
{
  "components": ["主语: xxx", "谓语: xxx", ...],
  "clauses": [
    {
      "type": "主句/名词性从句/定语从句/状语从句",
      "content": "具体从句内容",
      "description": "从句功能说明"
    }
  ],
  "errors": [{"message": "错误描述", "suggestion": "改进建议"}]
}`;

    const completion = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: '你是一个专业的英语语法分析助手，擅长分析句子结构和语法错误。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) throw new Error('No response from OpenAI');

    try {
      // 清理响应文本中可能包含的markdown代码块标记
      const cleanResponse = response.replace(/^```json\s*|```\s*$/g, '').trim();
      return JSON.parse(cleanResponse) as SentenceAnalysis;
    } catch (parseError) {
      throw new Error(`JSON解析失败: ${(parseError as Error).message}\n原始响应: ${response}`);
    }
  } catch (error: any) {
    console.error('Error analyzing sentence:', error);
    const errorMessage = error.message || '未知错误';
    const errorDetails = error.response?.data?.error?.message || error.cause || '';
    return {
      components: ['分析失败'],
      clauses: [{
        type: '错误',
        content: '无法分析句子结构',
        description: '服务出现错误'
      }],
      errors: [{
        message: `服务出现错误: ${errorMessage}`,
        suggestion: `快去提醒作者修复bug，错误详情：${errorDetails}`
      }]
    };
  }
}
