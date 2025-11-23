import React from 'react';

interface ResultCardProps {
  title: string;
  children: React.ReactNode;
  icon: React.ReactNode;
}

const ResultCard: React.FC<ResultCardProps> = ({ title, icon, children }) => {
  return (
    <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700/50 rounded-2xl shadow-sm hover:shadow-md dark:shadow-none overflow-hidden transition-all duration-300">
      <div className="p-4 border-b border-slate-100 dark:border-slate-700/50 flex items-center space-x-3 bg-slate-50/50 dark:bg-slate-800/30">
        <div className="text-sky-500 dark:text-sky-400">{icon}</div>
        <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">{title}</h3>
      </div>
      <div className="p-5 text-slate-600 dark:text-slate-300 text-sm md:text-base leading-relaxed">
        {children}
      </div>
    </div>
  );
};

export default ResultCard;