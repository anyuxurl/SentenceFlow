import React from 'react';

interface ResultCardProps {
  title: string;
  children: React.ReactNode;
  icon: React.ReactNode;
}

const ResultCard: React.FC<ResultCardProps> = ({ title, icon, children }) => {
  return (
    <div className="group bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-[2rem] shadow-sm hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none transition-all duration-500 overflow-hidden">
      <div className="px-8 py-6 flex items-center justify-between border-b border-slate-50 dark:border-slate-800/50">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-50 dark:bg-sky-900/30 text-sky-500 dark:text-sky-400 rounded-xl group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <h3 className="text-sm font-black font-chinese tracking-[0.2em] text-slate-800 dark:text-slate-200 uppercase">{title}</h3>
        </div>
      </div>
      <div className="p-8">
        {children}
      </div>
    </div>
  );
};

export default ResultCard;