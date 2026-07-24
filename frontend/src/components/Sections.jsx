import React from 'react';

const STEPS = [
  { num: '01', icon: '📋', title: 'Share Your Profile', desc: 'Upload your resume or fill in your career details. Guardian learns everything about your goals.' },
  { num: '02', icon: '🔬', title: 'Get Deep Analysis', desc: 'Guardian analyzes everything and calculates your CareerShield Score instantly.' },
  { num: '03', icon: '🗺️', title: 'Follow Your Roadmap', desc: 'Get a personalized plan with skill targets, project ideas, and realistic timelines.' },
  { num: '04', icon: '🎉', title: 'Land Your Dream Job', desc: 'Apply confidently, ace interviews, negotiate salary, and celebrate with Guardian!' },
];

export function HowSection() {
  const s = {
    section: { padding: '80px 48px', background: 'white' },
    inner: { maxWidth: 1100, margin: '0 auto' },
    label: { fontSize: '0.72rem', fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--coral)', textAlign: 'center', marginBottom: 12, display: 'block' },
    title: { fontFamily: "'Boogaloo', cursive", fontSize: '2.4rem', color: 'var(--navy)', textAlign: 'center', marginBottom: 52 },
    steps: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24 },
    card: {
      background: 'var(--body-bg)', borderRadius: 20, padding: 28,
      border: '1.5px solid rgba(200,190,255,0.3)', position: 'relative',
      transition: 'transform 0.25s, box-shadow 0.25s',
    },
    num: {
      fontFamily: "'Boogaloo', cursive", fontSize: '2.8rem', lineHeight: 1,
      color: 'rgba(124,111,205,0.12)', position: 'absolute', top: 16, right: 16,
    },
    icon: { fontSize: '2rem', marginBottom: 12, display: 'block' },
    cardTitle: { fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: '1rem', color: 'var(--navy)', marginBottom: 8 },
    cardDesc: { fontSize: '0.85rem', lineHeight: 1.65, color: '#5A6488', fontWeight: 500 },
  };

  return (
    <section style={s.section} id="how">
      <div style={s.inner}>
        <span style={s.label}>🗺️ Your Journey</span>
        <h2 style={s.title}>How Guardian Works</h2>
        <div style={s.steps}>
          {STEPS.map(step => (
            <div key={step.num} style={s.card}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(124,111,205,0.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
              <div style={s.num}>{step.num}</div>
              <span style={s.icon}>{step.icon}</span>
              <div style={s.cardTitle}>{step.title}</div>
              <p style={s.cardDesc}>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SafetySection({ onCheckScam }) {
  const s = {
    section: {
      padding: '80px 48px',
      background: 'radial-gradient(ellipse 60% 50% at 10% 50%,rgba(184,240,216,0.3) 0%,transparent 60%), var(--body-bg)',
    },
    inner: { maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: 64, alignItems: 'center' },
    label: { fontSize: '0.72rem', fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--coral)', marginBottom: 12, display: 'block' },
    title: { fontFamily: "'Boogaloo', cursive", fontSize: 'clamp(2rem,3.5vw,3rem)', color: 'var(--navy)', lineHeight: 1.15, marginBottom: 16 },
    desc: { fontSize: '0.97rem', lineHeight: 1.75, color: '#5A6488', fontWeight: 500, marginBottom: 20 },
    stats: { display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 20 },
    statBox: { textAlign: 'center', padding: '16px 20px', background: 'white', borderRadius: 16, boxShadow: '0 4px 16px rgba(0,0,0,0.06)' },
    card: { background: 'white', borderRadius: 20, padding: 24, boxShadow: '0 8px 32px rgba(0,0,0,0.08)', border: '1.5px solid rgba(200,190,255,0.2)' },
    jobRow: { background: '#F8F6FF', borderRadius: 12, padding: '12px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 },
    checkList: { display: 'flex', flexDirection: 'column', gap: 8 },
    checkItem: (safe) => ({
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '7px 10px', borderRadius: 8, fontSize: '0.82rem', fontWeight: 600,
      background: safe ? 'rgba(184,240,216,0.2)' : 'rgba(255,244,176,0.4)',
      color: safe ? '#1E6B4F' : '#7A6A00',
    }),
  };

  return (
    <section style={s.section}>
      <div style={s.inner}>
        <div>
          <span style={s.label}>🔒 Stay Protected</span>
          <h2 style={s.title}>Job scams are<br />everywhere. Guardian<br />has your back.</h2>
          <p style={s.desc}>
            With over 30% of job postings containing misleading information, your Guardian keeps you safe
            from advance-fee fraud, fake companies, and data theft.
          </p>
          <div style={s.stats}>
            {[
              { val: '14K+', label: 'Scams Blocked', color: 'var(--coral)' },
              { val: '98%', label: 'Detection Accuracy', color: 'var(--teal)' },
              { val: '<3s', label: 'Analysis Speed', color: 'var(--purple)' },
            ].map(stat => (
              <div key={stat.label} style={s.statBox}>
                <div style={{ fontFamily: "'Boogaloo', cursive", fontSize: '1.8rem', color: stat.color }}>{stat.val}</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6A7299' }}>{stat.label}</div>
              </div>
            ))}
          </div>
          <button style={{
            marginTop: 24, background: 'linear-gradient(135deg,var(--teal),#25A88A)', color: 'white', border: 'none',
            padding: '12px 24px', borderRadius: 50, fontFamily: "'Nunito', sans-serif",
            fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(46,196,160,0.38)',
          }} onClick={onCheckScam}>
            🔍 Check a Company Now
          </button>
        </div>

        <div style={s.card}>
          <h3 style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: '1rem', color: 'var(--navy)', marginBottom: 14 }}>
            🔍 Company Legitimacy Check
          </h3>
          <div style={s.jobRow}>
            <span>🏢</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--navy)' }}>TechCorp Solutions Pvt. Ltd.</div>
              <div style={{ fontSize: '0.72rem', color: '#8A90AA' }}>Software Engineer · ₹8-12 LPA · Bangalore</div>
            </div>
            <div style={{ background: 'linear-gradient(135deg,var(--teal),var(--mint-dark))', color: 'white', padding: '4px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 800 }}>
              ✓ Safe
            </div>
          </div>
          <div style={s.checkList}>
            {[
              [true, 'Company registered on MCA portal'],
              [true, 'Glassdoor reviews match job description'],
              [true, 'No upfront payment required'],
              [true, 'Official email domain verified'],
              [false, 'Salary slightly above market — verify in interview'],
              [true, 'LinkedIn page active with real employees'],
            ].map(([safe, text], i) => (
              <div key={i} style={s.checkItem(safe)}>
                <span>{safe ? '✅' : '⚠️'}</span><span>{text}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, padding: '12px 14px', background: 'linear-gradient(135deg,rgba(184,240,216,0.4),rgba(110,219,176,0.2))', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '1.4rem' }}>🛡️</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#1E6B4F' }}>Safety Score: 88/100</div>
              <div style={{ fontSize: '0.75rem', color: '#4A8A6A', fontWeight: 600 }}>This opportunity looks legitimate. Go ahead!</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function CtaSection({ onGetStarted }) {
  const s = {
    section: {
      padding: '80px 48px', textAlign: 'center',
      background: 'linear-gradient(135deg,var(--navy),#2A3B78,#3A2A78)',
      position: 'relative', overflow: 'hidden',
    },
    title: { fontFamily: "'Boogaloo', cursive", fontSize: 'clamp(2rem,4vw,3.5rem)', color: 'white', marginBottom: 16, position: 'relative', zIndex: 1 },
    sub: { fontSize: '1.05rem', color: 'rgba(255,255,255,0.7)', fontWeight: 500, marginBottom: 36, maxWidth: 560, margin: '0 auto 36px', position: 'relative', zIndex: 1 },
    btn: {
      background: 'linear-gradient(135deg,var(--teal),#25A88A)', color: 'white', border: 'none',
      padding: '16px 40px', borderRadius: 50, fontFamily: "'Nunito', sans-serif",
      fontWeight: 800, fontSize: '1.05rem', cursor: 'pointer',
      boxShadow: '0 6px 28px rgba(46,196,160,0.4)', position: 'relative', zIndex: 1,
      transition: 'all 0.2s',
    },
  };

  return (
    <section style={s.section} id="about">
      <div style={{ position: 'absolute', top: -120, right: -120, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(184,240,216,0.1),transparent 70%)' }} />
      <div style={{ position: 'absolute', bottom: -80, left: -80, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle,rgba(0,220,200,0.08),transparent 70%)' }} />

      <span style={{ fontSize: '4rem', display: 'block', marginBottom: 20, animation: 'buddy-float 3s ease-in-out infinite', position: 'relative', zIndex: 1 }}>⚔️</span>
      <h2 style={s.title}>Ready to armor up<br />your career?</h2>
      <p style={s.sub}>Join thousands of graduating students using CareerShield Guardian to land safer, better, faster jobs.</p>
      <button style={s.btn} onClick={onGetStarted}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 36px rgba(46,196,160,0.5)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 6px 28px rgba(46,196,160,0.4)'; }}>
        ⚔️ Activate My Guardian
      </button>

      <div style={{ marginTop: 48, fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', position: 'relative', zIndex: 1 }}>
        Built for graduating students · Powered by Gemini AI · 100% Free to try
      </div>
    </section>
  );
}
