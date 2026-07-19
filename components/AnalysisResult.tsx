
import React, { useState } from 'react';
import { AnalysisResult as AnalysisResultType } from '../types';
import ResultCard from './ResultCard';

interface AnalysisResultProps {
  analysisResult: AnalysisResultType | null;
  isLoading: boolean;
  error: string | null;
  isInitialState: boolean;
  onRetry: () => void;
}

const colorMap: Record<number, string> = {
    0: 'bg-sky-500/10 text-sky-700 dark:text-sky-400 ring-sky-500/20',
    1: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 ring-indigo-500/20',
    2: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 ring-emerald-500/20',
    3: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 ring-amber-500/20',
    4: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 ring-rose-500/20',
    5: 'bg-violet-500/10 text-violet-700 dark:text-violet-400 ring-violet-500/20',
};

const SkeletonCard = () => (
    <div className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="h-6 w-1/3 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse"></div>
        <div className="flex gap-3">
            <div className="h-10 w-24 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse"></div>
            <div className="h-10 flex-1 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse"></div>
        </div>
    </div>
);

const AnalysisResult: React.FC<AnalysisResultProps> = ({ analysisResult, isLoading, error, isInitialState, onRetry }) => {
  const [activeSegment, setActiveSegment] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopyTranslation = () => {
    if (analysisResult?.translation) {
      navigator.clipboard.writeText(analysisResult.translation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
        <div className="w-full max-w-3xl mx-auto px-4 space-y-6 mt-12 pb-20">
            <div className="text-center mb-8 space-y-3">
                <div className="inline-block px-3 py-1 bg-sky-50 dark:bg-sky-900/30 rounded-full border border-sky-100 dark:border-sky-800">
                    <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 tracking-widest uppercase animate-pulse">Synthesizing Flow</span>
                </div>
                <h2 className="text-xl font-chinese font-medium text-slate-400">正在通过 AI 深度拆解句法结构...</h2>
            </div>
            <div className="h-48 bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-[2rem] animate-pulse mb-8"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <SkeletonCard />
                <SkeletonCard />
            </div>
        </div>
    );
  }

  if (isInitialState) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-300 dark:text-slate-700 transition-all duration-700 animate-fade-in">
        <svg className="w-16 h-16 mb-6 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
        <p className="text-lg font-chinese font-light tracking-widest">请在上方输入一段文字以开启分析</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-2xl mx-auto mt-12 p-6 bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/20 rounded-3xl text-center animate-fade-in">
        <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/30 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <h3 className="text-rose-800 dark:text-rose-300 font-bold mb-1 font-chinese">分析异常</h3>
        <p className="text-rose-600 dark:text-rose-400 text-sm font-chinese">{error}</p>
        <button onClick={onRetry} className="mt-4 px-4 py-1.5 text-xs font-bold text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors">重新尝试</button>
      </div>
    );
  }

  if (!analysisResult) return null;

  return (
    <div className="w-full max-w-3xl mx-auto px-4 space-y-8 mt-12 pb-24 animate-fade-in">
      
      {/* --- 核心解读区: 视觉拆解 + 句子翻译 --- */}
      <div className="relative overflow-hidden bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] shadow-xl shadow-slate-200/40 dark:shadow-none group">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 via-indigo-500 to-rose-400 opacity-50"></div>
        
        {/* 原句拆解部分 */}
        <div className="p-8 md:p-10 pb-6">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-sky-500 rounded-full"></div>
                    <span className="text-[10px] font-black tracking-[0.2em] text-slate-400 dark:text-slate-500 uppercase">Syntactic Structure</span>
                </div>
                <div className="px-2 py-0.5 rounded bg-slate-50 dark:bg-slate-800 text-[10px] text-slate-400 font-mono font-bold">
                    {analysisResult.components.length} SEGMENTS
                </div>
            </div>

            <div className="flex flex-wrap gap-x-2 gap-y-4 text-2xl md:text-4xl font-serif leading-snug">
              {analysisResult.components.map((c, i) => (
                <span 
                    key={i} 
                    onMouseEnter={() => setActiveSegment(i)}
                    onMouseLeave={() => setActiveSegment(null)}
                    className={`px-2 rounded-xl ring-1 transition-all duration-300 cursor-default ${activeSegment === i ? 'scale-110 z-10 shadow-lg shadow-sky-500/10' : ''} ${colorMap[i % 6]}`}
                >
                  {c.text}
                </span>
              ))}
            </div>
        </div>

        {/* 视觉分割 */}
        <div className="px-10 flex items-center gap-4">
            <div className="flex-grow h-[1px] bg-gradient-to-r from-transparent via-slate-100 dark:via-slate-800 to-transparent"></div>
            <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
            <div className="flex-grow h-[1px] bg-gradient-to-r from-transparent via-slate-100 dark:via-slate-800 to-transparent"></div>
        </div>

        {/* 精美翻译部分 */}
        <div className="p-8 md:p-10 pt-6 bg-slate-50/30 dark:bg-slate-800/20 relative">
            <div className="flex items-center gap-2 mb-6">
                <div className="w-2 h-2 bg-rose-400 rounded-full opacity-60"></div>
                <span className="text-[10px] font-black tracking-[0.2em] text-slate-400 dark:text-slate-500 uppercase">Polished Translation</span>
            </div>

            <div className="relative group/trans">
                <button 
                    onClick={handleCopyTranslation}
                    className={`absolute -right-2 -top-2 p-2 rounded-xl transition-all duration-300 ${copied ? 'text-emerald-500 bg-emerald-50' : 'text-slate-300 opacity-0 group-hover/trans:opacity-100 hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-900/30'}`}
                    title="Copy translation"
                >
                    {copied ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>}
                </button>
                <p className="text-2xl md:text-3xl font-chinese font-bold text-slate-800 dark:text-slate-100 leading-tight tracking-tight pr-8">
                    {analysisResult.translation}
                </p>
            </div>
            <div className="absolute bottom-4 right-10 text-7xl font-serif text-slate-200 dark:text-slate-800 opacity-20 select-none">”</div>
        </div>
      </div>

      {/* --- 分析详情板块: 字号全面提升优化 --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        
        {/* 成分精解 */}
        <ResultCard title="成分精解" icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}>
            <div className="space-y-4">
                {analysisResult.components.map((c, i) => (
                    <div 
                        key={i} 
                        className={`p-5 rounded-2xl border transition-all duration-300 ${activeSegment === i ? 'bg-sky-50 border-sky-200 dark:bg-sky-900/20 dark:border-sky-500/30 scale-[1.02]' : 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-100/50 dark:border-slate-800'}`}
                        onMouseEnter={() => setActiveSegment(i)}
                        onMouseLeave={() => setActiveSegment(null)}
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ring-1 ${colorMap[i % 6]}`}>
                                {c.part}
                            </span>
                        </div>
                        {/* 提升英文单词的展示强度 */}
                        <p className="text-lg md:text-xl text-slate-900 dark:text-slate-50 font-serif leading-relaxed">{c.text}</p>
                    </div>
                ))}
            </div>
        </ResultCard>

        <div className="space-y-8">
            {/* 从句逻辑 */}
            {analysisResult.clauses.length > 0 && (
                <ResultCard title="从句逻辑" icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}>
                    <div className="space-y-8">
                        {analysisResult.clauses.map((c, i) => (
                            <div key={i} className="group flex gap-5">
                                <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 flex items-center justify-center text-sm font-black shadow-sm">{i+1}</div>
                                <div className="flex-grow pt-1">
                                    <h4 className="font-serif text-lg md:text-xl text-slate-900 dark:text-slate-50 mb-2 leading-snug">"{c.text}"</h4>
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-md uppercase tracking-widest font-bold border border-slate-200/50 dark:border-slate-700">
                                            {c.type}
                                        </span>
                                    </div>
                                    {/* 提升解释文本的可读性 */}
                                    <p className="text-base text-slate-600 dark:text-slate-400 font-chinese leading-relaxed">
                                        {c.explanation}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </ResultCard>
            )}

            {/* 语法反馈 */}
            <ResultCard title="语法反馈" icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}>
                {analysisResult.grammarCheck.length === 0 ? (
                    <div className="flex flex-col items-center py-8 text-emerald-500/40">
                        <svg className="w-12 h-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <p className="font-chinese tracking-[0.3em] text-xs uppercase font-bold text-center">Perfect Sentence Structure</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {analysisResult.grammarCheck.map((g, i) => (
                            <div key={i} className="bg-rose-50/40 dark:bg-rose-950/10 border border-rose-100/50 dark:border-rose-900/20 rounded-2xl p-6">
                                <div className="grid grid-cols-1 gap-4 mb-5 pb-5 border-b border-rose-100/30 dark:border-rose-900/10">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-rose-400 mb-1 block">Original</span>
                                        <p className="font-serif text-base text-slate-400 line-through decoration-rose-300/50 leading-relaxed">{g.original}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-1 block">Refined</span>
                                        <p className="font-serif text-lg text-slate-900 dark:text-slate-50 font-medium leading-relaxed">{g.correction}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-rose-400 flex-shrink-0"></div>
                                    <p className="text-base text-slate-600 dark:text-slate-400 font-chinese leading-relaxed">
                                        {g.explanation}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </ResultCard>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResult;
