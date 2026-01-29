import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Write diagnostic
    try {
      const payload = {
        time: Date.now(),
        env: { mode: import.meta.env.MODE, base: import.meta.env.BASE_URL },
        error: { message: error.message, stack: error.stack },
        componentStack: errorInfo.componentStack,
      };
      localStorage.setItem('flow:diagnostic', JSON.stringify(payload));
      (window as any).__FLOW_LAST_ERROR = payload;
      console.error('[FLOW][fatal][boundary]', payload);
    } catch (e) {
      console.error('[FLOW][fatal][boundary]', error);
    }
  }

  render() {
    if (this.state.hasError) {
      // Remove splash
      try {
        const s = document.getElementById('splash-fallback');
        if (s) s.remove();
      } catch {}

      let diag = '';
      try {
        diag = localStorage.getItem('flow:diagnostic') || '';
      } catch {}

      const message = this.state.error?.message || 'Unknown error';

      return (
        <div style={{
          position: 'fixed',
          inset: '16px',
          margin: 0,
          padding: '20px',
          borderRadius: '12px',
          background: 'linear-gradient(180deg,#fff7f6,#fff)',
          color: '#1a1a1a',
          boxShadow: '0 10px 30px rgba(10,10,10,0.12)',
          zIndex: 99999,
          fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
          maxWidth: '820px',
          left: '50%',
          transform: 'translateX(-50%)',
        }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: '#ffebe6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px'
            }}>⚠️</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, marginBottom: '6px' }}>Application error — UI failed to initialize</div>
              <div style={{
                fontSize: '13px',
                color: '#333',
                lineHeight: 1.3,
                maxHeight: '6.6em',
                overflow: 'auto'
              }}>{String(message).replace(/</g, '&lt;')}</div>
              <div style={{
                marginTop: '10px',
                fontSize: '13px',
                color: '#666'
              }}>Open DevTools → Console and paste the diagnostic (copied to clipboard).</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginLeft: '12px' }}>
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(diag);
                    const btn = document.querySelector('#__flow_copy_diag') as HTMLButtonElement;
                    if (btn) btn.textContent = 'Copied';
                  } catch {
                    const btn = document.querySelector('#__flow_copy_diag') as HTMLButtonElement;
                    if (btn) btn.textContent = 'Copy failed';
                  }
                }}
                id="__flow_copy_diag"
                style={{
                  background: '#ff5c00',
                  color: 'white',
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Copy diagnostic
              </button>
              <button
                onClick={() => location.reload(true)}
                style={{
                  background: 'transparent',
                  border: '1px solid #ddd',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Hard reload
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}