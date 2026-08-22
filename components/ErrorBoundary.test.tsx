// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { act } from 'react';
import ErrorBoundary from './ErrorBoundary';

/**
 * Worth a real DOM: error boundaries only engage during client rendering, so a
 * static-markup test would silently prove nothing. An error boundary that does
 * not actually catch is worse than not having one.
 */

let container: HTMLDivElement;
let root: Root;

const Boom = (): React.ReactElement => {
  throw new Error('simulated render crash');
};

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  // React logs caught errors to console.error by design; keep the run readable.
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.restoreAllMocks();
});

describe('ErrorBoundary', () => {
  it('renders children untouched when nothing throws', () => {
    act(() => {
      root.render(React.createElement(ErrorBoundary, null, React.createElement('p', null, '正常内容')));
    });
    expect(container.textContent).toContain('正常内容');
    expect(container.textContent).not.toContain('页面出错了');
  });

  it('catches a render-time throw instead of unmounting to a blank page', () => {
    act(() => {
      root.render(React.createElement(ErrorBoundary, null, React.createElement(Boom)));
    });
    expect(container.textContent).toContain('页面出错了');
    expect(container.querySelector('[role="alert"]')).not.toBeNull();
  });

  it('surfaces the error message so a bug report can name it', () => {
    act(() => {
      root.render(React.createElement(ErrorBoundary, null, React.createElement(Boom)));
    });
    expect(container.textContent).toContain('simulated render crash');
  });

  it('offers a recovery path out of the failed state', () => {
    act(() => {
      root.render(React.createElement(ErrorBoundary, null, React.createElement(Boom)));
    });
    const labels = Array.from(container.querySelectorAll('button')).map((b) => b.textContent);
    expect(labels).toContain('重试');
    expect(labels).toContain('清除本地数据并刷新');
  });

  it('clears persisted state when asked, since corrupt storage re-throws every reload', () => {
    // Node 26 ships its own `localStorage` global that is undefined without a
    // CLI flag, and it shadows jsdom's. Install a real in-memory store so the
    // component and the assertions below observe the same one — otherwise the
    // component's try/catch swallows the failure and this test passes vacuously.
    const store = new Map<string, string>();
    const stub = {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
      removeItem: (k: string) => void store.delete(k),
      clear: () => store.clear(),
      key: (i: number) => Array.from(store.keys())[i] ?? null,
      get length() { return store.size; },
    };
    vi.stubGlobal('localStorage', stub);

    stub.setItem('sentenceFlowHistory', '{{ corrupt');
    stub.setItem('sentenceFlowCustomConfig', '{}');
    stub.setItem('sentenceFlowUseCustom', 'true');
    // jsdom has no navigation; the reload call is not what is under test.
    const reload = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { ...window.location, reload },
      writable: true,
    });

    act(() => {
      root.render(React.createElement(ErrorBoundary, null, React.createElement(Boom)));
    });
    const clear = Array.from(container.querySelectorAll('button'))
      .find((b) => b.textContent === '清除本地数据并刷新')!;
    act(() => clear.dispatchEvent(new MouseEvent('click', { bubbles: true })));

    expect(stub.getItem('sentenceFlowHistory')).toBeNull();
    expect(stub.getItem('sentenceFlowCustomConfig')).toBeNull();
    expect(stub.getItem('sentenceFlowUseCustom')).toBeNull();
    expect(reload).toHaveBeenCalled();
  });
});
