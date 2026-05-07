import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * React Error Boundary — catches any render/lifecycle errors inside the React tree.
 * Displays a visible fallback UI with the full error stack trace.
 * Prevents the app from showing a blank white screen on uncaught React errors.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999999,
            backgroundColor: '#0A0A0B',
            color: '#ff6b6b',
            padding: '24px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: '14px',
            overflow: 'auto',
          }}
        >
          <div
            style={{
              maxWidth: '600px',
              margin: '0 auto',
              paddingTop: '40px',
            }}
          >
            <div
              style={{
                background: 'rgba(255, 59, 48, 0.1)',
                border: '1px solid rgba(255, 59, 48, 0.3)',
                borderRadius: '16px',
                padding: '24px',
                marginBottom: '20px',
              }}
            >
              <h1
                style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  color: '#ff6b6b',
                  margin: '0 0 8px 0',
                }}
              >
                ⚠ Terjadi Kesalahan
              </h1>
              <p
                style={{
                  color: 'rgba(255,255,255,0.5)',
                  margin: '0 0 16px 0',
                  fontSize: '13px',
                }}
              >
                Aplikasi mengalami error. Coba muat ulang atau hubungi developer.
              </p>
              <button
                onClick={() => window.location.reload()}
                style={{
                  background: '#ff3b30',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 24px',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                Muat Ulang Aplikasi
              </button>
            </div>

            <div
              style={{
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '12px',
              }}
            >
              <h2
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.4)',
                  margin: '0 0 8px 0',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Error Message
              </h2>
              <pre
                style={{
                  margin: 0,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                  color: '#ff6b6b',
                  fontSize: '12px',
                  lineHeight: 1.5,
                }}
              >
                {this.state.error?.message || 'Unknown error'}
              </pre>
            </div>

            <details
              style={{
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '12px',
                padding: '16px',
              }}
            >
              <summary
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.4)',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Stack Trace
              </summary>
              <pre
                style={{
                  marginTop: '12px',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                  color: 'rgba(255,255,255,0.3)',
                  fontSize: '11px',
                  lineHeight: 1.6,
                }}
              >
                {this.state.error?.stack || 'No stack trace available'}
                {'\n\n--- Component Stack ---\n'}
                {this.state.errorInfo?.componentStack || 'N/A'}
              </pre>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
