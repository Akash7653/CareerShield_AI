import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GuardianSVG, GuardianMini } from './GuardianSVG';

const PHASE = { SETUP: 'setup', QUESTION: 'question', ANSWERING: 'answering', ANALYZING: 'analyzing', FEEDBACK: 'feedback', REPORT: 'report' };

// ── Animated sound bars ──
function SoundBars({ active, color = 'var(--teal)' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 28 }}>
      {[1,2,3,4,5].map(i => (
        <div key={i} style={{
          width: 4, borderRadius: 2, background: active ? color : 'var(--lavender-dark)',
          height: active ? `${10 + i * 4}px` : '6px',
          transition: 'height 0.15s ease, background 0.3s',
          animation: active ? `soundbar ${0.35 + i * 0.1}s ease-in-out infinite alternate` : 'none',
        }}/>
      ))}
    </div>
  );
}

// ── Timer Ring ──
function TimerRing({ seconds, maxSeconds }) {
  const r = 36; const circ = 2 * Math.PI * r;
  const pct = Math.max(0, seconds / maxSeconds);
  const color = seconds <= 15 ? '#F44336' : seconds <= 40 ? '#FF9800' : 'var(--teal)';
  return (
    <div style={{ position: 'relative', width: 90, height: 90 }}>
      <svg width="90" height="90">
        <circle cx="45" cy="45" r={r} fill="none" stroke="var(--lavender)" strokeWidth="6"/>
        <circle cx="45" cy="45" r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)}
          strokeLinecap="round" transform="rotate(-90 45 45)"
          style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s' }}/>
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: "'Boogaloo', cursive", fontSize: '1.3rem', color, lineHeight: 1 }}>
          {Math.floor(seconds/60)}:{String(seconds%60).padStart(2,'0')}
        </span>
        <span style={{ fontSize: '0.55rem', fontWeight: 800, color: '#999', letterSpacing: 1 }}>LEFT</span>
      </div>
    </div>
  );
}

// ── Progress bar ──
function Progress({ current, total, scores }) {
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      {Array.from({ length: total }).map((_, i) => {
        const done = i < scores.length;
        const active = i === current && !done;
        const score = done ? scores[i] : null;
        const bg = done ? (score >= 75 ? 'var(--teal)' : score >= 55 ? '#FF9800' : '#F44336') : active ? 'var(--purple)' : 'var(--lavender)';
        return (
          <div key={i} style={{ width: active ? 28 : 18, height: 8, borderRadius: 4, background: bg, transition: 'all 0.4s', position: 'relative' }}>
            {active && <div style={{ position: 'absolute', inset: 0, borderRadius: 4, background: 'var(--purple)', animation: 'pulse 1.5s ease-in-out infinite' }}/>}
          </div>
        );
      })}
    </div>
  );
}

