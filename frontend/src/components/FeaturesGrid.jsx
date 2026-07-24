import React from 'react';

const FEATURES = [
  { id: 'resume',    color: 'mint',  icon: '📄', title: 'Resume Analyzer',        badge: 'ATS Smart',       badgeColor: 'var(--teal)',      desc: 'Upload PDF/DOCX or paste text — get ATS score, keyword gaps, section feedback and action items.' },
  { id: 'roast',     color: 'peach', icon: '🔥', title: 'Roast My Resume',         badge: 'Brutal Honesty',  badgeColor: '#FF5722',          desc: 'Get brutally honest AI feedback on every weakness — tough love that gets results fast.' },
  { id: 'cover',     color: 'peach', icon: '✉️', title: 'Cover Letter Generator',  badge: 'Auto-Craft',      badgeColor: 'var(--peach-dark)', desc: 'Drop in your resume and job description — Aria crafts a personalized cover letter in seconds.' },
  { id: 'linkedin',  color: 'lemon', icon: '💼', title: 'LinkedIn Optimizer',      badge: 'Recruiter Magnet',badgeColor: '#C8A800',          desc: 'AI-suggested headlines, keyword-rich summaries, and profile improvements that attract recruiters.' },
  { id: 'salary',    color: 'lav',   icon: '💸', title: 'Salary Negotiation Coach',badge: '+20% Avg Raise',  badgeColor: 'var(--purple)',     desc: 'Real salary ranges and word-for-word negotiation scripts so you never undersell yourself again.' },
  { id: 'interview', color: 'sky',   icon: '🎯', title: 'Interview Question Bank', badge: 'Role-Specific',   badgeColor: 'var(--sky-dark)',   desc: 'Role-specific questions with STAR answer guides. Practice until you are truly confident!' },
  { id: 'mockinterview', color: 'rose', icon: '🎤', title: 'Mock Interview',       badge: 'AI Practice',     badgeColor: '#9C27B0',          desc: 'Full mock interview rounds with follow-up questions, expected answers and red flag alerts.' },
  { id: 'skillgap',  color: 'sky',   icon: '📊', title: 'Skill Gap Analyzer',      badge: 'Know Your Gap',   badgeColor: '#2196F3',          desc: 'Find exactly what skills you are missing for your dream role and the fastest way to get them.' },
  { id: 'roadmap',   color: 'rose',  icon: '🗺️', title: 'Career Roadmap',          badge: 'Personalized',    badgeColor: 'var(--rose-dark)',  desc: 'Step-by-step phase plan with skills, milestones and timelines — tailored to your dream career.' },
  { id: 'careerpaths', color: 'lemon', icon: '🚀', title: 'Career Paths',          badge: '3 Options',       badgeColor: '#FF9800',          desc: 'Discover 3 realistic career paths based on your background, skills and interests.' },
  { id: 'coldemail', color: 'peach', icon: '🔗', title: 'Cold Email Generator',    badge: 'Network Booster', badgeColor: 'var(--coral)',      desc: 'Professional outreach messages to recruiters and industry pros — handles the awkward first message!' },
];

const COLOR_MAP = {
  mint:  { bg: '#E8FFF5', accent: 'var(--mint-dark)',      blob: 'var(--mint)' },
  peach: { bg: '#FFF6F2', accent: 'var(--peach-dark)',     blob: 'var(--peach)' },
  lemon: { bg: '#FFFDE8', accent: '#E8DC70',               blob: 'var(--lemon)' },
  lav:   { bg: '#F5F4FF', accent: 'var(--lavender-dark)',  blob: 'var(--lavender)' },
  sky:   { bg: '#F0FAFF', accent: 'var(--sky-dark)',       blob: 'var(--sky)' },
  rose:  { bg: '#FFF5F8', accent: 'var(--rose-dark)',      blob: 'var(--rose)' },
};

