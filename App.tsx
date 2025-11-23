import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import InputArea from './components/InputArea';
import AnalysisResult from './components/AnalysisResult';
import ProgressBar from './components/ProgressBar';
import { analyzeSentence } from './services/geminiService';
import { AnalysisResult as AnalysisResultType, HistoryItem } from './types';

const sampleSentences = [
  "The quick brown fox jumps over the lazy dog.",
  "Despite the heavy rain, the dedicated team continued their work on the project.",
  "What she wrote was a masterpiece, which everyone admired.",
  "To be or not to be, that is the question.",
  "I have a dream that one day this nation will rise up and live out the true meaning of its creed."
];

const App: React.FC = () => {
  const [sentence, setSentence] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResultType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialState, setIsInitialState] = useState<boolean>(true);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  
  // Theme state
  const [isDark, setIsDark] = useState<boolean>(true);

  // Initialize Theme
  useEffect(() => {
    // Check local storage or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemDark)) {
        setIsDark(true);
    } else {
        setIsDark(false);
    }
  }, []);

  // Update HTML class when theme changes
  useEffect(() => {
    if (isDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = useCallback(() => {
      setIsDark(prev => !prev);
  }, []);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('sentenceFlowHistory');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (e) {
      console.error("Failed to load history from localStorage", e);
      localStorage.removeItem('sentenceFlowHistory');
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('sentenceFlowHistory', JSON.stringify(history));
    } catch (e) {
      console.error("Failed to save history to localStorage", e);
    }
  }, [history]);

  const performAnalysis = useCallback(async (sentenceToAnalyze: string) => {
    if (!sentenceToAnalyze.trim()) return;

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    if (isInitialState) setIsInitialState(false);
    
    try {
      const result = await analyzeSentence(sentenceToAnalyze);
      setAnalysisResult(result);
      // Add to history if it's a new sentence (case insensitive check optional, keeping exact for now)
      if (!history.some(item => item.sentence === sentenceToAnalyze)) {
        const newHistoryItem: HistoryItem = {
          id: Date.now().toString(),
          sentence: sentenceToAnalyze,
          result: result,
        };
        setHistory(prev => [newHistoryItem, ...prev]);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [isInitialState, history]);

  const handleAnalyze = useCallback(() => {
    performAnalysis(sentence);
  }, [sentence, performAnalysis]);

  const handleTryRandom = useCallback(() => {
    if (isLoading) return;
    const randomSentence = sampleSentences[Math.floor(Math.random() * sampleSentences.length)];
    setSentence(randomSentence);
    performAnalysis(randomSentence);
  }, [isLoading, performAnalysis]);

  const handleSelectHistoryItem = useCallback((item: HistoryItem) => {
    if (isLoading) return;
    setSentence(item.sentence);
    setAnalysisResult(item.result);
    setError(null);
    setIsInitialState(false);
  }, [isLoading]);

  const handleRemoveHistoryItem = useCallback((id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  }, []);

  const handleClearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${isDark ? 'bg-slate-900 bg-grid-slate-700/[0.05] text-white' : 'bg-gray-50 bg-grid-slate-200/[0.5] text-slate-900'}`}>
       <style>{`
          .animate-fade-in {
            animation: fadeIn 0.3s ease-out forwards;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(5px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .bg-grid-slate-700\\\/\\[0\\.05\\] {
            background-image: linear-gradient(theme(colors.slate.700 / 0.05) 1px, transparent 1px), linear-gradient(to right, theme(colors.slate.700 / 0.05) 1px, transparent 1px);
            background-size: 2rem 2rem;
          }
          .bg-grid-slate-200\\\/\\[0\\.5\\] {
             background-image: linear-gradient(theme(colors.slate.200 / 0.5) 1px, transparent 1px), linear-gradient(to right, theme(colors.slate.200 / 0.5) 1px, transparent 1px);
             background-size: 2rem 2rem;
          }
       `}</style>
      <main className="container mx-auto py-6 md:py-10 max-w-4xl flex-grow flex flex-col">
        <Header isDark={isDark} toggleTheme={toggleTheme} />
        <div className="mt-4 flex-grow">
          <InputArea 
            sentence={sentence}
            onSentenceChange={setSentence}
            onAnalyze={handleAnalyze}
            onTryRandom={handleTryRandom}
            isLoading={isLoading}
            history={history}
            onSelectHistory={handleSelectHistoryItem}
            onRemoveHistory={handleRemoveHistoryItem}
            onClearHistory={handleClearHistory}
          />
          <ProgressBar isLoading={isLoading} />
        </div>
        <div className="mt-4">
          <AnalysisResult 
            analysisResult={analysisResult}
            isLoading={isLoading}
            error={error}
            isInitialState={isInitialState}
          />
        </div>
      </main>
      <footer className="text-center p-8 mt-auto text-xs md:text-sm text-slate-400 dark:text-slate-600 transition-colors duration-300">
        <div className="flex flex-col md:flex-row justify-center items-center gap-2">
            <span>Powered by OpenAI</span>
            <span className="hidden md:inline">•</span>
            <span>
                Designed & Developed by{' '}
                <a 
                    href="https://134687.xyz" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="font-medium text-slate-500 dark:text-slate-500 hover:text-sky-500 dark:hover:text-sky-400 transition-colors underline decoration-dotted underline-offset-4"
                >
                    qeeryyu
                </a>
            </span>
        </div>
      </footer>
    </div>
  );
};

export default App;