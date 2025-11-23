import React from 'react';

interface HeaderProps {
    isDark: boolean;
    toggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ isDark, toggleTheme }) => {
  return (
    <header className="flex flex-row justify-between items-center px-4 py-6 md:py-8 max-w-3xl mx-auto w-full">
      <div className="flex items-center gap-3 md:gap-4">
        {/* Logo Icon */}
        <div className="relative flex-shrink-0 flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 shadow-lg shadow-sky-500/20 text-white">
           <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 md:w-7 md:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
           </svg>
        </div>
        
        <div className="flex flex-col">
            <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                SentenceFlow
                </h1>
                 <span className="px-1.5 py-0.5 text-[10px] md:text-xs font-bold tracking-wide text-sky-600 dark:text-sky-300 bg-sky-50 dark:bg-sky-900/30 rounded-md border border-sky-100 dark:border-sky-800/50">
                  句流
                </span>
            </div>
            <p className="text-xs md:text-sm text-slate-400 dark:text-slate-500 font-medium mt-0.5">
                AI 驱动的英语句法分析助手
            </p>
        </div>
      </div>
      
      <button 
        onClick={toggleTheme}
        className="p-2.5 rounded-xl text-slate-400 hover:text-sky-500 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all duration-300 focus:outline-none ring-1 ring-transparent focus:ring-slate-200 dark:focus:ring-slate-700"
        aria-label="Toggle Theme"
      >
        {isDark ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
        ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
        )}
      </button>
    </header>
  );
};

export default Header;