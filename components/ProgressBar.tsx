import React from 'react';

interface ProgressBarProps {
  isLoading: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ isLoading }) => {
  return (
    <div
      className={`w-full h-1.5 mt-2 transition-opacity duration-500 ease-in-out ${isLoading ? 'opacity-100' : 'opacity-0'}`}
      aria-hidden="true"
    >
        <div className="relative w-full h-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className={`absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-transparent via-sky-500 to-transparent rounded-full ${isLoading ? 'animate-[loading_1.5s_ease-in-out_infinite] motion-reduce:animate-none' : ''}`}></div>
        </div>
    </div>
  );
};

export default ProgressBar;