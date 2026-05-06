import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
          <div className="rounded-lg border border-border bg-card p-8 text-center shadow-lg max-w-md w-full">
            <h1 className="mb-4 text-2xl font-bold text-destructive">Oops, something went wrong.</h1>
            <p className="mb-6 text-muted-foreground">
              An unexpected error has occurred. We've been notified and are working on a fix.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-md bg-primary px-6 py-2 font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Refresh Page
            </button>
            
            {/* In development, show the error details */}
            {import.meta.env.DEV && (
              <details className="mt-6 text-left p-4 bg-muted rounded-md overflow-auto max-h-48 text-sm">
                <summary className="cursor-pointer font-semibold mb-2">Error Details</summary>
                <p className="text-red-500 mb-2">{this.state.error && this.state.error.toString()}</p>
                <pre className="text-xs">{this.state.errorInfo?.componentStack}</pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
