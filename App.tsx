import React, { useState, useCallback, useEffect, useRef } from 'react';
import Header from './components/Header';
import InputArea from './components/InputArea';
import AnalysisResult from './components/AnalysisResult';
import ProgressBar from './components/ProgressBar';
import SettingsModal from './components/SettingsModal';
import { LogoMark } from './components/Logo';
import { analyzeWithConfig, analyzeBuiltIn, OpenAIConfig } from './services/geminiService';
import { AnalysisResult as AnalysisResultType, HistoryItem } from './types';

const sampleSentences = [
  "The quick brown fox jumps over the lazy dog.",
  "Despite the heavy rain, the dedicated team continued their work on the project.",
  "What she wrote was a masterpiece, which everyone admired.",
  "To be or not to be, that is the question.",
  "I have a dream that one day this nation will rise up and live out the true meaning of its creed."
];

// 内置线路的密钥保存在服务端环境变量中，由 /api/analyze 代理调用，前端不再持有。
const DEFAULT_CUSTOM_CONFIG: OpenAIConfig = {
    apiKey: '',
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4o-mini'
};

// 历史记录保留条数上限（持久化与内存中的裁剪共用同一常量）。
const MAX_HISTORY = 20;

const App: React.FC = () => {
  const [sentence, setSentence] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResultType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialState, setIsInitialState] = useState<boolean>(true);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Cancels a still-running analysis when a new one starts (prevents a slow
  // earlier response from overwriting a newer one), and remembers the last
  // attempted sentence so the error "retry" button can re-run it.
  const abortRef = useRef<AbortController | null>(null);
  const lastSentenceRef = useRef<string>('');
  
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
    localStorage.setItem('sentenceFlowHistory', JSON.stringify(history.slice(0, MAX_HISTORY)));
  }, [history]);

  const performAnalysis = useCallback(async (sentenceToAnalyze: string) => {
    if (!sentenceToAnalyze.trim()) return;

    // 自定义模式需要用户自己的 Key；内置模式由服务端代理校验。
    if (useCustomConfig && !customApiConfig.apiKey) {
        setIsSettingsOpen(true);
        setError("请配置您的自定义 API Key");
        return;
    }

    // Supersede any in-flight request so its (possibly slower) response can't
    // clobber this one, then track the new request for the next call to cancel.
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    lastSentenceRef.current = sentenceToAnalyze;

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    if (isInitialState) setIsInitialState(false);

    try {
      const result = useCustomConfig
        ? await analyzeWithConfig(sentenceToAnalyze, customApiConfig, { signal: controller.signal })
        : await analyzeBuiltIn(sentenceToAnalyze, { signal: controller.signal });
      if (controller.signal.aborted) return;
      setAnalysisResult(result);

      setHistory(prev => {
          const filtered = prev.filter(item => item.sentence !== sentenceToAnalyze);
          return [{
              id: Date.now().toString(),
              sentence: sentenceToAnalyze,
              result: result,
          }, ...filtered].slice(0, MAX_HISTORY);
      });
    } catch (err) {
      // Ignore errors from a request we deliberately superseded.
      if (controller.signal.aborted) return;
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      // Only the most recent request owns the loading state.
      if (abortRef.current === controller) {
        setIsLoading(false);
        abortRef.current = null;
      }
    }
  }, [isInitialState, useCustomConfig, customApiConfig]);

  const handleAnalyze = useCallback(() => {
    performAnalysis(sentence);
  }, [sentence, performAnalysis]);

  const handleRetry = useCallback(() => {
    if (lastSentenceRef.current) performAnalysis(lastSentenceRef.current);
  }, [performAnalysis]);

  const handleTryRandom = useCallback(() => {
    if (isLoading) return;
    const randomSentence = sampleSentences[Math.floor(Math.random() * sampleSentences.length)];
    setSentence(randomSentence);
    performAnalysis(randomSentence);
  }, [isLoading, performAnalysis]);

  const handleSelectSample = useCallback((sample: string) => {
    if (isLoading) return;
    setSentence(sample);
    performAnalysis(sample);
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

      <main className="container mx-auto py-8 md:py-16 max-w-4xl px-4 flex-grow flex flex-col">
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
          onRetry={handleRetry}
          sampleSentences={sampleSentences}
          onSelectSample={handleSelectSample}
        />
      </main>

      <footer className="py-12 px-6 border-t border-slate-100 dark:border-slate-900 mt-auto">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-slate-400 dark:text-slate-600">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400 dark:text-slate-500"><LogoMark className="w-4 h-4" /></div>
                <p className="text-xs font-chinese tracking-widest font-medium uppercase">SentenceFlow 句流 &copy; {new Date().getFullYear()}</p>
            </div>
            
            <div className="flex items-center gap-6 text-[10px] font-black tracking-wider font-chinese">
                <span>由 OpenAI 提供支持</span>
                <span className="opacity-20">/</span>
                <a href="https://134687.xyz" target="_blank" rel="noreferrer" className="hover:text-sky-500 transition-colors underline decoration-dotted underline-offset-4">开发者 qeeryyu</a>
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