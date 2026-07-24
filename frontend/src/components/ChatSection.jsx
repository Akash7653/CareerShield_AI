import React, { useState, useRef, useEffect } from 'react';
import { GuardianMini } from './GuardianSVG';

const QUICK = [
  { label: '🎯 Interview Tips', q: 'How do I prepare for a tech interview?' },
  { label: '📄 Resume Help', q: 'What makes a resume ATS-friendly?' },
  { label: '💸 Salary Tips', q: 'How do I negotiate my salary effectively?' },
  { label: '🔍 Spot Scams', q: 'How do I identify a fake job offer?' },
  { label: '🚀 Career Switch', q: 'How do I switch careers with no experience?' },
  { label: '💼 LinkedIn Tips', q: 'How do I make my LinkedIn profile stand out?' },
];

export default function ChatSection({ token, onOpenFullChat }) {
  const [msgs, setMsgs] = useState([
    { role: 'aria', text: "Hey there! 👋 I'm Aria, your AI career co-pilot. I give real, personalized advice — not canned responses. Ask me anything about your career, resume, interviews, salary, or job hunting! 🦉" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const bodyRef = useRef(null);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [msgs]);

  const sendMsg = async (text) => {
    const q = text || input.trim();
    if (!q || loading) return;
    setInput('');
    const newMsg = { role: 'user', text: q };
    setMsgs(m => [...m, newMsg]);
    setLoading(true);

    const newHistory = [...history, { role: 'user', text: q }];

    try {
      const res = await fetch('/api/tools/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: q, history: newHistory.slice(-10) }),
      });
      const data = await res.json();
      const reply = data.reply || data.response || data.error || 'Hmm, I had a hiccup. Try again!';
      setMsgs(m => [...m, { role: 'aria', text: reply }]);
      setHistory([...newHistory, { role: 'aria', text: reply }]);
    } catch {
      setMsgs(m => [...m, { role: 'aria', text: 'Connection issue! Make sure the backend is running on port 3001. 🔧' }]);
    }
    setLoading(false);
  };

  const s = {
    section: {
      padding: '80px 48px',
      background: 'radial-gradient(ellipse 60% 50% at 20% 60%,rgba(221,214,255,0.4) 0%,transparent 60%), var(--body-bg)',
    },
    inner: { maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 64, alignItems: 'center' },
    label: { fontSize: '0.72rem', fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12, color: 'var(--purple)', display: 'block' },
    title: { fontFamily: "'Boogaloo', cursive", fontSize: 'clamp(2rem,3.5vw,3rem)', color: 'var(--navy)', lineHeight: 1.15, marginBottom: 16 },
    desc: { fontSize: '0.97rem', lineHeight: 1.75, color: '#5A6488', fontWeight: 500, marginBottom: 20 },
    realBadge: { display: 'inline-flex', alignItems: 'center', gap: 6, background: '#E8FFF5', border: '1.5px solid #2EC4A0', borderRadius: 50, padding: '5px 14px', fontSize: '0.78rem', fontWeight: 700, color: '#1A6B4F', marginBottom: 16 },
    quickBtns: { display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 },
    quickBtn: { background: 'white', border: '1.5px solid var(--lavender-dark)', borderRadius: 50, padding: '7px 13px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--purple)', cursor: 'pointer', transition: 'all 0.2s' },
    window: { background: 'white', borderRadius: 24, boxShadow: '0 8px 32px rgba(124,111,205,0.12)', border: '1.5px solid rgba(200,190,255,0.3)', overflow: 'hidden', display: 'flex', flexDirection: 'column' },
    topbar: { background: 'linear-gradient(135deg,var(--navy),#2A3B78)', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12 },
    chatName: { fontWeight: 800, fontSize: '0.9rem', color: 'white' },
    chatOnline: { display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.72rem', color: 'rgba(255,255,255,0.65)' },
    dot: { width: 7, height: 7, borderRadius: '50%', background: 'var(--mint-dark)', animation: 'pulse 2s infinite' },
    body: { flex: 1, padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, minHeight: 300, maxHeight: 380 },
    msgUser: { background: 'linear-gradient(135deg,var(--purple),#A08FFF)', color: 'white', borderRadius: '16px 4px 16px 16px', padding: '10px 14px', alignSelf: 'flex-end', fontSize: '0.87rem', fontWeight: 600, maxWidth: '85%', lineHeight: 1.5 },
    msgAria: { background: 'var(--lavender)', color: 'var(--navy)', borderRadius: '4px 16px 16px 16px', padding: '10px 14px', alignSelf: 'flex-start', fontSize: '0.87rem', fontWeight: 500, maxWidth: '88%', lineHeight: 1.6, display: 'flex', gap: 8, alignItems: 'flex-start' },
    inputArea: { display: 'flex', gap: 8, padding: 14, borderTop: '1.5px solid #F0EEF8', background: '#FAFAFE' },
    input: { flex: 1, padding: '10px 16px', borderRadius: 50, border: '1.5px solid #E8E4F8', outline: 'none', fontFamily: "'Quicksand', sans-serif", fontSize: '0.88rem', fontWeight: 600 },
    sendBtn: { width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg,var(--purple),#A08FFF)', color: 'white', border: 'none', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  };

  return (
    <section style={s.section} id="guardian">
      <div style={s.inner}>
        <div>
          <span style={s.label}>💬 Talk to Aria</span>
          <h2 style={s.title}>Your always-on<br />career co-pilot</h2>
          <div style={s.realBadge}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#2EC4A0', display: 'inline-block' }} />
            Real AI — remembers your conversation
          </div>
          <p style={s.desc}>
            Aria is a real AI chatbot powered by Groq — she remembers what you've said in the conversation,
            gives personalized advice, and gets smarter with every message. Not static answers! 🦉
          </p>
          <div style={s.quickBtns}>
            {QUICK.map(q => (
              <button key={q.q} style={s.quickBtn} onClick={() => sendMsg(q.q)}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--lavender)'}
                onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                {q.label}
              </button>
            ))}
          </div>
        </div>

        <div style={s.window}>
          <div style={s.topbar}>
            <GuardianMini size={36} />
            <div style={{ flex: 1 }}>
              <div style={s.chatName}>Aria — Career Co-pilot</div>
              <div style={s.chatOnline}>
                <span style={s.dot} /> Always Online · Groq AI Powered
              </div>
            </div>
            {onOpenFullChat && (
              <button onClick={onOpenFullChat} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', borderRadius: 8, padding: '5px 12px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                ⛶ Full Chat
              </button>
            )}
          </div>

          <div style={s.body} ref={bodyRef}>
            {msgs.map((m, i) => (
              m.role === 'user' ? (
                <div key={i} style={s.msgUser}>{m.text}</div>
              ) : (
                <div key={i} style={s.msgAria}>
                  <GuardianMini size={26} />
                  <div style={{ whiteSpace: 'pre-wrap' }}>{m.text}</div>
                </div>
              )
            ))}
            {loading && (
              <div style={s.msgAria}>
                <GuardianMini size={26} />
                <div style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '4px 0' }}>
                  {[0, 1, 2].map(i => (
                    <span key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--purple)', animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={s.inputArea}>
            <input style={s.input} value={input} placeholder="Ask Aria anything about your career..."
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMsg()} />
            <button style={s.sendBtn} onClick={() => sendMsg()}>➤</button>
          </div>
        </div>
      </div>
    </section>
  );
}
