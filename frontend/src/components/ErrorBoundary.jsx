import React, { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
          background: 'var(--body-bg)',
          fontFamily: "'Quicksand', sans-serif"
        }}>
          <div style={{
            maxWidth: 500,
            width: '100%',
            background: 'white',
            borderRadius: 20,
            padding: '40px',
            boxShadow: '0 8px 32px rgba(124,111,205,0.15)',
            border: '2px solid var(--lavender)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: 16 }}>🦉</div>
            <h2 style={{
              fontFamily: "'Boogaloo', cursive",
              fontSize: '1.8rem',
              color: 'var(--navy)',
              marginBottom: 12
            }}>
              Oops! Something went wrong
            </h2>
            <p style={{
              fontSize: '0.95rem',
              color: '#5A6488',
              lineHeight: 1.6,
              marginBottom: 24
            }}>
              Your Guardian encountered an unexpected error. Don't worry, your progress is safe!
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div style={{
                background: '#FFF0EE',
                border: '1.5px solid #FFCCBB',
                borderRadius: 12,
                padding: '16px',
                marginBottom: 24,
                textAlign: 'left'
              }}>
                <div style={{
                  fontWeight: 700,
                  color: '#C0405A',
                  fontSize: '0.8rem',
                  marginBottom: 8
                }}>
                  Error Details (Development Mode):
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  color: '#666',
                  fontFamily: 'monospace',
                  wordBreak: 'break-all'
                }}>
                  {this.state.error.toString()}
                </div>
              </div>
            )}
            
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                onClick={this.handleRetry}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg,var(--purple),#A08FFF)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 12,
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(124,111,205,0.3)'
                }}
              >
                🔄 Try Again
              </button>
              <button
                onClick={() => window.location.href = '/'}
                style={{
                  padding: '12px 24px',
                  background: 'white',
                  color: 'var(--purple)',
                  border: '2px solid var(--lavender)',
                  borderRadius: 12,
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                🏠 Go Home
              </button>
            </div>
            
            <p style={{
              fontSize: '0.75rem',
              color: '#8A90AA',
              marginTop: 24,
              fontWeight: 600
            }}>
              Need help? Contact support or refresh the page.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
