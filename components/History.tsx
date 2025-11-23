import React from 'react';
import { HistoryItem } from '../types';

interface HistoryProps {
  history: HistoryItem[];
  onSelectItem: (item: HistoryItem) => void;
  onRemoveItem: (id: string) => void;
  onClearHistory: () => void;
}

const History: React.FC<HistoryProps> = ({ history, onSelectItem, onRemoveItem, onClearHistory }) => {
  if (history.length === 0) {
    return (
        <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-sm">
            暂无历史记录
        </div>
    );
  }

  return (
    <div className="flex flex-col max-h-80">
      <div className="flex justify-between items-center px-4 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-850">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">最近分析</span>
          <button
              onClick={onClearHistory}
              className="text-xs text-slate-400 hover:text-red-500 transition-colors duration-200"
          >
              清空
          </button>
      </div>
      <ul className="overflow-y-auto py-2">
        {history.map((item) => (
          <li 
              key={item.id} 
              className="group flex justify-between items-center px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors duration-200 cursor-pointer"
              onClick={() => onSelectItem(item)}
          >
            <div className="flex-grow min-w-0 pr-4">
                <p className="text-sm text-slate-700 dark:text-slate-300 truncate font-medium">{item.sentence}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                    {item.result.components.length} 个成分 • {item.result.clauses.length} 个从句
                </p>
            </div>
            <button 
              onClick={(e) => {
                  e.stopPropagation();
                  onRemoveItem(item.id);
              }}
              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200"
              aria-label="Remove"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default History;