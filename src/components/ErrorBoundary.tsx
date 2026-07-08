import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import { Sigma, RotateCcw, Home } from 'lucide-react';

interface Props { children: ReactNode }
interface State { hasError: boolean; message: string }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[TensoraMax Studio] Uncaught error:', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-4 text-center">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary text-cream shadow-lg shadow-primary/25">
          <Sigma size={26} strokeWidth={2.2} />
        </div>
        <h1 className="mt-6 font-display text-2xl font-semibold text-ink">Something went wrong</h1>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">
          An unexpected error occurred in the Studio. Reloading usually fixes it — if not, our team has been notified.
        </p>
        {this.state.message && (
          <code className="mt-4 max-w-md truncate rounded-lg border border-line bg-surface px-3 py-1.5 text-xs text-danger">{this.state.message}</code>
        )}
        <div className="mt-7 flex gap-3">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark"
          >
            <RotateCcw size={15} /> Reload
          </button>
          <a href="/" className="flex items-center gap-2 rounded-xl border border-line bg-surface px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-primary/40">
            <Home size={15} className="text-primary" /> Go Home
          </a>
        </div>
        <p className="mt-10 text-xs text-muted">© {new Date().getFullYear()} TensoraMax Studio</p>
      </div>
    );
  }
}
