import React, { useEffect, useState } from 'react';
import { GuardianSVG } from './GuardianSVG';

const SPEECHES = [
  "Mission ready! Let's dominate your career goals! 🎯",
  "Your resume deserves elite-tier upgrades. Let's go! ⚡",
  "I've blocked 14K+ scams. You're safe with me. 🛡️",
  "Interview prep? I've got battle-tested answers! ⚔️",
  "Salary negotiation time — let me arm you! 💰",
];

export default function HeroSection({ user, onStartJourney, onViewScore }) {
  const [speechIdx, setSpeechIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setSpeechIdx(i => (i + 1) % SPEECHES.length), 4000);
    return () => clearInterval(t);
  }, []);

  const s = {
    hero: {
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '100px 48px 60px', position: 'relative',
      background: 'radial-gradient(ellipse 80% 60% at 10% 20%,rgba(184,240,216,0.45) 0%,transparent 60%), radial-gradient(ellipse 60% 50% at 90% 80%,rgba(221,214,255,0.5) 0%,transparent 60%), radial-gradient(ellipse 50% 40% at 50% 10%,rgba(200,238,255,0.35) 0%,transparent 60%)',
    },
    inner: {
      maxWidth: 1200, width: '100%',
      display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center',
    },
    tag: {
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: 'var(--lemon)', border: '1.5px solid #E8DC70',
      borderRadius: 50, padding: '5px 14px', fontSize: '0.78rem',
      fontWeight: 700, color: '#7A6A00', marginBottom: 18,
    },
    dot: { width: 7, height: 7, background: '#C8A800', borderRadius: '50%' },
    h1: {
      fontFamily: "'Boogaloo', cursive",
      fontSize: 'clamp(2.6rem,5vw,4.2rem)', lineHeight: 1.1,
      color: 'var(--navy)', marginBottom: 20,
    },
    highlight: {
      background: 'linear-gradient(120deg,var(--teal),var(--purple))',
      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    },
    p: { fontSize: '1.05rem', lineHeight: 1.75, color: '#4A5580', marginBottom: 36, fontWeight: 500 },
    btns: { display: 'flex', gap: 14, flexWrap: 'wrap' },
    btnPrimary: {
      background: 'linear-gradient(135deg,var(--teal),#25A88A)', color: 'white', border: 'none',
      padding: '14px 32px', borderRadius: 50,
      fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: '1rem',
      boxShadow: '0 6px 20px rgba(46,196,160,0.38)', display: 'flex', alignItems: 'center', gap: 8,
      transition: 'all 0.2s',
    },
    btnSecondary: {
      background: 'white', color: 'var(--purple)',
      border: '2px solid var(--lavender-dark)', padding: '14px 28px', borderRadius: 50,
      fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: '1rem',
      transition: 'all 0.2s',
    },
    buddyStage: { position: 'relative', width: 340, height: 380 },
    blob: {
      position: 'absolute', top: 10, left: 10, width: 320, height: 320,
      background: 'linear-gradient(135deg,var(--lavender),var(--sky))',
      borderRadius: '60% 40% 55% 45% / 50% 55% 45% 55%',
      animation: 'blobmorph 6s ease-in-out infinite', zIndex: 0,
    },
    svgWrap: {
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 2, animation: 'buddy-float 3.5s ease-in-out infinite',
    },
    speechBubble: {
      position: 'absolute', top: -14, right: -14,
      background: 'white', border: '2px solid var(--lavender-dark)',
      borderRadius: '20px 20px 20px 4px', padding: '10px 15px',
      fontSize: '0.78rem', fontWeight: 700, color: 'var(--purple)',
      boxShadow: '0 4px 16px rgba(124,111,205,0.15)', zIndex: 5,
      maxWidth: 220, textAlign: 'center', lineHeight: 1.4,
      animation: 'bubble-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) both',
    },
  };

  const floatBadges = [
    { style: { top: 30, left: -30, background: 'var(--mint)', animationDelay: '0s' }, icon: '✅', text: 'ATS Ready' },
    { style: { bottom: 60, left: -40, background: 'var(--peach)', animationDelay: '1.2s' }, icon: '🔒', text: 'Scam Safe' },
    { style: { bottom: 20, right: -20, background: 'var(--lemon)', animationDelay: '0.7s' }, icon: '⭐', text: `Score: ${user.shieldScore || 78}` },
  ];

  return (
    <section style={s.hero}>
      <div style={s.inner}>
        <div style={{ animation: 'fade-in 0.6s ease both' }}>
          <div style={s.tag}><span style={s.dot} /><span>Welcome to CareerShield!</span></div>
          <h1 style={s.h1}>
            Hey <span style={s.highlight}>{user.firstName}</span>,<br />
            let's level up! 🚀
          </h1>
          <p style={s.p}>
            Your Career Guardian is fully armed and ready to help you smash your goals.
            Resume, interviews, salary, safety — all covered!
          </p>
          <div style={s.btns}>
            <button style={s.btnPrimary} onClick={onStartJourney}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(46,196,160,0.45)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 6px 20px rgba(46,196,160,0.38)'; }}>
              ⚔️ Start My Mission
            </button>
            <button style={s.btnSecondary} onClick={onViewScore}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--lavender)'}
              onMouseLeave={e => e.currentTarget.style.background = 'white'}>
              📊 View Shield Score
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={s.buddyStage}>
            <div style={s.blob} />
            {floatBadges.map((b, i) => (
              <div key={i} style={{
                position: 'absolute', ...b.style,
                background: b.style.background, borderRadius: 14,
                padding: '7px 12px', fontSize: '0.72rem', fontWeight: 700,
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                display: 'flex', alignItems: 'center', gap: 5, zIndex: 3,
                animation: `badge-float 4s ease-in-out infinite`,
                animationDelay: b.style.animationDelay,
              }}>
                <span>{b.icon}</span>
                <span style={{ color: 'var(--navy)' }}>{b.text}</span>
              </div>
            ))}
            <div style={s.svgWrap}>
              <div style={s.speechBubble} key={speechIdx}>{SPEECHES[speechIdx]}</div>
              <GuardianSVG size={230} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
