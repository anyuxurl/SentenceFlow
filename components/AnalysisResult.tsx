import React from 'react';
import { AnalysisResult as AnalysisResultType } from '../types';
import ResultCard from './ResultCard';

interface AnalysisResultProps {
  analysisResult: AnalysisResultType | null;
  isLoading: boolean;
  error: string | null;
  isInitialState: boolean;
}

const Icons = {
    Components: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
    Clauses: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" /></svg>,
    Grammar: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
}

const SkeletonCard: React.FC = () => (
    <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center space-x-3 mb-6 opacity-50">
            <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
            <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
        </div>
        <div className="space-y-4">
            <div className="flex items-center space-x-4 animate-pulse">
                <div className="h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                <div className="h-5 flex-1 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
            <div className="flex items-center space-x-4 animate-pulse">
                <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                <div className="h-5 flex-1 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
            </div>
            <div className="flex items-center space-x-4 animate-pulse">
                <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                <div className="h-5 flex-1 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
            </div>
        </div>
    </div>
);

const AnalysisResult: React.FC<AnalysisResultProps> = ({ analysisResult, isLoading, error, isInitialState }) => {
  if (isLoading) {
    return (
        <div className="w-full max-w-3xl mx-auto px-4 space-y-6 mt-8 pb-12">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
        </div>
    );
  }

  if (isInitialState) {
    return (
      <div className="text-center p-12 text-slate-400 dark:text-slate-500 transition-colors duration-300">
        <p className="text-lg font-light font-chinese">等待输入...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-2xl mx-auto mt-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-xl text-red-600 dark:text-red-300 text-center animate-fade-in">
        <p><strong>错误：</strong> {error}</p>
      </div>
    );
  }

  if (!analysisResult) {
    return null;
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 space-y-6 mt-8 animate-fade-in pb-12">
      <ResultCard title="句子成分" icon={Icons.Components}>
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4 pt-2">
          {analysisResult.components.map((c, index) => (
            <div key={index} className="relative group bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl p-4 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md hover:border-sky-300/40 dark:hover:border-sky-500/40 transition-all duration-300">
              <div className="absolute -top-3 left-3 z-10">
                  <span className="inline-block px-2 py-0.5 rounded text-xs font-bold font-chinese tracking-widest text-sky-700 dark:text-sky-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 shadow-sm group-hover:border-sky-200 dark:group-hover:border-sky-500/30 transition-colors">
                    {c.part}
                  </span>
              </div>
              <p className="text-slate-800 dark:text-slate-100 text-lg font-serif font-medium leading-relaxed mt-1">
                {c.text}
              </p>
            </div>
          ))}
        </div>
      </ResultCard>

      <ResultCard title="从句分析" icon={Icons.Clauses}>
        <ul className="space-y-5">
          {analysisResult.clauses.map((c, index) => (
            <li key={index} className="relative pl-4 border-l-2 border-slate-200 dark:border-slate-600/50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                 <span className="font-bold font-serif text-slate-700 dark:text-slate-200 text-lg mr-2">"{c.text}"</span>
                 <span className="text-xs font-bold font-chinese tracking-wider text-sky-600 dark:text-sky-400 bg-slate-100 dark:bg-slate-700/50 px-2 py-1 rounded-md self-start sm:self-auto mt-1 sm:mt-0 whitespace-nowrap">{c.type}</span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-chinese">{c.explanation}</p>
            </li>
          ))}
        </ul>
      </ResultCard>

      <ResultCard title="语法检查" icon={Icons.Grammar}>
        {analysisResult.grammarCheck.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-4 text-emerald-500 dark:text-emerald-400">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2 opacity-20" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
            <p className="font-medium text-lg font-chinese">完美！未发现语法问题。</p>
          </div>
        ) : (
          <ul className="space-y-6">
            {analysisResult.grammarCheck.map((g, index) => (
              <li key={index} className="bg-red-50 dark:bg-red-900/10 p-4 rounded-xl border border-red-100 dark:border-red-900/20">
                <div className="grid sm:grid-cols-2 gap-4 mb-3">
                    <div>
                        <span className="text-xs font-bold font-chinese text-red-500 uppercase tracking-wider mb-1 block">原文</span>
                        <p className="line-through font-serif text-slate-500 dark:text-slate-500 decoration-red-400/50">"{g.original}"</p>
                    </div>
                    <div>
                        <span className="text-xs font-bold font-chinese text-emerald-500 uppercase tracking-wider mb-1 block">建议修改</span>
                        <p className="text-slate-800 dark:text-slate-200 font-serif font-medium bg-emerald-100/50 dark:bg-emerald-900/20 px-2 py-0.5 rounded -ml-2 w-fit">"{g.correction}"</p>
                    </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-chinese border-t border-red-100 dark:border-red-900/20 pt-2 mt-2 flex items-start">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 mt-0.5 text-slate-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                    {g.explanation}
                </p>
              </li>
            ))}
          </ul>
        )}
      </ResultCard>
    </div>
  );
};

export default AnalysisResult;