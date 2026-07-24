import React from 'react';

const toastStyle = {
  position: 'fixed', top: 24, right: 24, zIndex: 9999,
  background: 'white', borderLeft: '4px solid var(--teal)', borderRadius: 14,
  padding: '14px 20px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
  display: 'flex', alignItems: 'center', gap: 12,
  maxWidth: 320, transition: 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)',
};

export default function Toast({ toast }) {
  return (
    <div style={{
      ...toastStyle,
      transform: toast.show ? 'translateX(0)' : 'translateX(140%)',
    }}>
      <span style={{ fontSize: '1.4rem' }}>{toast.icon}</span>
      <div>
        <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--navy)' }}>{toast.msg}</div>
        {toast.sub && <div style={{ fontSize: '0.75rem', color: '#8A90AA', fontWeight: 600 }}>{toast.sub}</div>}
      </div>
    </div>
  );
}
