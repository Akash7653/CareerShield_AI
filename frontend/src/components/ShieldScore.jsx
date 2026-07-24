import React from 'react';

const STATS = [
  { label: 'Career Paths Mapped', num: '50', suffix: 'K+' },
  { label: 'Scam Detection Rate', num: '98', suffix: '%' },
  { label: 'Interview Success Boost', num: '3.2', suffix: 'x' },
  { label: 'Avg Salary Increase', num: '₹2.8', suffix: 'L' },
];

const BARS = [
  { label: 'Resume Quality', key: 'resumeScore', color: 'linear-gradient(90deg,var(--teal),var(--mint-dark))', default: 0 },
  { label: 'Interview Prep', key: 'interviewScore', color: 'linear-gradient(90deg,var(--purple),var(--lavender-dark))', default: 0 },
  { label: 'Scam Awareness', key: 'scamScore', color: 'linear-gradient(90deg,var(--peach-dark),var(--coral))', default: 0 },
  { label: 'Online Presence', key: 'onlineScore', color: 'linear-gradient(90deg,#E8DC70,var(--peach-dark))', default: 0 },
];

export default function ShieldScore({ user, onImproveScore }) {
  const score = user.shieldScore || 0;
  const hasScores = score > 0;
  const circ = 2 * Math.PI * 72;
  const offset = circ - (score / 100) * circ;

  const s = {
    strip: { background: 'linear-gradient(135deg,var(--navy),#2A3B78)', padding: '28px 48px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 60, flexWrap: 'wrap' },
    stat: { textAlign: 'center', color: 'white' },
    num: { fontFamily: "'Boogaloo', cursive", fontSize: '2.4rem', lineHeight: 1 },
    section: { padding: '80px 48px', background: 'radial-gradient(ellipse 70% 50% at 80% 50%,rgba(255,214,192,0.4) 0%,transparent 60%), white', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    inner: { maxWidth: 1100, width: '100%', display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: 64, alignItems: 'center' },
    label: { fontSize: '0.72rem', fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12, color: 'var(--coral)' },
    title: { fontFamily: "'Boogaloo', cursive", fontSize: 'clamp(2rem,3.5vw,3rem)', color: 'var(--navy)', lineHeight: 1.15, marginBottom: 16 },
    desc: { fontSize: '0.97rem', lineHeight: 1.75, color: '#5A6488', fontWeight: 500, marginBottom: 28 },
    btn: { background: 'linear-gradient(135deg,var(--teal),#25A88A)', color: 'white', border: 'none', padding: '12px 26px', borderRadius: 50, fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: '0.9rem', boxShadow: '0 6px 20px rgba(46,196,160,0.38)', cursor: 'pointer' },
    visual: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 },
    ringWrap: { position: 'relative', width: 180, height: 180 },
    ringCenter: { position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  };

  return (
    <>
      <div style={s.strip}>
        {STATS.map(stat => (
          <div key={stat.label} style={s.stat}>
            <div style={s.num}>{stat.num}<span style={{ color: 'var(--mint-dark)' }}>{stat.suffix}</span></div>
            <p style={{ fontSize: '0.8rem', opacity: 0.7, fontWeight: 600, marginTop: 2 }}>{stat.label}</p>
          </div>
        ))}
      </div>

      <section style={s.section}>
        <div style={s.inner}>
          <div>
            <div style={s.label}>🛡️ Career Readiness</div>
            <h2 style={s.title}>
              Your CareerShield<br />Score, <span style={{ color: 'var(--teal)' }}>{user.firstName}</span>!
            </h2>
            <p style={s.desc}>
              {hasScores
                ? 'Aria analyzes your resume quality, interview readiness, and scam awareness to give you one powerful score — and a crystal-clear path to level up.'
                : 'Use any tool above to start building your CareerShield Score! Each tool you use updates your score in real-time. 🚀'}
            </p>
            <button style={s.btn} onClick={onImproveScore}>
              {hasScores ? '📊 Improve My Score' : '🚀 Start Building My Score'}
            </button>
          </div>

          <div style={s.visual}>
            <div style={s.ringWrap}>
              <svg viewBox="0 0 180 180" width="180" height="180">
                <defs>
                  <linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="var(--teal)" />
                    <stop offset="100%" stopColor="var(--purple)" />
                  </linearGradient>
                </defs>
                <circle cx="90" cy="90" r="72" fill="none" stroke="#F0EEF8" strokeWidth="14" />
                <circle cx="90" cy="90" r="72" fill="none" stroke={hasScores ? 'url(#rg)' : '#E8E4F8'}
                  strokeWidth="14" strokeDasharray={circ} strokeDashoffset={hasScores ? offset : circ}
                  strokeLinecap="round" transform="rotate(-90 90 90)"
                  style={{ transition: 'stroke-dashoffset 1.2s ease' }} />
              </svg>
              <div style={s.ringCenter}>
                <span style={{ fontFamily: "'Boogaloo', cursive", fontSize: '3rem', color: hasScores ? 'var(--navy)' : '#CCC', lineHeight: 1 }}>
                  {hasScores ? score : '?'}
                </span>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#8A90AA' }}>SHIELD SCORE</span>
              </div>
            </div>

            <div style={{ width: '100%', maxWidth: 300, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {BARS.map(bar => {
                const val = user[bar.key] || bar.default;
                return (
                  <div key={bar.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontWeight: 700, fontSize: '0.82rem' }}>{bar.label}</span>
                      <span style={{ fontWeight: 800, fontSize: '0.82rem', color: val > 0 ? 'var(--navy)' : '#CCC' }}>
                        {val > 0 ? `${val}%` : '—'}
                      </span>
                    </div>
                    <div style={{ height: 10, background: '#F0EEF8', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${val}%`, background: val > 0 ? bar.color : '#EEE', borderRadius: 99, transition: 'width 1s ease' }} />
                    </div>
                  </div>
                );
              })}
              {!hasScores && (
                <p style={{ fontSize: '0.78rem', color: '#999', textAlign: 'center', marginTop: 8 }}>
                  Use the tools above to populate your scores!
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
