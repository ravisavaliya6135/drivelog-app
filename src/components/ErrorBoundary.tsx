import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Catches render-time React errors anywhere in the tree and shows a calm
 * recovery screen instead of a white screen. Local data (IndexedDB) is
 * untouched by render errors, so a reload always recovers the user's logs.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Console-only by design: no external error-tracking service = no data leaves the device.
    console.error('[DriveHours] UI error caught by boundary:', error, errorInfo.componentStack);
  }

  handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] flex items-center justify-center p-4">
          <div className="app-card-elevated p-6 sm:p-8 max-w-md w-full text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center mx-auto border border-amber-500/30">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <h1 className="text-lg font-extrabold text-slate-900 dark:text-white">Something went wrong</h1>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Your driving logs are safe on this device. Reload the app to continue.
            </p>
            {this.state.error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-left">
                <p className="text-[11px] font-mono text-red-600 dark:text-red-400 break-words">
                  {this.state.error.message || String(this.state.error)}
                </p>
              </div>
            )}
            <button
              type="button"
              onClick={this.handleReload}
              className="btn-primary w-full min-h-[56px] h-14 text-sm font-extrabold shadow-teal"
            >
              Reload DriveHours
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
