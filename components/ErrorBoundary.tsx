import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Last resort for a render-time exception. Without it any thrown error unmounts
 * the whole tree and leaves a blank white page with no indication that anything
 * went wrong — and no way back other than the browser's reload button.
 *
 * Analysis failures do not reach here; those are handled as state in App and
 * rendered by AnalysisResult. This is for genuine bugs.
 */
class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Unhandled render error', error, info.componentStack);
  }

  private handleReset = () => {
    this.setState({ error: null });
  };

  private handleClearData = () => {
    // Corrupt persisted state is the most likely thing a user can self-fix:
    // a malformed history entry will re-throw on every reload otherwise.
    try {
      localStorage.removeItem('sentenceFlowHistory');
      localStorage.removeItem('sentenceFlowCustomConfig');
      localStorage.removeItem('sentenceFlowUseCustom');
    } catch {
      /* nothing better to do here */
    }
    window.location.reload();
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-slate-950" role="alert">
        <div className="w-full max-w-md text-center space-y-5">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-100 dark:bg-rose-900/30 text-rose-500 flex items-center justify-center">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold font-chinese text-slate-800 dark:text-slate-100">页面出错了</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-chinese leading-relaxed">
              这是一个程序缺陷，不是你的操作问题。可以先重试；如果反复出现，清除本地数据通常能解决。
            </p>
          </div>
          <pre className="text-left text-[11px] text-slate-400 dark:text-slate-600 bg-slate-100 dark:bg-slate-900 rounded-xl p-3 overflow-x-auto whitespace-pre-wrap break-words">
            {this.state.error.message}
          </pre>
          <div className="flex gap-3 justify-center">
            <button
              onClick={this.handleReset}
              className="px-5 py-2 bg-sky-500 hover:bg-sky-600 text-white text-sm font-bold rounded-xl transition-colors"
            >
              重试
            </button>
            <button
              onClick={this.handleClearData}
              className="px-5 py-2 text-sm font-bold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors font-chinese"
            >
              清除本地数据并刷新
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
