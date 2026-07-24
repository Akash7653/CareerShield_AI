import React, { useState } from 'react';
import { GuardianSVG } from './GuardianSVG';

const AVATARS = ['🦊', '🐺', '🦁', '🐯', '🦅', '🐉'];
const GOALS = ['Land my first job', 'Switch careers', 'Get promoted', 'Freelance', 'Startup founder', 'Study abroad'];

export default function AuthPage({ onLogin, showToast }) {
  const [tab, setTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [speech, setSpeech] = useState("I'm your Career Guardian — battle-ready AI to help you win your dream job! 🛡️⚡");

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({
    firstName: '', lastName: '', email: '', password: '', avatar: '🦊', careerGoal: ''
  });
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);

  const validate = (data, isSignup) => {
    const e = {};
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) e.email = 'Enter a valid email.';
    if (!data.password || data.password.length < 8) e.password = 'Password must be 8+ characters.';
    if (isSignup && !data.firstName.trim()) e.firstName = 'First name is required.';
    return e;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const errs = validate(loginData, false);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });
      const data = await res.json();
      if (!res.ok) { setErrors({ general: data.error }); setLoading(false); return; }
      onLogin(data.user, data.token);
    } catch {
      setErrors({ general: 'Network error. Please try again.' });
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const errs = validate(signupData, true);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupData),
      });
      const data = await res.json();
      if (!res.ok) { setErrors({ general: data.error }); setLoading(false); return; }
      onLogin(data.user, data.token);
    } catch {
      setErrors({ general: 'Network error. Please try again.' });
      setLoading(false);
    }
  };

  const s = {
    page: { minHeight: '100vh', display: 'flex', alignItems: 'stretch' },
    left: {
      width: '44%', background: 'linear-gradient(145deg,#1E2D5A 0%,#2A3B78 45%,#1a1a5e 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '48px 44px', position: 'relative', overflow: 'hidden',
    },
    brand: {
      fontFamily: "'Boogaloo', cursive", fontSize: '1.9rem', color: 'white',
      display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, position: 'relative', zIndex: 1,
    },
    badge: {
      background: 'linear-gradient(135deg,#6EDBB0,#2EC4A0)', color: 'white',
      fontSize: '0.6rem', fontFamily: "'Nunito', sans-serif", fontWeight: 800,
      letterSpacing: 1, padding: '2px 7px', borderRadius: 20, textTransform: 'uppercase',
    },
    buddyWrap: { position: 'relative', zIndex: 1, marginBottom: 20, animation: 'buddy-float 3.5s ease-in-out infinite' },
    speech: {
      background: 'rgba(255,255,255,0.1)', border: '1.5px solid rgba(255,255,255,0.2)',
      borderRadius: '18px 18px 18px 5px', padding: '12px 18px', color: 'white',
      fontSize: '0.84rem', fontWeight: 600, lineHeight: 1.55, maxWidth: 290,
      position: 'relative', zIndex: 1, marginBottom: 28, backdropFilter: 'blur(10px)',
    },
    perks: { width: '100%', position: 'relative', zIndex: 1 },
    perk: {
      display: 'flex', alignItems: 'center', gap: 11,
      background: 'rgba(255,255,255,0.07)', borderRadius: 11,
      padding: '9px 13px', marginBottom: 8, border: '1px solid rgba(255,255,255,0.1)',
    },
    right: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 48px', background: 'white' },
    formBox: { width: '100%', maxWidth: 430 },
    tabs: { display: 'flex', background: 'var(--body-bg)', borderRadius: 14, padding: 4, marginBottom: 28 },
    tabBtn: (active) => ({
      flex: 1, padding: 10, border: 'none', borderRadius: 10,
      fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
      background: active ? 'white' : 'transparent',
      color: active ? 'var(--purple)' : '#8A90AA',
      boxShadow: active ? '0 2px 12px rgba(124,111,205,0.18)' : 'none',
      transition: 'all 0.25s',
    }),
    formTitle: { fontFamily: "'Boogaloo', cursive", fontSize: '1.9rem', color: 'var(--navy)', marginBottom: 5 },
    formSub: { fontSize: '0.84rem', color: '#8A90AA', fontWeight: 600, marginBottom: 24 },
    label: { display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--navy)', marginBottom: 5, letterSpacing: '0.3px', textTransform: 'uppercase' },
    input: (err) => ({
      width: '100%', padding: '11px 15px', borderRadius: 12,
      border: `1.5px solid ${err ? '#FFB3CB' : '#E8E4F8'}`,
      fontFamily: "'Quicksand', sans-serif", fontSize: '0.9rem', fontWeight: 600,
      color: 'var(--dark)', background: '#FAFAF8', outline: 'none',
      boxShadow: err ? '0 0 0 3px rgba(255,179,203,0.2)' : 'none',
    }),
    err: { fontSize: '0.73rem', color: '#E05580', fontWeight: 700, marginTop: 4 },
    submitBtn: {
      width: '100%', padding: 13, background: 'linear-gradient(135deg,var(--purple),#A08FFF)',
      color: 'white', border: 'none', borderRadius: 13,
      fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: '0.98rem',
      boxShadow: '0 5px 18px rgba(124,111,205,0.33)', marginBottom: 14,
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      opacity: loading ? 0.8 : 1,
    },
  };

  return (
    <div style={s.page}>
      {/* LEFT PANEL */}
      <div style={s.left}>
        <div style={{ position: 'absolute', top: -100, right: -100, width: 340, height: 340, borderRadius: '50%', background: 'radial-gradient(circle,rgba(184,240,216,0.12),transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -60, width: 260, height: 260, borderRadius: '50%', background: 'radial-gradient(circle,rgba(0,220,200,0.08),transparent 70%)' }} />

        <div style={s.brand}>
          <span>⚔️</span> CareerShield <span style={s.badge}>AI</span>
        </div>

        <div style={s.buddyWrap}>
          <GuardianSVG size={160} />
        </div>

        <div style={s.speech}>{speech}</div>

        <div style={s.perks}>
          {[
            ['🛡️', 'Battle-hardened career protection'],
            ['🎯', 'AI-powered precision targeting'],
            ['⚡', 'Real-time scam detection'],
            ['🔰', 'Your 24/7 career guardian'],
          ].map(([icon, text]) => (
            <div key={text} style={s.perk}>
              <span>{icon}</span>
              <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.8rem', fontWeight: 600 }}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div style={s.right}>
        <div style={s.formBox}>
          <div style={s.tabs}>
            <button style={s.tabBtn(tab === 'login')} onClick={() => { setTab('login'); setErrors({}); }}>Sign In</button>
            <button style={s.tabBtn(tab === 'signup')} onClick={() => { setTab('signup'); setErrors({}); }}>Create Account</button>
          </div>

          {tab === 'login' ? (
            <form onSubmit={handleLogin}>
              <div style={s.formTitle}>Welcome back! 👋</div>
              <div style={s.formSub}>Your Guardian is standing by — let's get to work.</div>

              {errors.general && <div style={{ ...s.err, background: '#FFF0F3', padding: '10px 14px', borderRadius: 10, marginBottom: 16 }}>{errors.general}</div>}

              <div style={{ marginBottom: 16 }}>
                <label style={s.label}>Email</label>
                <input style={s.input(errors.email)} type="email" placeholder="you@example.com"
                  value={loginData.email} onChange={e => setLoginData({ ...loginData, email: e.target.value })} />
                {errors.email && <div style={s.err}>{errors.email}</div>}
              </div>

              <div style={{ marginBottom: 16, position: 'relative' }}>
                <label style={s.label}>Password</label>
                <input style={{ ...s.input(errors.password), paddingRight: 44 }}
                  type={showPw ? 'text' : 'password'} placeholder="••••••••"
                  value={loginData.password} onChange={e => setLoginData({ ...loginData, password: e.target.value })} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  style={{ position: 'absolute', right: 12, top: 38, background: 'none', border: 'none', cursor: 'pointer', color: '#B0B8CC' }}>
                  {showPw ? '🙈' : '👁️'}
                </button>
                {errors.password && <div style={s.err}>{errors.password}</div>}
              </div>

              <button type="submit" style={s.submitBtn} disabled={loading}>
                {loading ? <span style={{ width: 18, height: 18, border: '2.5px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} /> : '⚔️ Enter the Arena'}
              </button>

              <div style={{ textAlign: 'center', fontSize: '0.81rem', color: '#8A90AA', fontWeight: 600 }}>
                New to CareerShield?{' '}
                <span style={{ color: 'var(--purple)', fontWeight: 800, cursor: 'pointer' }} onClick={() => setTab('signup')}>Create your account →</span>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSignup}>
              <div style={s.formTitle}>Join CareerShield! 🛡️</div>
              <div style={s.formSub}>Your Guardian awaits — let's set up your profile!</div>

              {errors.general && <div style={{ ...s.err, background: '#FFF0F3', padding: '10px 14px', borderRadius: 10, marginBottom: 16 }}>{errors.general}</div>}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={s.label}>First Name</label>
                  <input style={s.input(errors.firstName)} placeholder="Alex"
                    value={signupData.firstName} onChange={e => setSignupData({ ...signupData, firstName: e.target.value })} />
                  {errors.firstName && <div style={s.err}>{errors.firstName}</div>}
                </div>
                <div>
                  <label style={s.label}>Last Name</label>
                  <input style={s.input()} placeholder="Johnson"
                    value={signupData.lastName} onChange={e => setSignupData({ ...signupData, lastName: e.target.value })} />
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={s.label}>Email</label>
                <input style={s.input(errors.email)} type="email" placeholder="you@example.com"
                  value={signupData.email} onChange={e => setSignupData({ ...signupData, email: e.target.value })} />
                {errors.email && <div style={s.err}>{errors.email}</div>}
              </div>

              <div style={{ marginBottom: 16, position: 'relative' }}>
                <label style={s.label}>Password (8+ chars)</label>
                <input style={{ ...s.input(errors.password), paddingRight: 44 }}
                  type={showPw ? 'text' : 'password'} placeholder="••••••••"
                  value={signupData.password} onChange={e => setSignupData({ ...signupData, password: e.target.value })} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  style={{ position: 'absolute', right: 12, top: 38, background: 'none', border: 'none', cursor: 'pointer', color: '#B0B8CC' }}>
                  {showPw ? '🙈' : '👁️'}
                </button>
                {errors.password && <div style={s.err}>{errors.password}</div>}
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={s.label}>Career Goal</label>
                <select style={{ ...s.input(), appearance: 'none' }}
                  value={signupData.careerGoal} onChange={e => setSignupData({ ...signupData, careerGoal: e.target.value })}>
                  <option value="">Select your mission...</option>
                  {GOALS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={s.label}>Choose Your Avatar</label>
                <div style={{ display: 'flex', gap: 7, marginTop: 6, flexWrap: 'wrap' }}>
                  {AVATARS.map(av => (
                    <div key={av} onClick={() => setSignupData({ ...signupData, avatar: av })}
                      style={{
                        width: 38, height: 38, borderRadius: '50%', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: '1.2rem', cursor: 'pointer',
                        border: `2.5px solid ${signupData.avatar === av ? 'var(--purple)' : 'transparent'}`,
                        background: signupData.avatar === av ? 'var(--lavender)' : '#F0EEF8',
                        transition: 'all 0.2s',
                      }}>
                      {av}
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" style={s.submitBtn} disabled={loading}>
                {loading ? <span style={{ width: 18, height: 18, border: '2.5px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} /> : '⚔️ Activate My Guardian'}
              </button>

              <div style={{ textAlign: 'center', fontSize: '0.81rem', color: '#8A90AA', fontWeight: 600 }}>
                Already have an account?{' '}
                <span style={{ color: 'var(--purple)', fontWeight: 800, cursor: 'pointer' }} onClick={() => setTab('login')}>Sign in →</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
