import React, { useState } from 'react';
import { AnalysisResult as AnalysisResultType } from '../types';
import ResultCard from './ResultCard';

interface AnalysisResultProps {
  analysisResult: AnalysisResultType | null;
  isLoading: boolean;
  error: string | null;
  isInitialState: boolean;
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

const AnalysisResult: React.FC<AnalysisResultProps> = ({ analysisResult, isLoading, error, isInitialState }) => {
  const [activeSegment, setActiveSegment] = useState<number | null>(null);

  if (isLoading) {
    return (
        <div className="w-full max-w-3xl mx-auto px-4 space-y-6 mt-12 pb-20">
            <div className="text-center mb-8 space-y-3">
                <div className="inline-block px-3 py-1 bg-sky-50 dark:bg-sky-900/30 rounded-full border border-sky-100 dark:border-sky-800">
                    <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 tracking-widest uppercase animate-pulse">Processing Syntactic Flow</span>
                </div>
                <h2 className="text-xl font-chinese font-medium text-slate-400">正在通过 AI 深度拆解句法结构...</h2>
            </div>
            <SkeletonCard />
            <SkeletonCard />
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
        <h3 className="text-rose-800 dark:text-rose-300 font-bold mb-1">分析中断</h3>
        <p className="text-rose-600 dark:text-rose-400 text-sm font-chinese">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-4 px-4 py-1.5 text-xs font-bold text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors">重试</button>
      </div>
    );
  }

  if (!analysisResult) return null;

  return (
    <div className="w-full max-w-3xl mx-auto px-4 space-y-10 mt-12 pb-24 animate-fade-in">
      
      {/* Visual Breakdown Header: Recognition over Recall */}
      <div className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
            <div className="w-2 h-2 bg-sky-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-black tracking-[0.2em] text-slate-400 dark:text-slate-500 uppercase">Visual Breakdown</span>
        </div>
        <div className="flex flex-wrap gap-2 text-xl md:text-2xl font-serif leading-relaxed">
          {analysisResult.components.map((c, i) => (
            <span 
                key={i} 
                onMouseEnter={() => setActiveSegment(i)}
                onMouseLeave={() => setActiveSegment(null)}
                className={`px-1.5 py-0.5 rounded-lg ring-1 transition-all duration-300 cursor-default ${activeSegment === i ? 'scale-105' : ''} ${colorMap[i % 6]}`}
            >
              {c.text}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Component Detailed Analysis */}
        <ResultCard title="成分精解" icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {analysisResult.components.map((c, i) => (
                    <div 
                        key={i} 
                        className={`p-4 rounded-2xl border transition-all duration-300 ${activeSegment === i ? 'bg-sky-50 border-sky-200 dark:bg-sky-900/20 dark:border-sky-500/30' : 'bg-slate-50/50 dark:bg-slate-800/30 border-transparent hover:border-slate-200 dark:hover:border-slate-700'}`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ring-1 ${colorMap[i % 6]}`}>
                                {c.part}
                            </span>
                        </div>
                        <p className="text-slate-800 dark:text-slate-100 font-serif leading-relaxed">{c.text}</p>
                    </div>
                ))}
            </div>
        </ResultCard>

        {/* Clause Logic */}
        {analysisResult.clauses.length > 0 && (
            <ResultCard title="从句逻辑" icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}>
                <div className="space-y-6">
                    {analysisResult.clauses.map((c, i) => (
                        <div key={i} className="group flex gap-4">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 flex items-center justify-center text-xs font-black">{i+1}</div>
                            <div className="flex-grow pt-1">
                                <h4 className="font-serif text-lg text-slate-800 dark:text-slate-100 mb-1">"{c.text}"</h4>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded uppercase tracking-widest font-bold">{c.type}</span>
                                </div>
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-chinese leading-relaxed">{c.explanation}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </ResultCard>
        )}

        {/* Error Mitigation */}
        <ResultCard title="语法反馈" icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}>
            {analysisResult.grammarCheck.length === 0 ? (
                <div className="flex flex-col items-center py-6 text-emerald-500/60">
                    <svg className="w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <p className="font-chinese tracking-widest text-sm uppercase">Flawless Sentence Structure</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {analysisResult.grammarCheck.map((g, i) => (
                        <div key={i} className="bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-2xl p-5">
                            <div className="flex flex-wrap gap-4 mb-3">
                                <div className="flex-1">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-rose-400 mb-1 block">Original</span>
                                    <p className="font-serif text-slate-400 line-through">{g.original}</p>
                                </div>
                                <div className="flex-1">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-1 block">Refined</span>
                                    <p className="font-serif text-slate-800 dark:text-slate-100 font-medium">{g.correction}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2 text-sm text-slate-500 dark:text-slate-400 font-chinese border-t border-rose-100/50 dark:border-rose-900/20 pt-3 mt-3">
                                <svg className="w-4 h-4 mt-0.5 opacity-50 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                                {g.explanation}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </ResultCard>
      </div>
    </div>
  );
};

export default AnalysisResult;