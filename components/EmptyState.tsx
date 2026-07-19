import React from 'react';

interface EmptyStateProps {
  sampleSentences: string[];
  onSelectSample: (sentence: string) => void;
}

// The four things a user gets back — each accent color mirrors the matching
// section in the result view (structure=sky, clauses=indigo, grammar=emerald,
// translation=rose) so the empty state teaches the same visual language.
const FEATURES = [
  {
    label: '成分拆解',
    en: 'Components',
    color: 'bg-sky-50 dark:bg-sky-900/30 text-sky-500 dark:text-sky-400',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
    ),
  },
  {
    label: '从句逻辑',
    en: 'Clauses',
    color: 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 dark:text-indigo-400',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
    ),
  },
  {
    label: '语法反馈',
    en: 'Grammar',
    color: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 dark:text-emerald-400',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    ),
  },
  {
    label: '精准翻译',
    en: 'Translation',
    color: 'bg-rose-50 dark:bg-rose-900/30 text-rose-500 dark:text-rose-400',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>
    ),
  },
];

const EmptyState: React.FC<EmptyStateProps> = ({ sampleSentences, onSelectSample }) => {
  return (
    <div className="w-full py-10 md:py-14 animate-fade-in">
      {/* Intro */}
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="font-chinese text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-100 leading-tight tracking-tight">
          读懂每一句英文
        </h2>
        <p className="mt-4 text-base md:text-lg text-slate-500 dark:text-slate-400 font-chinese leading-relaxed">
          输入或粘贴一句英文，AI 为你拆解成分、梳理从句、校对语法，并给出精准中文翻译。
        </p>
      </div>

      {/* What you get */}
      <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3">
        {FEATURES.map((f) => (
          <div
            key={f.label}
            className="flex flex-col items-center text-center gap-2.5 p-4 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800"
          >
            <div className={`p-2.5 rounded-xl ${f.color}`}>{f.icon}</div>
            <p className="text-sm font-bold font-chinese text-slate-700 dark:text-slate-200">{f.label}</p>
          </div>
        ))}
      </div>

      {/* Clickable examples */}
      <div className="mt-12">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 bg-sky-500 rounded-full"></div>
          <span className="text-[10px] font-black tracking-[0.2em] text-slate-400 dark:text-slate-500 font-chinese">试试这些例句</span>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {sampleSentences.map((s, i) => (
            <button
              key={i}
              onClick={() => onSelectSample(s)}
              className="group flex items-center justify-between gap-4 text-left p-4 md:p-5 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 hover:border-sky-500/40 hover:shadow-lg hover:shadow-sky-500/5 transition-all duration-300"
            >
              <span className="font-serif text-base md:text-lg text-slate-700 dark:text-slate-200 leading-snug">{s}</span>
              <span className="flex-shrink-0 text-slate-300 dark:text-slate-600 group-hover:text-sky-500 group-hover:translate-x-0.5 transition-all">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmptyState;