export default function FeaturesGrid({ onOpenTool }) {
  const s = {
    section: { padding: '80px 48px', background: 'var(--body-bg)' },
    header: { textAlign: 'center', marginBottom: 52 },
    label: { fontSize: '0.72rem', fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12, color: 'var(--teal)', display: 'block' },
    title: { fontFamily: "'Boogaloo', cursive", fontSize: '2.5rem', color: 'var(--navy)', marginBottom: 10 },
    sub: { color: '#6A7299', maxWidth: 560, margin: '0 auto', fontSize: '0.95rem', fontWeight: 500 },
    grid: { maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 22 },
    card: (color) => ({ background: COLOR_MAP[color]?.bg || 'white', borderRadius: 22, padding: 26, border: '1.5px solid transparent', cursor: 'pointer', position: 'relative', overflow: 'hidden', transition: 'transform 0.25s, box-shadow 0.25s' }),
    icon: { fontSize: '2rem', marginBottom: 10, display: 'block' },
    cardTitle: { fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: '1.02rem', color: 'var(--navy)', marginBottom: 7 },
    cardDesc: { fontSize: '0.84rem', lineHeight: 1.6, color: '#5A6488', fontWeight: 500, marginBottom: 13 },
    badge: (color) => ({ display: 'inline-block', background: color, color: 'white', fontSize: '0.7rem', fontWeight: 800, padding: '3px 10px', borderRadius: 20 }),
    arrow: { position: 'absolute', bottom: 22, right: 22, fontSize: '1rem', color: 'var(--purple)', fontWeight: 800, opacity: 0.5 },
  };

  return (
    <section style={s.section} id="superpowers">
      <div style={s.header}>
        <span style={s.label}>✨ All Tools</span>
        <h2 style={s.title}>Aria's Arsenal</h2>
        <p style={s.sub}>11 AI-powered career tools — click any card to get started instantly!</p>
      </div>

      <div style={s.grid}>
        {FEATURES.map((feat) => (
          <div key={feat.id}
            style={s.card(feat.color)}
            onClick={() => onOpenTool(feat.id)}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.1)';
              e.currentTarget.style.borderColor = COLOR_MAP[feat.color]?.accent || 'var(--lavender-dark)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = '';
              e.currentTarget.style.boxShadow = '';
              e.currentTarget.style.borderColor = 'transparent';
            }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: 110, height: 110, borderRadius: '50%', opacity: 0.18, transform: 'translate(30%,-30%)', background: COLOR_MAP[feat.color]?.blob || 'var(--lavender)' }} />
            <span style={s.icon}>{feat.icon}</span>
            <div style={s.cardTitle}>{feat.title}</div>
            <p style={s.cardDesc}>{feat.desc}</p>
            <span style={s.badge(feat.badgeColor)}>{feat.badge}</span>
            <div style={s.arrow}>→</div>
          </div>
        ))}

        {/* Scam checker — wide card */}
        <div style={{ ...s.card('mint'), background: 'linear-gradient(135deg,#E8FFF5,var(--mint))', gridColumn: 'span 2' }}
          onClick={() => onOpenTool('scam')}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '2rem', minWidth: 44 }}>🔍</span>
            <div style={{ flex: 1 }}>
              <div style={s.cardTitle}>Company Legitimacy Checker <span style={{ fontFamily: "'Boogaloo', cursive", fontSize: '1rem', color: 'var(--coral)' }}>— Stay Safe!</span></div>
              <p style={s.cardDesc}>Paste any job offer and Aria instantly detects suspicious patterns, advance-fee traps, fake companies and more. Never fall for a scam again!</p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {[['rgba(46,196,160,0.2)','#1E6B4F','✅ Real-time Analysis'],['rgba(255,140,105,0.15)','#B8500A','🚨 Scam Pattern Detection'],['rgba(255,244,176,0.6)','#7A6A00','⚠️ Risk Scoring']].map(([bg,color,text]) => (
                  <span key={text} style={{ background: bg, color, padding: '4px 12px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700 }}>{text}</span>
                ))}
              </div>
            </div>
            <span style={{ fontSize: '1.4rem', alignSelf: 'center', color: 'var(--purple)', opacity: 0.6 }}>→</span>
          </div>
        </div>
      </div>
    </section>
  );
}
