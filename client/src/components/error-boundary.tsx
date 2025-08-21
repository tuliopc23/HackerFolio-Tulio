import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-lumon-dark text-text-cyan flex items-center justify-center p-6">
          <div className="pane-border rounded-lg p-8 max-w-lg w-full">
            <div className="text-center">
              <div className="text-terminal-red text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-magenta-bright mb-4">System Error</h2>
              <p className="text-text-soft mb-6">
                An unexpected error occurred. The terminal has been compromised.
              </p>
              <div className="bg-lumon-bg border border-terminal-red rounded p-4 mb-6">
                <pre className="text-xs text-terminal-red overflow-auto">
                  {this.state.error?.message || 'Unknown error'}
                </pre>
              </div>
              <button
                onClick={() => this.setState({ hasError: false, error: undefined })}
                className="px-6 py-2 bg-magenta-bright text-lumon-dark rounded hover:bg-magenta-soft transition-colors font-medium"
              >
                Restart Terminal
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;