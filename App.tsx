import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import InputArea from './components/InputArea';
import AnalysisResult from './components/AnalysisResult';
import ProgressBar from './components/ProgressBar';
import SettingsModal from './components/SettingsModal';
import { analyzeSentence, OpenAIConfig } from './services/geminiService';
import { AnalysisResult as AnalysisResultType, HistoryItem } from './types';

const sampleSentences = [
  "The quick brown fox jumps over the lazy dog.",
  "Despite the heavy rain, the dedicated team continued their work on the project.",
  "What she wrote was a masterpiece, which everyone admired.",
  "To be or not to be, that is the question.",
  "I have a dream that one day this nation will rise up and live out the true meaning of its creed."
];

// --- 开发者配置区域 (Developer Configuration Area) ---
// 请在此处填写您提供的内置 API Key / Please fill in your built-in API Key here
const BUILT_IN_CONFIG: OpenAIConfig = {
    apiKey: 'YOUR_API_KEY_HERE', // <--- REPLACE THIS WITH YOUR KEY
    baseUrl: 'https://api.qnaigc.com/v1',
    model: 'deepseek/deepseek-v3.2-251201'
};

const DEFAULT_CUSTOM_CONFIG: OpenAIConfig = {
    apiKey: '',
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4o-mini'
};

const App: React.FC = () => {
  const [sentence, setSentence] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResultType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialState, setIsInitialState] = useState<boolean>(true);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  
  // Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [useCustomConfig, setUseCustomConfig] = useState<boolean>(false);
  const [customApiConfig, setCustomApiConfig] = useState<OpenAIConfig>(DEFAULT_CUSTOM_CONFIG);

  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof document !== 'undefined') {
        return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  // Load Settings from LocalStorage
  useEffect(() => {
    try {
        const storedCustomConfig = localStorage.getItem('sentenceFlowCustomConfig');
        const storedUseCustom = localStorage.getItem('sentenceFlowUseCustom');

        if (storedCustomConfig) {
            setCustomApiConfig({ ...DEFAULT_CUSTOM_CONFIG, ...JSON.parse(storedCustomConfig) });
        }
        if (storedUseCustom !== null) {
            setUseCustomConfig(JSON.parse(storedUseCustom));
        }
    } catch (e) {
        console.error("Failed to load config", e);
    }
  }, []);

  const saveSettings = (useCustom: boolean, newConfig: OpenAIConfig) => {
      setUseCustomConfig(useCustom);
      setCustomApiConfig(newConfig);
      
      localStorage.setItem('sentenceFlowUseCustom', JSON.stringify(useCustom));
      localStorage.setItem('sentenceFlowCustomConfig', JSON.stringify(newConfig));
  };

  const toggleTheme = useCallback(() => {
      const newIsDark = !isDark;
      setIsDark(newIsDark);
      document.documentElement.classList.toggle('dark', newIsDark);
      localStorage.setItem('theme', newIsDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('sentenceFlowHistory');
      if (storedHistory) setHistory(JSON.parse(storedHistory));
    } catch (e) {
      console.error("Failed to load history", e);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('sentenceFlowHistory', JSON.stringify(history.slice(0, 20)));
  }, [history]);

  const performAnalysis = useCallback(async (sentenceToAnalyze: string) => {
    if (!sentenceToAnalyze.trim()) return;

    // Determine which config to use
    const activeConfig = useCustomConfig ? customApiConfig : BUILT_IN_CONFIG;

    if (!activeConfig.apiKey || activeConfig.apiKey.includes('YOUR_BUILT_IN_KEY')) {
        setIsSettingsOpen(true);
        setError(useCustomConfig ? "请配置您的自定义 API Key" : "内置 API Key 未配置，请联系开发者或切换到自定义模式。");
        return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    if (isInitialState) setIsInitialState(false);
    
    try {
      const result = await analyzeSentence(sentenceToAnalyze, activeConfig);
      setAnalysisResult(result);
      
      setHistory(prev => {
          const filtered = prev.filter(item => item.sentence !== sentenceToAnalyze);
          return [{
              id: Date.now().toString(),
              sentence: sentenceToAnalyze,
              result: result,
          }, ...filtered].slice(0, 10);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [isInitialState, useCustomConfig, customApiConfig]);

  const handleAnalyze = useCallback(() => {
    performAnalysis(sentence);
  }, [sentence, performAnalysis]);

  const handleTryRandom = useCallback(() => {
    if (isLoading) return;
    const randomSentence = sampleSentences[Math.floor(Math.random() * sampleSentences.length)];
    setSentence(randomSentence);
    performAnalysis(randomSentence);
  }, [isLoading, performAnalysis]);

  return (
    <div className={`min-h-screen flex flex-col font-sans selection:bg-sky-500/20 transition-colors duration-700 ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-gray-50 text-slate-900'}`}>
      <style>{`
          .animate-fade-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
      `}</style>

      <main className="container mx-auto py-8 md:py-16 max-w-5xl px-4 flex-grow flex flex-col">
        <Header 
            isDark={isDark} 
            toggleTheme={toggleTheme} 
            onOpenSettings={() => setIsSettingsOpen(true)}
        />
        
        <div className="mt-12 space-y-4">
          <InputArea 
            sentence={sentence}
            onSentenceChange={setSentence}
            onAnalyze={handleAnalyze}
            onTryRandom={handleTryRandom}
            isLoading={isLoading}
            history={history}
            onSelectHistory={(item) => { setSentence(item.sentence); setAnalysisResult(item.result); setIsInitialState(false); }}
            onRemoveHistory={(id) => setHistory(h => h.filter(x => x.id !== id))}
            onClearHistory={() => setHistory([])}
          />
          <ProgressBar isLoading={isLoading} />
        </div>

        <AnalysisResult 
          analysisResult={analysisResult}
          isLoading={isLoading}
          error={error}
          isInitialState={isInitialState}
        />
      </main>

      <footer className="py-12 px-6 border-t border-slate-100 dark:border-slate-900 mt-auto">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-slate-400 dark:text-slate-600">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-center font-bold text-xs">SF</div>
                <p className="text-xs font-chinese tracking-widest font-medium uppercase">SentenceFlow 句流 &copy; 2024</p>
            </div>
            
            <div className="flex items-center gap-6 text-[10px] font-black tracking-widest uppercase font-sans">
                <span>Powered by OpenAI</span>
                <span className="opacity-20">/</span>
                <a href="https://134687.xyz" target="_blank" className="hover:text-sky-500 transition-colors underline decoration-dotted underline-offset-4">Developer qeeryyu</a>
            </div>
        </div>
      </footer>

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        initialUseCustom={useCustomConfig}
        initialCustomConfig={customApiConfig}
        onSave={saveSettings}
      />
    </div>
  );
};

export default App;