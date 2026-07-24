import React, { useState, useEffect } from 'react';
import AuthPage from './components/AuthPage';
import MainApp from './components/MainApp';
import Toast from './components/Toast';

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('cs_token') || '');
  const [toast, setToast] = useState({ show: false, msg: '', sub: '', icon: '🛡️' });

  const showToast = (msg, sub = '', icon = '🛡️') => {
    setToast({ show: true, msg, sub, icon });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3500);
  };

  const handleLogin = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('cs_token', authToken);
    showToast(`Welcome back, ${userData.firstName}! 🎉`, 'Your career guardian is ready', '🛡️');
  };

  const handleLogout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('cs_token');
    showToast('See you soon! Keep grinding! 💪', 'Shieldy will miss you', '👋');
  };

  // Auto-login if token exists
  useEffect(() => {
    if (token && !user) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(r => r.json())
        .then(data => {
          if (data.user) setUser(data.user);
          else { setToken(''); localStorage.removeItem('cs_token'); }
        })
        .catch(() => { setToken(''); localStorage.removeItem('cs_token'); });
    }
  }, [token]);

  return (
    <>
      <Toast toast={toast} />
      {!user ? (
        <AuthPage onLogin={handleLogin} showToast={showToast} />
      ) : (
        <MainApp user={user} setUser={setUser} token={token} onLogout={handleLogout} showToast={showToast} />
      )}
    </>
  );
}
