import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Catches render-time React errors anywhere in the tree and shows a calm
 * recovery screen instead of a white screen. Local data (IndexedDB) is
 * untouched by render errors, so a reload always recovers the user's logs.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Console-only by design: no external error-tracking service = no data leaves the device.
    console.error('[DriveLog] UI error caught by boundary:', error, errorInfo.componentStack);
  }

  handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
          <div className="app-card p-8 max-w-sm w-full text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 flex items-center justify-center mx-auto">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">Something went wrong</h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Your driving logs are safe on this device. Reload the app to continue.
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              className="btn-primary w-full h-16 text-base font-bold shadow-teal focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              Reload DriveLog
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
