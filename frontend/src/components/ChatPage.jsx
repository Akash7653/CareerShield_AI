import React, { useState, useRef, useEffect } from 'react';
import { GuardianMini, GuardianSVG } from './GuardianSVG';

const QUICK = [
  { label: '🎯 Interview Tips', q: 'How do I prepare for a tech interview?' },
  { label: '📄 Resume Help', q: 'What makes a resume ATS-friendly?' },
  { label: '💸 Salary Tips', q: 'How do I negotiate my salary effectively?' },
  { label: '🔍 Spot Scams', q: 'How do I identify a fake job offer?' },
  { label: '🚀 Career Switch', q: 'How do I switch careers with no experience?' },
  { label: '💼 LinkedIn Tips', q: 'How do I make my LinkedIn profile stand out?' },
];

const INITIAL_MSG = {
  role: 'aria',
  text: "Hey there! 👋 I'm Aria, your AI career co-pilot. I give real, personalized advice — not canned responses. Ask me anything about your career, resume, interviews, salary, or job hunting! 🦉",
};

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function ChatPage({ token, onClose }) {
  const [msgs, setMsgs] = useState([{ ...INITIAL_MSG, time: new Date() }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const bodyRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [msgs, loading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMsg = async (text) => {
    const q = (text ?? input).trim();
    if (!q || loading) return;
    setInput('');
    setMsgs(m => [...m, { role: 'user', text: q, time: new Date() }]);
    setLoading(true);
    const newHistory = [...history, { role: 'user', text: q }];
    try {
      const res = await fetch('/api/tools/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: q, history: newHistory.slice(-14) }),
      });
      const data = await res.json();
      const reply = data.reply || data.response || data.error || "Hmm, I had a hiccup. Try again!";
      setMsgs(m => [...m, { role: 'aria', text: reply, time: new Date() }]);
      setHistory([...newHistory, { role: 'aria', text: reply }]);
    } catch {
      setMsgs(m => [...m, { role: 'aria', text: 'Connection issue! Please check your network and try again. 🔧', time: new Date() }]);
    }
    setLoading(false);
  };

  const clearChat = () => {
    setMsgs([{ ...INITIAL_MSG, time: new Date() }]);
    setHistory([]);
  };

  const overlay = {
    position: 'fixed', inset: 0, zIndex: 1000,
    background: 'var(--body-bg, #F7F6FD)',
    display: 'flex', flexDirection: 'column',
    fontFamily: "'Quicksand', 'Nunito', sans-serif",
  };

  const topBar = {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 24px', height: 64,
    background: 'white',
    borderBottom: '2px solid var(--lavender)',
    flexShrink: 0,
  };

  return (
    <div style={overlay}>
      {/* Top bar */}
      <div style={topBar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <GuardianMini size={40} />
          <div>
            <div style={{ fontFamily: "'Boogaloo', cursive", fontSize: '1.25rem', color: 'var(--navy)', lineHeight: 1 }}>
              Aria — Career Co-pilot
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.72rem', fontWeight: 700, color: '#2EC4A0', marginTop: 2 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#2EC4A0', display: 'inline-block', animation: 'csChatPulse 2s infinite' }} />
              Always Online · Groq AI Powered
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={clearChat}
            style={{ padding: '7px 16px', borderRadius: 50, border: '1.5px solid var(--lavender-dark)', background: 'white', color: 'var(--purple)', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit' }}>
            🗑️ Clear Chat
          </button>
          <button onClick={onClose}
            style={{ padding: '7px 18px', borderRadius: 50, border: 'none', background: 'linear-gradient(135deg,var(--purple),#A08FFF)', color: 'white', fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit' }}>
            ← Back
          </button>
        </div>
      </div>

      {/* Main layout */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>

        {/* Sidebar */}
        <div style={{ width: 260, flexShrink: 0, background: 'white', borderRight: '2px solid var(--lavender)', display: 'flex', flexDirection: 'column', padding: '20px 16px', gap: 12, overflowY: 'auto' }}>
          <div style={{ textAlign: 'center', padding: '10px 0 16px' }}>
            <div style={{ animation: 'csChatBob 3s ease-in-out infinite', display: 'inline-block' }}>
              <GuardianSVG size={90} />
            </div>
            <div style={{ fontFamily: "'Boogaloo', cursive", fontSize: '1.1rem', color: 'var(--navy)', marginTop: 8 }}>Ask Aria Anything</div>
            <div style={{ fontSize: '0.75rem', color: '#888', marginTop: 4, lineHeight: 1.5 }}>Career · Interviews · Resume · Salary · Jobs</div>
          </div>

          <div style={{ height: 1, background: 'var(--lavender)' }} />

          <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#aaa', textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 4 }}>Quick Questions</div>

          {QUICK.map(q => (
            <button key={q.q}
              onClick={() => sendMsg(q.q)}
              disabled={loading}
              style={{ display: 'block', width: '100%', textAlign: 'left', padding: '9px 13px', borderRadius: 10, border: '1.5px solid var(--lavender)', background: 'white', color: 'var(--navy)', fontWeight: 700, fontSize: '0.82rem', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'all 0.2s', lineHeight: 1.4, opacity: loading ? 0.6 : 1 }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = 'var(--lavender)'; e.currentTarget.style.borderColor = 'var(--purple)'; e.currentTarget.style.color = 'var(--purple)'; } }}
              onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = 'var(--lavender)'; e.currentTarget.style.color = 'var(--navy)'; }}>
              {q.label}
            </button>
          ))}

          <div style={{ height: 1, background: 'var(--lavender)', marginTop: 8 }} />
          <div style={{ fontSize: '0.72rem', color: '#aaa', textAlign: 'center', lineHeight: 1.6 }}>
            💡 Aria remembers your conversation within this session
          </div>
        </div>

        {/* Chat area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>

          {/* Messages */}
          <div ref={bodyRef} style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {msgs.map((m, i) => (
              m.role === 'user' ? (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  <div style={{ background: 'linear-gradient(135deg,var(--purple),#A08FFF)', color: 'white', borderRadius: '18px 4px 18px 18px', padding: '12px 18px', fontSize: '0.92rem', fontWeight: 600, maxWidth: '70%', lineHeight: 1.6, boxShadow: '0 2px 12px rgba(124,111,205,0.2)' }}>
                    {m.text}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#bbb', fontWeight: 600 }}>{formatTime(m.time)}</div>
                </div>
              ) : (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <GuardianMini size={30} />
                    <div style={{ background: 'white', border: '1.5px solid var(--lavender)', color: 'var(--navy)', borderRadius: '4px 18px 18px 18px', padding: '12px 18px', fontSize: '0.92rem', fontWeight: 500, maxWidth: '70%', lineHeight: 1.7, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', whiteSpace: 'pre-wrap' }}>
                      {m.text}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#bbb', fontWeight: 600, paddingLeft: 40 }}>{formatTime(m.time)}</div>
                </div>
              )
            ))}

            {loading && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <GuardianMini size={30} />
                <div style={{ background: 'white', border: '1.5px solid var(--lavender)', borderRadius: '4px 18px 18px 18px', padding: '14px 18px', display: 'flex', gap: 5, alignItems: 'center' }}>
                  {[0, 1, 2].map(i => (
                    <span key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--purple)', display: 'inline-block', animation: `csChatPulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Input bar */}
          <div style={{ padding: '16px 28px', borderTop: '2px solid var(--lavender)', background: 'white', display: 'flex', gap: 12, alignItems: 'center' }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMsg(); } }}
              placeholder="Ask Aria anything about your career..."
              disabled={loading}
              style={{ flex: 1, padding: '13px 20px', borderRadius: 50, border: '2px solid var(--lavender)', outline: 'none', fontFamily: "'Quicksand', sans-serif", fontSize: '0.93rem', fontWeight: 600, color: 'var(--navy)', background: loading ? '#fafafe' : 'white', transition: 'border 0.2s' }}
              onFocus={e => e.target.style.borderColor = 'var(--purple)'}
              onBlur={e => e.target.style.borderColor = 'var(--lavender)'}
            />
            <button
              onClick={() => sendMsg()}
              disabled={loading || !input.trim()}
              style={{ width: 50, height: 50, borderRadius: '50%', background: loading || !input.trim() ? 'var(--lavender)' : 'linear-gradient(135deg,var(--purple),#A08FFF)', color: loading || !input.trim() ? 'var(--purple)' : 'white', border: 'none', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: loading || !input.trim() ? 'not-allowed' : 'pointer', transition: 'all 0.2s', boxShadow: loading || !input.trim() ? 'none' : '0 4px 14px rgba(124,111,205,0.35)', flexShrink: 0 }}>
              ➤
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes csChatBob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes csChatPulse { 0%,100%{opacity:0.4;transform:scale(0.8)} 50%{opacity:1;transform:scale(1)} }
      `}</style>
    </div>
  );
}