export default function LiveInterview({ token, onClose }) {
  const [setup, setSetup] = useState({ role: '', company: '', level: 'Fresher', round: 'HR + Technical', totalQuestions: 5 });
  const [phase, setPhase] = useState(PHASE.SETUP);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [previousQuestions, setPreviousQuestions] = useState([]);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [timeLeft, setTimeLeft] = useState(120);
  const [feedback, setFeedback] = useState(null);
  const [qaLog, setQaLog] = useState([]);
  const [report, setReport] = useState(null);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [recording, setRecording] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [error, setError] = useState('');
  const [typedAnswer, setTypedAnswer] = useState('');
  const [inputMode, setInputMode] = useState('speech'); // 'speech' | 'type'
  const [questionVisible, setQuestionVisible] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [devices, setDevices] = useState([]);
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const startTimeRef = useRef(null);

  // Inject keyframes
  useEffect(() => {
    const s = document.createElement('style');
    s.textContent = `
      @keyframes soundbar { 0%{height:6px} 100%{height:22px} }
      @keyframes owlBob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
      @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
      @keyframes fadeIn { from{opacity:0} to{opacity:1} }
      @keyframes speakPulse { 0%,100%{box-shadow:0 0 0 0 rgba(46,196,160,0.4)} 50%{box-shadow:0 0 0 12px rgba(46,196,160,0)} }
    `;
    document.head.appendChild(s);
    return () => document.head.removeChild(s);
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240, facingMode: 'user' }, audio: false });
      streamRef.current = stream;
      // Set cameraOn=true FIRST so React renders the <video> element into the DOM,
      // then attach the stream after a tick so videoRef.current is available.
      setCameraOn(true);
      setCameraError('');
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.muted = true;
          videoRef.current.playsInline = true;
          videoRef.current.play().catch(e => console.warn('video.play() failed:', e));
        }
      }, 50);
    } catch (err) {
      console.error('startCamera error:', err);
      setCameraError(err?.message || 'Camera unavailable — continuing without video.');
      setCameraOn(false);
    }
  };

  const stopCamera = () => { streamRef.current?.getTracks().forEach(t => t.stop()); streamRef.current = null; setCameraOn(false); };

  // (stream attachment is handled inside startCamera via setTimeout after setCameraOn(true))

  const fetchDevices = async () => {
    try {
      const d = await navigator.mediaDevices.enumerateDevices();
      setDevices(d);
      console.log('devices', d);
    } catch (e) {
      console.error('enumerateDevices failed', e);
      setCameraError(e?.message || 'Could not list media devices');
    }
  };

  const speak = useCallback((text, onDone) => {
    synthRef.current.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    const voices = synthRef.current.getVoices();
    const v = voices.find(v => v.name.includes('Google') && v.lang === 'en-US') || voices.find(v => v.lang.startsWith('en'));
    if (v) utter.voice = v;
    utter.rate = 0.88; utter.pitch = 1.05;
    utter.onstart = () => setAiSpeaking(true);
    utter.onend = () => { setAiSpeaking(false); onDone?.(); };
    utter.onerror = () => { setAiSpeaking(false); onDone?.(); };
    synthRef.current.speak(utter);
  }, []);

  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setInputMode('type'); return; }
    const r = new SR();
    r.continuous = true; r.interimResults = true; r.lang = 'en-US';
    r.onresult = e => {
      let f = '', interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) f += e.results[i][0].transcript + ' ';
        else interim += e.results[i][0].transcript;
      }
      if (f) setTranscript(p => p + f);
      setInterimTranscript(interim);
    };
    r.onstart = () => { setMicActive(true); setRecording(true); };
    r.onend = () => { setMicActive(false); };
    r.onerror = e => { if (e.error !== 'no-speech') setInputMode('type'); };
    recognitionRef.current = r;
    r.start();
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setRecording(false); setMicActive(false); setInterimTranscript('');
  }, []);

  const startTimer = (secs) => {
    setTimeLeft(secs);
    startTimeRef.current = Date.now();
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(p => {
        if (p <= 1) { clearInterval(timerRef.current); handleTimeUp(); return 0; }
        return p - 1;
      });
    }, 1000);
  };

  const handleTimeUp = () => { stopListening(); setPhase(PHASE.ANALYZING); setTimeout(() => submitAnswer(), 400); };

  const fetchQuestion = async (idx, prevQs) => {
    const res = await fetch('/api/tools/interview-question', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...setup, questionIndex: idx, totalQuestions: setup.totalQuestions, previousQuestions: prevQs })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data.question;
  };

  const startInterview = async () => {
    setLoading(true); setError('');
    try {
      await startCamera();
      const q = await fetchQuestion(0, []);
      setCurrentQuestion(q);
      setQuestionIndex(0);
      setPhase(PHASE.QUESTION);
      setQuestionVisible(false);
      setTimeout(() => setQuestionVisible(true), 100);
      setAiMessage(q);
      speak(`Hello! Welcome to your interview for the ${setup.role} position${setup.company ? ' at ' + setup.company : ''}. I'm Aria, your AI interviewer. Let's get started. ${q}`, () => {
        setPhase(PHASE.ANSWERING);
        setTranscript(''); setTypedAnswer('');
        startTimer(120);
        if (inputMode === 'speech') startListening();
      });
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  const getAnswer = () => (inputMode === 'speech' ? transcript : typedAnswer).trim();

  const submitAnswer = async () => {
    clearInterval(timerRef.current);
    stopListening();
    const answer = getAnswer() || '(No answer provided)';
    const taken = Math.round((Date.now() - (startTimeRef.current || Date.now())) / 1000);
    setPhase(PHASE.ANALYZING);
    try {
      const res = await fetch('/api/tools/analyze-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role: setup.role, company: setup.company, round: setup.round, question: currentQuestion, answer, timeTaken: taken, idealTime: 90 })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setQaLog(p => [...p, { question: currentQuestion, answer, score: data.result.score, feedback: data.result }]);
      setFeedback(data.result);
      setPhase(PHASE.FEEDBACK);
      const emotion = data.result.score >= 75 ? `Good answer! ${data.result.quickFeedback}` : `Here's my feedback. ${data.result.quickFeedback}`;
      speak(emotion);
    } catch (e) { setError(e.message || 'Analysis failed'); setPhase(PHASE.ANSWERING); }
  };

  const nextQuestion = async () => {
    const nextIdx = questionIndex + 1;
    if (nextIdx >= setup.totalQuestions) { finishInterview(); return; }
    setLoading(true);
    try {
      const prevQs = [...previousQuestions, currentQuestion];
      const q = await fetchQuestion(nextIdx, prevQs);
      setPreviousQuestions(prevQs);
      setCurrentQuestion(q);
      setQuestionIndex(nextIdx);
      setTranscript(''); setTypedAnswer(''); setFeedback(null);
      setPhase(PHASE.QUESTION);
      setQuestionVisible(false);
      setTimeout(() => setQuestionVisible(true), 100);
      setAiMessage(q);
      speak(q, () => {
        setPhase(PHASE.ANSWERING);
        startTimer(120);
        if (inputMode === 'speech') startListening();
      });
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  const finishInterview = async () => {
    setLoading(true); setPhase(PHASE.ANALYZING);
    try {
      const log = qaLog;
      const res = await fetch('/api/tools/interview-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role: setup.role, company: setup.company, level: setup.level, round: setup.round, qa: log })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setReport(data.result);
      setPhase(PHASE.REPORT);
      stopCamera();
      speak('Interview complete! Well done. Please review your detailed report.');
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  useEffect(() => () => { stopCamera(); clearInterval(timerRef.current); synthRef.current.cancel(); recognitionRef.current?.stop(); }, []);

  // ── Styles (matching the website perfectly) ──
  const overlay = {
    position: 'fixed', inset: 0, zIndex: 600,
    background: 'var(--body-bg)',
    display: 'flex', flexDirection: 'column',
    fontFamily: "'Quicksand', sans-serif",
    overflowY: 'auto',
  };

  const topBar = {
    background: 'white',
    borderBottom: '2px solid var(--lavender)',
    padding: '12px 32px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    position: 'sticky', top: 0, zIndex: 10,
    boxShadow: '0 2px 16px rgba(124,111,205,0.08)',
  };

  // ═══════════════════════════════════════════════════
  // SETUP SCREEN
  // ═══════════════════════════════════════════════════
  if (phase === PHASE.SETUP) {
    return (
      <div style={overlay}>
        <div style={topBar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontFamily: "'Boogaloo', cursive", fontSize: '1.4rem', color: 'var(--navy)' }}>🎤 AI Live Interview</span>
            <span style={{ background: 'var(--lemon)', color: '#7A6A00', fontSize: '0.7rem', fontWeight: 800, padding: '3px 10px', borderRadius: 50, letterSpacing: 1 }}>BETA</span>
          </div>
          <button onClick={onClose} style={{ background: 'var(--lavender)', border: 'none', color: 'var(--purple)', padding: '8px 20px', borderRadius: 50, fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit' }}>✕ Cancel</button>
        </div>

        <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px', width: '100%' }}>
          {/* Owl + heading */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 28, marginBottom: 40, background: 'white', borderRadius: 24, padding: 28, boxShadow: '0 4px 24px rgba(124,111,205,0.1)', border: '1.5px solid var(--lavender)' }}>
            <div style={{ animation: 'owlBob 3s ease-in-out infinite', flexShrink: 0 }}>
              <GuardianSVG size={120}/>
            </div>
            <div>
              <div style={{ fontFamily: "'Boogaloo', cursive", fontSize: '2rem', color: 'var(--navy)', marginBottom: 6 }}>Real One-on-One Interview</div>
              <p style={{ color: '#5A6488', fontSize: '0.95rem', lineHeight: 1.7, fontWeight: 500 }}>
                I'll ask you questions just like a real interviewer — speaking out loud, waiting for your answers, giving you instant feedback after each one, and a full report at the end. 🦉
              </p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 14 }}>
                {[['🎙️','Voice Recognition'],['📷','Live Camera'],['⏱️','2 Min Timer'],['🧠','AI Feedback'],['📊','Full Report']].map(([e,t]) => (
                  <span key={t} style={{ background: 'var(--lavender)', color: 'var(--purple)', fontSize: '0.74rem', fontWeight: 700, padding: '4px 12px', borderRadius: 50 }}>{e} {t}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Form */}
          <div style={{ background: 'white', borderRadius: 20, padding: 32, boxShadow: '0 4px 24px rgba(124,111,205,0.08)', border: '1.5px solid var(--lavender)' }}>
            <div style={{ fontFamily: "'Boogaloo', cursive", fontSize: '1.4rem', color: 'var(--navy)', marginBottom: 20 }}>Set Up Your Interview</div>

            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5 }}>Target Role *</label>
            <input value={setup.role} onChange={e => setSetup(p => ({...p, role: e.target.value}))}
              placeholder="e.g. Software Engineer, Data Analyst, Product Manager..."
              style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1.5px solid var(--lavender-dark)', fontFamily: "'Quicksand',sans-serif", fontSize: '0.95rem', fontWeight: 600, color: 'var(--navy)', outline: 'none', marginBottom: 16, boxSizing: 'border-box', background: 'var(--body-bg)' }}
              autoFocus/>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5 }}>Company</label>
                <input value={setup.company} onChange={e => setSetup(p => ({...p, company: e.target.value}))}
                  placeholder="e.g. Google, TCS, Infosys..."
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1.5px solid var(--lavender-dark)', fontFamily: "'Quicksand',sans-serif", fontSize: '0.9rem', fontWeight: 600, color: 'var(--navy)', outline: 'none', boxSizing: 'border-box', background: 'var(--body-bg)' }}/>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5 }}>Experience Level</label>
                <select value={setup.level} onChange={e => setSetup(p => ({...p, level: e.target.value}))}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1.5px solid var(--lavender-dark)', fontFamily: "'Quicksand',sans-serif", fontSize: '0.9rem', fontWeight: 600, color: 'var(--navy)', outline: 'none', boxSizing: 'border-box', background: 'var(--body-bg)' }}>
                  {['Fresher','Junior (1-2 yrs)','Mid-level (3-5 yrs)','Senior (5+ yrs)'].map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5 }}>Round Type</label>
                <select value={setup.round} onChange={e => setSetup(p => ({...p, round: e.target.value}))}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1.5px solid var(--lavender-dark)', fontFamily: "'Quicksand',sans-serif", fontSize: '0.9rem', fontWeight: 600, color: 'var(--navy)', outline: 'none', boxSizing: 'border-box', background: 'var(--body-bg)' }}>
                  {['HR + Technical','HR Only','Technical Only','Behavioral','System Design'].map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5 }}>No. of Questions</label>
                <select value={setup.totalQuestions} onChange={e => setSetup(p => ({...p, totalQuestions: +e.target.value}))}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1.5px solid var(--lavender-dark)', fontFamily: "'Quicksand',sans-serif", fontSize: '0.9rem', fontWeight: 600, color: 'var(--navy)', outline: 'none', boxSizing: 'border-box', background: 'var(--body-bg)' }}>
                  {[3,5,7,10].map(n => <option key={n} value={n}>{n} Questions</option>)}
                </select>
              </div>
            </div>

            {/* Input mode toggle */}
            <div style={{ background: 'var(--body-bg)', borderRadius: 12, padding: '14px 16px', marginBottom: 20, border: '1.5px solid var(--lavender)' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Answer Mode</div>
              <div style={{ display: 'flex', gap: 10 }}>
                {[['speech','🎙️ Speak My Answers','Best experience'],['type','⌨️ Type My Answers','If mic unavailable']].map(([m, lbl, sub]) => (
                  <div key={m} onClick={() => setInputMode(m)} style={{ flex: 1, padding: '10px 14px', borderRadius: 10, border: `2px solid ${inputMode === m ? 'var(--teal)' : 'var(--lavender)'}`, background: inputMode === m ? '#E8FFF5' : 'white', cursor: 'pointer', transition: 'all 0.2s' }}>
                    <div style={{ fontWeight: 800, color: inputMode === m ? 'var(--teal)' : 'var(--navy)', fontSize: '0.88rem' }}>{lbl}</div>
                    <div style={{ fontSize: '0.74rem', color: '#888', marginTop: 2 }}>{sub}</div>
                  </div>
                ))}
              </div>
            </div>

            {error && <div style={{ background: '#FFF0EE', border: '1.5px solid #FFCCBB', borderRadius: 10, padding: '10px 14px', color: '#C62828', fontSize: '0.85rem', fontWeight: 600, marginBottom: 16 }}>⚠️ {error}</div>}

            <button onClick={startInterview} disabled={!setup.role.trim() || loading}
              style={{ width: '100%', padding: '16px', background: !setup.role.trim() || loading ? 'var(--lavender)' : 'linear-gradient(135deg,var(--teal),#25A88A)', color: !setup.role.trim() || loading ? 'var(--purple)' : 'white', border: 'none', borderRadius: 50, fontFamily: "'Nunito',sans-serif", fontWeight: 900, fontSize: '1.05rem', cursor: !setup.role.trim() || loading ? 'not-allowed' : 'pointer', boxShadow: setup.role.trim() && !loading ? '0 6px 20px rgba(46,196,160,0.38)' : 'none', transition: 'all 0.3s', letterSpacing: 0.5 }}>
              {loading ? '⏳ Starting Interview...' : '🎤 Begin Interview →'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════
  // REPORT SCREEN
  // ═══════════════════════════════════════════════════
  if (phase === PHASE.REPORT && report) {
    const vColor = report.overallScore >= 80 ? 'var(--teal)' : report.overallScore >= 60 ? '#FF9800' : '#F44336';
    const sc = report.skillScores || {};
    return (
      <div style={overlay}>
        <div style={topBar}>
          <span style={{ fontFamily: "'Boogaloo', cursive", fontSize: '1.4rem', color: 'var(--navy)' }}>📊 Interview Report</span>
          <button onClick={onClose} style={{ background: 'linear-gradient(135deg,var(--teal),#25A88A)', color: 'white', border: 'none', padding: '8px 22px', borderRadius: 50, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.88rem' }}>← Back to Dashboard</button>
        </div>
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '36px 24px', width: '100%' }}>

          {/* Score hero */}
          <div style={{ background: 'white', borderRadius: 24, padding: 32, border: '1.5px solid var(--lavender)', boxShadow: '0 4px 24px rgba(124,111,205,0.1)', marginBottom: 24, display: 'flex', gap: 32, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ animation: 'owlBob 3s ease-in-out infinite', flexShrink: 0 }}>
              <GuardianSVG size={100}/>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Boogaloo', cursive", fontSize: '2rem', color: 'var(--navy)', marginBottom: 4 }}>{report.verdict}</div>
              <div style={{ color: '#5A6488', fontSize: '0.9rem', marginBottom: 12 }}>{setup.role}{setup.company ? ` at ${setup.company}` : ''} · {setup.round}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: "'Boogaloo', cursive", fontSize: '3.5rem', color: vColor, lineHeight: 1 }}>{report.overallScore}</div>
                  <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#999', letterSpacing: 1 }}>OVERALL SCORE</div>
                </div>
                <div style={{ padding: '8px 20px', background: vColor + '15', color: vColor, border: `2px solid ${vColor}`, borderRadius: 50, fontWeight: 800, fontSize: '0.88rem' }}>{report.hiringRecommendation}</div>
              </div>
            </div>
          </div>

          {/* Skill scores */}
          <div style={{ background: 'white', borderRadius: 20, padding: 24, border: '1.5px solid var(--lavender)', marginBottom: 20 }}>
            <div style={{ fontFamily: "'Boogaloo', cursive", fontSize: '1.2rem', color: 'var(--navy)', marginBottom: 16 }}>📈 Skill Breakdown</div>
            {Object.entries(sc).map(([k, v]) => {
              const c = v >= 75 ? 'var(--teal)' : v >= 55 ? '#FF9800' : '#F44336';
              return (
                <div key={k} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--navy)', textTransform: 'capitalize' }}>{k.replace(/([A-Z])/g, ' $1')}</span>
                    <span style={{ fontWeight: 800, color: c, fontSize: '0.88rem' }}>{v}/100</span>
                  </div>
                  <div style={{ height: 8, background: 'var(--lavender)', borderRadius: 4 }}>
                    <div style={{ width: `${v}%`, height: '100%', background: c, borderRadius: 4, transition: 'width 1.2s ease' }}/>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interviewer notes */}
          <div style={{ background: 'linear-gradient(135deg,#E8FFF5,var(--lavender))', borderRadius: 20, padding: 24, border: '1.5px solid var(--lavender-dark)', marginBottom: 20 }}>
            <div style={{ fontFamily: "'Boogaloo', cursive", fontSize: '1.1rem', color: 'var(--navy)', marginBottom: 10 }}>📋 Interviewer's Notes</div>
            <p style={{ color: 'var(--navy)', fontSize: '0.92rem', lineHeight: 1.75, fontStyle: 'italic' }}>"{report.interviewerNotes}"</p>
          </div>

          {/* Strengths + Weaknesses */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div style={{ background: '#E8FFF5', border: '1.5px solid var(--mint-dark)', borderRadius: 18, padding: 20 }}>
              <div style={{ fontWeight: 800, color: 'var(--teal)', fontSize: '0.72rem', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>✅ Top Strengths</div>
              {report.topStrengths?.map((s, i) => <div key={i} style={{ color: 'var(--navy)', fontSize: '0.87rem', marginBottom: 7, paddingLeft: 10, borderLeft: '3px solid var(--teal)' }}>• {s}</div>)}
            </div>
            <div style={{ background: '#FFF0EE', border: '1.5px solid #FFCCBB', borderRadius: 18, padding: 20 }}>
              <div style={{ fontWeight: 800, color: '#C62828', fontSize: '0.72rem', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>⚠️ Critical Weaknesses</div>
              {report.criticalWeaknesses?.map((w, i) => <div key={i} style={{ color: 'var(--navy)', fontSize: '0.87rem', marginBottom: 7, paddingLeft: 10, borderLeft: '3px solid #F44336' }}>• {w}</div>)}
            </div>
          </div>

          {/* Improvement Plan */}
          {report.improvementPlan?.length > 0 && (
            <div style={{ background: 'white', borderRadius: 20, padding: 24, border: '1.5px solid var(--lavender)', marginBottom: 20 }}>
              <div style={{ fontFamily: "'Boogaloo', cursive", fontSize: '1.2rem', color: 'var(--navy)', marginBottom: 16 }}>🎯 Your Improvement Plan</div>
              {report.improvementPlan.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 14, marginBottom: 14, alignItems: 'flex-start' }}>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--lavender)', color: 'var(--purple)', fontWeight: 900, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i+1}</div>
                  <div>
                    <div style={{ fontWeight: 800, color: 'var(--navy)', fontSize: '0.9rem' }}>{item.area}</div>
                    <div style={{ color: '#5A6488', fontSize: '0.84rem', marginTop: 2 }}>{item.action}</div>
                    {item.resource && <div style={{ color: 'var(--teal)', fontSize: '0.8rem', marginTop: 3, fontWeight: 600 }}>📖 {item.resource}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Q&A scores */}
          <div style={{ background: 'white', borderRadius: 20, padding: 24, border: '1.5px solid var(--lavender)', marginBottom: 24 }}>
            <div style={{ fontFamily: "'Boogaloo', cursive", fontSize: '1.2rem', color: 'var(--navy)', marginBottom: 16 }}>📝 Question by Question</div>
            {qaLog.map((q, i) => {
              const c = q.score >= 75 ? 'var(--teal)' : q.score >= 55 ? '#FF9800' : '#F44336';
              return (
                <div key={i} style={{ display: 'flex', gap: 14, padding: '12px 0', borderBottom: i < qaLog.length - 1 ? '1px solid var(--lavender)' : 'none' }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', border: `3px solid ${c}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Boogaloo',cursive", fontSize: '1.1rem', color: c, flexShrink: 0 }}>{q.score}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: 'var(--navy)', fontSize: '0.88rem' }}>Q{i+1}: {q.question}</div>
                    <div style={{ color: '#888', fontSize: '0.8rem', marginTop: 3 }}>{q.answer.substring(0, 130)}{q.answer.length > 130 ? '...' : ''}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Aria tip */}
          {report.ariaTip && (
            <div style={{ background: 'var(--lavender)', borderRadius: 20, padding: 24, display: 'flex', gap: 16, alignItems: 'flex-start', border: '1.5px solid var(--lavender-dark)', marginBottom: 16 }}>
              <GuardianMini size={44}/>
              <div>
                <div style={{ fontWeight: 800, color: 'var(--purple)', fontSize: '0.72rem', letterSpacing: 1, marginBottom: 5 }}>ARIA'S FINAL WORDS</div>
                <div style={{ color: 'var(--navy)', fontSize: '0.92rem', lineHeight: 1.7 }}>{report.ariaTip}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════
  // MAIN INTERVIEW SCREEN
  // ═══════════════════════════════════════════════════
  const isAnswering = phase === PHASE.ANSWERING;
  const isFeedback = phase === PHASE.FEEDBACK;
  const isAnalyzing = phase === PHASE.ANALYZING;
  const avgScore = qaLog.length > 0 ? Math.round(qaLog.reduce((a, b) => a + b.score, 0) / qaLog.length) : null;

  return (
    <div style={overlay}>
      {/* Top bar */}
      <div style={topBar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontFamily: "'Boogaloo', cursive", fontSize: '1.3rem', color: 'var(--navy)' }}>🎤 Live Interview</span>
          <span style={{ color: '#888', fontSize: '0.82rem', fontWeight: 600 }}>{setup.role}{setup.company ? ` @ ${setup.company}` : ''}</span>
          <Progress current={questionIndex} total={setup.totalQuestions} scores={qaLog.map(q => q.score)}/>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {avgScore !== null && (
            <div style={{ background: 'var(--lavender)', padding: '5px 14px', borderRadius: 50, fontSize: '0.8rem', fontWeight: 800, color: 'var(--purple)' }}>
              Avg: <span style={{ color: avgScore >= 70 ? 'var(--teal)' : '#FF9800' }}>{avgScore}</span>
            </div>
          )}
          <span style={{ color: '#888', fontSize: '0.8rem', fontWeight: 700 }}>Q{questionIndex+1}/{setup.totalQuestions}</span>
          <button onClick={onClose} style={{ background: '#FFF0EE', border: '1.5px solid #FFCCBB', color: '#C62828', padding: '6px 16px', borderRadius: 50, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.8rem' }}>✕ End</button>
        </div>
      </div>

      {/* Main layout */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '340px 1fr', minHeight: 0, overflow: 'hidden' }}>

        {/* LEFT — Aria + Camera */}
        <div style={{ background: 'white', borderRight: '2px solid var(--lavender)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 24, gap: 20, overflowY: 'auto' }}>

          {/* Aria Interviewer */}
          <div style={{ width: '100%', background: aiSpeaking ? 'linear-gradient(135deg,#E8FFF5,var(--lavender))' : 'var(--body-bg)', borderRadius: 20, padding: 20, border: `2px solid ${aiSpeaking ? 'var(--mint-dark)' : 'var(--lavender)'}`, transition: 'all 0.4s', animation: aiSpeaking ? 'speakPulse 1.5s ease-in-out infinite' : 'none', textAlign: 'center' }}>
            <div style={{ animation: 'owlBob 2.5s ease-in-out infinite', display: 'inline-block', marginBottom: 8 }}>
              <GuardianSVG size={130}/>
            </div>
            <div style={{ fontWeight: 800, fontSize: '0.72rem', color: aiSpeaking ? 'var(--teal)' : 'var(--purple)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>
              {aiSpeaking ? '🔊 Aria is speaking...' : isAnalyzing ? '🧠 Analyzing...' : '🦉 Aria — Your Interviewer'}
            </div>
            {/* Sound bars when speaking */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <SoundBars active={aiSpeaking} color="var(--teal)"/>
            </div>

            {/* AI message bubble */}
            {(phase === PHASE.QUESTION || aiSpeaking) && currentQuestion && (
              <div style={{ background: 'white', borderRadius: 14, padding: '12px 14px', marginTop: 12, border: '1.5px solid var(--lavender)', animation: 'slideUp 0.4s ease', textAlign: 'left' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--purple)', marginBottom: 5 }}>💬 ASKING:</div>
                <div style={{ fontSize: '0.88rem', color: 'var(--navy)', lineHeight: 1.6, fontWeight: 600 }}>{currentQuestion}</div>
              </div>
            )}
          </div>

          {/* Timer — shown while answering */}
          {isAnswering && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <TimerRing seconds={timeLeft} maxSeconds={120}/>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: timeLeft <= 15 ? '#F44336' : '#888', letterSpacing: 1 }}>
                {timeLeft <= 15 ? '⚠️ HURRY UP!' : 'TIME TO ANSWER'}
              </div>
            </div>
          )}

          {/* Camera feed */}
          <div style={{ width: '100%', borderRadius: 16, overflow: 'hidden', border: '2px solid var(--lavender)', background: '#111', aspectRatio: '4/3', position: 'relative' }}>
            {/* Video is ALWAYS in the DOM so videoRef.current is never null */}
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              style={{
                width: '100%', height: '100%', objectFit: 'cover',
                transform: 'scaleX(-1)',
                display: cameraOn ? 'block' : 'none',
              }}
            />
            {cameraOn && recording && (
              <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(0,0,0,0.55)', padding: '4px 10px', borderRadius: 50 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#F44336', animation: 'pulse 1s ease-in-out infinite' }}/>
                <span style={{ color: 'white', fontSize: '0.65rem', fontWeight: 800 }}>REC</span>
              </div>
            )}
            {!cameraOn && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#999', background: '#1a1a2e' }}>
                <span style={{ fontSize: '2.5rem' }}>📷</span>
                <span style={{ fontSize: '0.78rem', textAlign: 'center', padding: '0 12px', color: '#aaa' }}>{cameraError || 'Starting camera...'}</span>
                {cameraError && (
                  <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                    <button onClick={startCamera} style={{ padding: '8px 12px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,var(--teal),#25A88A)', color: 'white', fontWeight: 700, cursor: 'pointer' }}>Retry Camera</button>
                  </div>
                )}
                {/* Debug panel */}
                <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', gap: 8 }}>
                  <button onClick={fetchDevices} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid var(--lavender)', background: 'white', color: 'var(--purple)', fontWeight: 700, cursor: 'pointer' }}>Show Devices</button>
                  <button onClick={() => { console.log('streamRef', streamRef.current); alert(streamRef.current ? `Got stream with ${streamRef.current.getTracks().length} track(s)` : 'No stream'); }} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid var(--lavender)', background: 'white', color: 'var(--purple)', fontWeight: 700, cursor: 'pointer' }}>Stream Info</button>
                </div>
                {devices.length > 0 && (
                  <div style={{ position: 'absolute', top: 48, left: 8, background: 'rgba(255,255,255,0.96)', padding: 8, borderRadius: 8, maxWidth: 300, fontSize: '0.72rem', color: 'var(--navy)' }}>
                    <div style={{ fontWeight: 800, marginBottom: 6 }}>Media Devices</div>
                    {devices.map((d, i) => (
                      <div key={i} style={{ marginBottom: 4 }}>{d.kind} — {d.label || 'label hidden'}</div>
                    ))}
                  </div>
                )}
              </div>
            )}
            <div style={{ position: 'absolute', bottom: 8, left: 8, background: 'rgba(0,0,0,0.5)', color: 'white', fontSize: '0.65rem', fontWeight: 800, padding: '3px 8px', borderRadius: 50 }}>YOU</div>
          </div>
        </div>

        {/* RIGHT — Question + Answer + Feedback */}
        <div style={{ display: 'flex', flexDirection: 'column', padding: 28, overflowY: 'auto', gap: 16 }}>

          {error && <div style={{ background: '#FFF0EE', border: '1.5px solid #FFCCBB', borderRadius: 12, padding: '10px 14px', color: '#C62828', fontSize: '0.87rem', fontWeight: 600 }}>⚠️ {error}</div>}

          {/* Analyzing state */}
          {isAnalyzing && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
              <div style={{ animation: 'owlBob 1s ease-in-out infinite' }}><GuardianMini size={60}/></div>
              <div style={{ fontFamily: "'Boogaloo', cursive", fontSize: '1.5rem', color: 'var(--navy)' }}>Analysing your answer...</div>
              <div style={{ color: '#888', fontSize: '0.88rem' }}>Aria is reviewing your response carefully 🦉</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {[0,1,2].map(i => <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--purple)', animation: `pulse 1.2s ease-in-out ${i*0.2}s infinite` }}/>)}
              </div>
            </div>
          )}

          {/* Question card */}
          {!isAnalyzing && currentQuestion && (
            <div style={{ background: 'white', borderRadius: 20, padding: 24, border: '2px solid var(--lavender)', boxShadow: '0 4px 20px rgba(124,111,205,0.1)', animation: questionVisible ? 'slideUp 0.4s ease' : 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--purple)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>
                    Question {questionIndex + 1} of {setup.totalQuestions} · {setup.round}
                  </div>
                  <div style={{ fontFamily: "'Boogaloo', cursive", fontSize: '1.5rem', color: 'var(--navy)', lineHeight: 1.4 }}>{currentQuestion}</div>
                </div>
                {isAnswering && <TimerRing seconds={timeLeft} maxSeconds={120}/>}
              </div>
            </div>
          )}

          {/* ANSWERING — transcript / type box */}
          {isAnswering && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[['speech','🎙️ Voice'],['type','⌨️ Type']].map(([m, lbl]) => (
                    <button key={m} onClick={() => { setInputMode(m); if (m === 'speech' && !recording) startListening(); if (m === 'type') stopListening(); }}
                      style={{ padding: '5px 14px', borderRadius: 50, border: `1.5px solid ${inputMode===m?'var(--teal)':'var(--lavender-dark)'}`, background: inputMode===m?'#E8FFF5':'white', color: inputMode===m?'var(--teal)':'var(--navy)', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                      {lbl}
                    </button>
                  ))}
                </div>
                {inputMode === 'speech' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <SoundBars active={micActive} color="var(--teal)"/>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: micActive ? 'var(--teal)' : '#999' }}>{micActive ? 'Listening...' : 'Mic off'}</span>
                  </div>
                )}
              </div>

              {inputMode === 'speech' ? (
                <div style={{ flex: 1, background: 'white', border: `2px solid ${micActive ? 'var(--mint-dark)' : 'var(--lavender)'}`, borderRadius: 16, padding: '16px 18px', fontSize: '1rem', color: 'var(--navy)', lineHeight: 1.75, overflowY: 'auto', minHeight: 180, transition: 'border-color 0.3s' }}>
                  <span>{transcript}</span>
                  <span style={{ color: 'var(--lavender-dark)', fontStyle: 'italic' }}>{interimTranscript}</span>
                  {!transcript && !interimTranscript && <span style={{ color: 'var(--lavender-dark)', fontStyle: 'italic' }}>Start speaking — your words appear here automatically...</span>}
                </div>
              ) : (
                <textarea value={typedAnswer} onChange={e => setTypedAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  style={{ flex: 1, minHeight: 180, background: 'white', border: '2px solid var(--lavender)', borderRadius: 16, padding: '16px 18px', fontSize: '1rem', color: 'var(--navy)', lineHeight: 1.75, resize: 'none', outline: 'none', fontFamily: "'Quicksand',sans-serif", fontWeight: 500 }}/>
              )}

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => { stopListening(); setPhase(PHASE.ANALYZING); setTimeout(submitAnswer, 300); }}
                  style={{ flex: 1, padding: '14px', background: 'linear-gradient(135deg,var(--teal),#25A88A)', color: 'white', border: 'none', borderRadius: 50, fontFamily: "'Nunito',sans-serif", fontWeight: 900, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 4px 16px rgba(46,196,160,0.35)' }}>
                  ✓ Submit Answer
                </button>
                {inputMode === 'speech' && (
                  <button onClick={() => recording ? stopListening() : startListening()}
                    style={{ padding: '14px 20px', background: recording ? '#FFF0EE' : 'var(--lavender)', border: `1.5px solid ${recording ? '#FFCCBB' : 'var(--lavender-dark)'}`, color: recording ? '#C62828' : 'var(--purple)', borderRadius: 50, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.88rem' }}>
                    {recording ? '⏹ Stop' : '🎙️ Start Mic'}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* FEEDBACK */}
          {isFeedback && feedback && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, animation: 'slideUp 0.4s ease' }}>
              {/* Score row */}
              <div style={{ display: 'flex', gap: 14, background: 'white', borderRadius: 16, padding: '16px 20px', border: '1.5px solid var(--lavender)', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: "'Boogaloo', cursive", fontSize: '2.5rem', color: feedback.score>=75?'var(--teal)':feedback.score>=55?'#FF9800':'#F44336', lineHeight: 1 }}>{feedback.score}</div>
                  <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#999', letterSpacing: 1 }}>SCORE</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'inline-block', padding: '4px 14px', borderRadius: 50, background: feedback.verdict==='excellent'?'#E8FFF5':feedback.verdict==='good'?'#E3F2FD':feedback.verdict==='average'?'#FFF8E1':'#FFEBEE', color: feedback.verdict==='excellent'?'var(--teal)':feedback.verdict==='good'?'var(--purple)':feedback.verdict==='average'?'#FF9800':'#F44336', fontWeight: 800, fontSize: '0.78rem', marginBottom: 6 }}>{feedback.verdict?.toUpperCase()} · {feedback.timeAssessment}</div>
                  <div style={{ color: 'var(--navy)', fontSize: '0.9rem', fontWeight: 600 }}>💬 {feedback.quickFeedback}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: "'Boogaloo', cursive", fontSize: '1.8rem', color: 'var(--purple)', lineHeight: 1 }}>{feedback.confidence}</div>
                  <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#999', letterSpacing: 1 }}>CONFIDENCE</div>
                </div>
              </div>

              {/* Strengths */}
              {feedback.strengths?.length > 0 && (
                <div style={{ background: '#E8FFF5', border: '1.5px solid var(--mint-dark)', borderRadius: 14, padding: '14px 18px' }}>
                  <div style={{ fontWeight: 800, color: 'var(--teal)', fontSize: '0.72rem', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>✅ What You Did Well</div>
                  {feedback.strengths.map((s, i) => <div key={i} style={{ color: 'var(--navy)', fontSize: '0.88rem', marginBottom: 4 }}>• {s}</div>)}
                </div>
              )}

              {/* Drawbacks */}
              {feedback.drawbacks?.length > 0 && (
                <div style={{ background: '#FFF0EE', border: '1.5px solid #FFCCBB', borderRadius: 14, padding: '14px 18px' }}>
                  <div style={{ fontWeight: 800, color: '#C62828', fontSize: '0.72rem', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>⚠️ Drawbacks Identified</div>
                  {feedback.drawbacks.map((d, i) => <div key={i} style={{ color: 'var(--navy)', fontSize: '0.88rem', marginBottom: 4 }}>• {d}</div>)}
                </div>
              )}

              {/* Missed points */}
              {feedback.missedPoints?.length > 0 && (
                <div style={{ background: 'var(--lemon)', border: '1.5px solid #E8DC70', borderRadius: 14, padding: '14px 18px' }}>
                  <div style={{ fontWeight: 800, color: '#7A6A00', fontSize: '0.72rem', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>💡 You Should Have Mentioned</div>
                  {feedback.missedPoints.map((m, i) => <div key={i} style={{ color: 'var(--navy)', fontSize: '0.88rem', marginBottom: 4 }}>• {m}</div>)}
                </div>
              )}

              {/* Better answer */}
              {feedback.betterAnswer && (
                <div style={{ background: 'var(--lavender)', border: '1.5px solid var(--lavender-dark)', borderRadius: 14, padding: '14px 18px' }}>
                  <div style={{ fontWeight: 800, color: 'var(--purple)', fontSize: '0.72rem', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>🏆 Stronger Answer Example</div>
                  <div style={{ color: 'var(--navy)', fontSize: '0.88rem', lineHeight: 1.7, fontStyle: 'italic' }}>"{feedback.betterAnswer}"</div>
                </div>
              )}

              {/* Next / Finish */}
              <button onClick={questionIndex + 1 < setup.totalQuestions ? nextQuestion : finishInterview} disabled={loading}
                style={{ padding: '14px 28px', background: 'linear-gradient(135deg,var(--purple),#A08FFF)', color: 'white', border: 'none', borderRadius: 50, fontFamily: "'Nunito',sans-serif", fontWeight: 900, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 16px rgba(124,111,205,0.35)', opacity: loading ? 0.7 : 1, alignSelf: 'flex-start' }}>
                {loading ? '⏳ Loading...' : questionIndex + 1 < setup.totalQuestions ? `Next Question → (${questionIndex+2}/${setup.totalQuestions})` : '🏁 Finish & Get Full Report'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
