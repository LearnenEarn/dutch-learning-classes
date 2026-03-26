import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Catches unhandled errors in the React component tree and displays a friendly error page.
 */
export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center p-6">
          <div className="max-w-md text-center">
            <div className="text-6xl mb-4">😵</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Oeps! Er ging iets mis
            </h1>
            <p className="text-gray-600 mb-2">
              Something went wrong. Don't worry — your progress is saved.
            </p>
            <p className="text-sm text-gray-400 mb-6 font-mono">
              {this.state.error?.message}
            </p>
            <button
              onClick={this.handleReset}
              className="px-6 py-3 bg-[#FF6B00] text-white rounded-xl font-semibold hover:bg-[#E65C00] transition-colors"
            >
              Terug naar Dashboard
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
