
import React, { useState, useRef, useEffect } from 'react';
import { HistoryItem } from '../types';
import History from './History';

interface InputAreaProps {
  sentence: string;
  onSentenceChange: (sentence: string) => void;
  onAnalyze: () => void;
  onTryRandom: () => void;
  isLoading: boolean;
  history: HistoryItem[];
  onSelectHistory: (item: HistoryItem) => void;
  onRemoveHistory: (id: string) => void;
  onClearHistory: () => void;
}

const InputArea: React.FC<InputAreaProps> = ({ 
  sentence, 
  onSentenceChange, 
  onAnalyze, 
  onTryRandom, 
  isLoading,
  history,
  onSelectHistory,
  onRemoveHistory,
  onClearHistory
}) => {
  const [showHistory, setShowHistory] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading) {
        onAnalyze();
        setShowHistory(false);
      }
    }
  };

  // Close history when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowHistory(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelectHistoryItem = (item: HistoryItem) => {
      onSelectHistory(item);
      setShowHistory(false);
  }

  const hasContent = sentence.trim().length > 0;

  return (
    <div ref={wrapperRef} className="w-full max-w-3xl mx-auto px-4 relative z-20">
      <div className="relative group">
        <textarea
          value={sentence}
          onChange={(e) => onSentenceChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入要分析的英文句子..."
          className="w-full h-40 p-5 pr-12 pb-16 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-600/50 rounded-2xl text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 shadow-sm dark:shadow-none transition-all duration-300 resize-none text-lg leading-relaxed"
          disabled={isLoading}
        />
        
        {/* History Toggle Button */}
        <button
            onClick={() => setShowHistory(!showHistory)}
            className={`absolute top-3 right-3 p-2 rounded-lg transition-all duration-200 ${
                showHistory 
                ? 'text-sky-500 bg-sky-50 dark:bg-sky-900/20' 
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
            title="历史记录"
        >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        </button>

        {/* Action Bar inside Input */}
        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center pointer-events-none">
             <button
                onClick={onTryRandom}
                disabled={isLoading}
                className="pointer-events-auto flex-shrink-0 flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 bg-slate-100 dark:bg-slate-700/50 hover:bg-sky-50 dark:hover:bg-slate-700 px-3 py-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                <span className={`whitespace-nowrap ${hasContent ? 'hidden' : 'inline'}`}>随便试试</span>
            </button>

            <button
                onClick={onAnalyze}
                disabled={isLoading || !sentence.trim()}
                className="pointer-events-auto flex-shrink-0 flex items-center space-x-2 px-5 py-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl hover:from-sky-400 hover:to-blue-500 shadow-lg shadow-sky-500/30 disabled:shadow-none disabled:from-slate-300 disabled:to-slate-400 dark:disabled:from-slate-700 dark:disabled:to-slate-800 disabled:cursor-not-allowed disabled:text-slate-500 dark:disabled:text-slate-500 transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
                <span className="text-sm font-semibold">分析</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
            </button>
        </div>

        {/* Dropdown History Panel */}
        {showHistory && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-fade-in z-30">
                <History 
                    history={history} 
                    onSelectItem={handleSelectHistoryItem} 
                    onRemoveItem={onRemoveHistory}
                    onClearHistory={onClearHistory}
                />
            </div>
        )}
      </div>
    </div>
  );
};

export default InputArea;
