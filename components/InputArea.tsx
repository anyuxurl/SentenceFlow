import React, { useState, useRef, useEffect } from 'react';
import { HistoryItem } from '../types';
import History from './History';

// navigator.platform is deprecated; derive the Mac hint from the UA string.
const IS_MAC = typeof navigator !== 'undefined' && /Mac|iP(hone|ad|od)/.test(navigator.userAgent);

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (!isLoading && sentence.trim()) {
        onAnalyze();
        setShowHistory(false);
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowHistory(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClearInput = () => {
    onSentenceChange('');
    textareaRef.current?.focus();
  };

  const hasContent = sentence.trim().length > 0;

  return (
    <div ref={wrapperRef} className="w-full max-w-3xl mx-auto px-4 relative z-20">
      <div className="relative group bg-white dark:bg-slate-900/50 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 transition-all duration-300 focus-within:ring-2 focus-within:ring-sky-500/20 focus-within:border-sky-500/50">
        
        <textarea
          ref={textareaRef}
          value={sentence}
          onChange={(e) => onSentenceChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type or paste an English sentence to deconstruct..."
          className="w-full h-44 p-6 pt-10 pb-16 bg-transparent text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 outline-none resize-none text-xl leading-relaxed font-serif transition-colors"
          disabled={isLoading}
        />

        {/* Floating Tools */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          {hasContent && !isLoading && (
             <button
                onClick={handleClearInput}
                className="p-1.5 rounded-lg text-slate-300 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all"
                title="Clear input"
             >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
             </button>
          )}
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`p-1.5 rounded-lg transition-all ${
                showHistory 
                ? 'text-sky-500 bg-sky-50 dark:bg-sky-900/20' 
                : 'text-slate-300 hover:text-slate-600 dark:hover:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Analysis history"
          >
             <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </button>
        </div>

        {/* Input Metadata */}
        <div className="absolute top-4 left-6">
            <span className="text-[10px] font-bold tracking-widest uppercase text-slate-300 dark:text-slate-700 font-sans">
                Source Input
            </span>
        </div>

        {/* Action Bar */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
                <button
                    onClick={onTryRandom}
                    disabled={isLoading}
                    className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-sky-500 dark:hover:text-sky-400 transition-colors disabled:opacity-30 font-chinese"
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                    <span>随机示例</span>
                </button>
                <span className="text-[10px] text-slate-300 dark:text-slate-700 font-mono hidden sm:inline">
                    {sentence.length} chars
                </span>
            </div>

            <div className="flex items-center gap-3">
                <span className="hidden lg:inline text-[10px] text-slate-400 font-mono">
                    {IS_MAC ? '⌘+Enter' : 'Ctrl+Enter'}
                </span>
                <button
                    onClick={onAnalyze}
                    disabled={isLoading || !sentence.trim()}
                    className="group relative flex items-center gap-2 px-6 py-2.5 bg-slate-900 dark:bg-sky-500 text-white rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-sky-500/10 disabled:opacity-20 disabled:grayscale disabled:scale-100 overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-sky-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <span className="relative z-10 text-sm font-bold font-chinese tracking-wide">开始分析</span>
                    <svg className="relative z-10 h-4 w-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </button>
            </div>
        </div>

        {/* Dropdown History Panel */}
        {showHistory && (
            <div className="absolute top-full left-0 right-0 mt-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-fade-in z-30">
                <History 
                    history={history} 
                    onSelectItem={(item) => { onSelectHistory(item); setShowHistory(false); }} 
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