import React, { useState, useEffect } from 'react';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialUseCustom: boolean;
    initialCustomConfig: {
        apiKey: string;
        baseUrl: string;
        model: string;
    };
    onSave: (useCustom: boolean, config: { apiKey: string; baseUrl: string; model: string }) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, initialUseCustom, initialCustomConfig, onSave }) => {
    const [useCustom, setUseCustom] = useState(initialUseCustom);
    
    // Custom settings state
    const [apiKey, setApiKey] = useState(initialCustomConfig.apiKey);
    const [baseUrl, setBaseUrl] = useState(initialCustomConfig.baseUrl);
    const [model, setModel] = useState(initialCustomConfig.model);

    useEffect(() => {
        if (isOpen) {
            setUseCustom(initialUseCustom);
            setApiKey(initialCustomConfig.apiKey);
            setBaseUrl(initialCustomConfig.baseUrl);
            setModel(initialCustomConfig.model);
        }
    }, [isOpen, initialUseCustom, initialCustomConfig]);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave(useCustom, { apiKey, baseUrl, model });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden transform transition-all scale-100">
                <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 font-chinese">分析设置 / Settings</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                <div className="p-6 space-y-6">
                    {/* Source Toggle */}
                    <div className="p-1 bg-slate-100 dark:bg-slate-800 rounded-xl flex font-chinese text-sm font-medium">
                        <button 
                            onClick={() => setUseCustom(false)}
                            className={`flex-1 py-2 rounded-lg transition-all duration-300 ${!useCustom ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            默认线路 (内置)
                        </button>
                        <button 
                            onClick={() => setUseCustom(true)}
                            className={`flex-1 py-2 rounded-lg transition-all duration-300 ${useCustom ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            自定义配置
                        </button>
                    </div>

                    {!useCustom ? (
                        /* Built-in Mode UI */
                        <div className="py-6 px-4 bg-sky-50/50 dark:bg-sky-900/10 border border-sky-100 dark:border-sky-800/50 rounded-2xl flex flex-col items-center text-center space-y-3">
                            <div className="w-12 h-12 bg-sky-100 dark:bg-sky-800/50 rounded-full flex items-center justify-center text-sky-500 mb-1">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-bold text-sky-800 dark:text-sky-200 font-chinese">已启用内置加速通道</h4>
                                <p className="text-xs text-sky-600/70 dark:text-sky-400/70 mt-1 max-w-[200px] mx-auto font-chinese">
                                    无需配置 API Key 即可直接使用。由开发者提供的共享配额。
                                </p>
                            </div>
                        </div>
                    ) : (
                        /* Custom Mode UI */
                        <div className="space-y-5 animate-fade-in">
                            {/* API Host */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">API URL (Base URL)</label>
                                <input 
                                    type="text" 
                                    value={baseUrl}
                                    onChange={(e) => setBaseUrl(e.target.value)}
                                    placeholder="https://api.openai.com/v1"
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all font-mono text-sm"
                                />
                                <p className="text-[10px] text-slate-400 font-chinese">如果您使用代理或中转服务，请修改此地址。</p>
                            </div>

                            {/* API Key */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">API Key</label>
                                <input 
                                    type="password" 
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    placeholder="sk-..."
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all font-mono text-sm"
                                />
                            </div>

                            {/* Model */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Model Name</label>
                                <input 
                                    type="text" 
                                    value={model}
                                    onChange={(e) => setModel(e.target.value)}
                                    placeholder="gpt-4o-mini"
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all font-mono text-sm"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                    <button 
                        onClick={handleSave}
                        className="px-6 py-2 bg-sky-500 hover:bg-sky-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-sky-500/20 transition-all active:scale-95"
                    >
                        保存设置
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;