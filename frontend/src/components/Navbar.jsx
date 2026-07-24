import React, { useState } from 'react';
import ThemeToggle from './ThemeToggle';

export default function Navbar({ user, onLogout, onSectionClick }) {
  const [ddOpen, setDdOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: 'Dashboard', emoji: '📊', id: 'dashboard' },
    { label: 'Superpowers', emoji: '✨', id: 'superpowers' },
    { label: 'Guardian', emoji: '⚔️', id: 'guardian' },
    { label: 'How it Works', emoji: '🗺️', id: 'how' },
    { label: 'About', emoji: '💜', id: 'about' },
  ];

  const s = {
    nav: {
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 48px',
      background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(14px)',
      borderBottom: '1.5px solid rgba(200,190,255,0.25)',
    },
    logo: {
      fontFamily: "'Boogaloo', cursive", fontSize: '1.7rem', color: 'var(--purple)',
      letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
    },
    logoBadge: {
      background: 'linear-gradient(135deg,#6EDBB0,#2EC4A0)', color: 'white',
      fontSize: '0.65rem', fontFamily: "'Nunito', sans-serif", fontWeight: 800,
      letterSpacing: 1, padding: '2px 7px', borderRadius: 20, textTransform: 'uppercase', marginTop: 2,
    },
    links: { display: 'flex', gap: 4, listStyle: 'none', alignItems: 'center' },
    link: (active) => ({
      fontWeight: 700, fontSize: '0.86rem', color: active ? 'var(--purple)' : 'var(--dark)',
      padding: '7px 13px', borderRadius: 50, display: 'flex', alignItems: 'center', gap: 5,
      cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap',
      background: active ? 'var(--lavender)' : 'transparent',
    }),
    userArea: { display: 'flex', alignItems: 'center', gap: 10, position: 'relative' },
    avatarBtn: {
      display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
      padding: '4px 10px 4px 4px', borderRadius: 50,
      border: '1.5px solid rgba(200,190,255,0.35)',
      background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)',
    },
    avatar: {
      width: 38, height: 38, borderRadius: '50%',
      background: 'linear-gradient(135deg,var(--purple),var(--lavender-dark))',
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.15rem',
    },
    dd: {
      position: 'absolute', top: 'calc(100% + 10px)', right: 0,
      background: 'white', borderRadius: 16, padding: 8,
      boxShadow: '0 12px 40px rgba(0,0,0,0.12)', border: '1.5px solid rgba(200,190,255,0.3)',
      minWidth: 200, zIndex: 200, animation: 'fade-in 0.2s ease',
    },
    ddItem: (isLogout) => ({
      display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px',
      borderRadius: 10, cursor: 'pointer', fontSize: '0.83rem', fontWeight: 700,
      color: isLogout ? '#C0405A' : 'var(--dark)',
      transition: 'background 0.15s',
    }),
    mobileMenu: {
      position: 'fixed', top: 64, left: 0, right: 0,
      background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)',
      borderBottom: '1.5px solid rgba(200,190,255,0.25)',
      padding: '12px 24px 20px', zIndex: 99,
      flexDirection: 'column', gap: 4,
      animation: 'fade-in 0.2s ease',
    },
  };

  return (
    <>
      <nav style={s.nav}>
        <div style={s.logo} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          ⚔️ CareerShield <span style={s.logoBadge}>AI</span>
        </div>

        <ul style={{ ...s.links, display: window.innerWidth < 768 ? 'none' : 'flex' }}>
          {navLinks.map(link => (
            <li key={link.id}>
              <span style={s.link(false)} onClick={() => onSectionClick(link.id)}>
                <span>{link.emoji}</span> {link.label}
              </span>
            </li>
          ))}
        </ul>

        <div style={s.userArea}>
          <ThemeToggle />
          <div style={s.avatarBtn} onClick={() => setDdOpen(!ddOpen)}>
            <div style={s.avatar}>{user.avatar || '🦊'}</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--navy)' }}>
                {user.firstName}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#8A90AA', fontWeight: 600 }}>
                {user.goal || 'Career Explorer'}
              </div>
            </div>
            <span style={{ color: '#B0B8CC', fontSize: '0.7rem', marginLeft: 2 }}>▾</span>
          </div>

          {ddOpen && (
            <div style={s.dd} onMouseLeave={() => setDdOpen(false)}>
              <div style={{ padding: '10px 12px', borderBottom: '1px solid #F0EEF8', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{ ...s.avatar, width: 42, height: 42, fontSize: '1.4rem', flexShrink: 0 }}>
                    {user.avatar || '🦊'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--navy)' }}>
                      {user.firstName} {user.lastName}
                    </div>
                    <div style={{ fontSize: '0.71rem', color: '#8A90AA', fontWeight: 600 }}>{user.email}</div>
                  </div>
                </div>
                <div style={{ padding: '6px 10px', background: 'var(--lavender)', borderRadius: 10, fontSize: '0.72rem', fontWeight: 700, color: 'var(--purple)', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span>🎯</span><span>{user.goal || 'Career Explorer'}</span>
                </div>
              </div>

              {navLinks.map(link => (
                <div key={link.id} style={s.ddItem(false)}
                  onClick={() => { onSectionClick(link.id); setDdOpen(false); }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--lavender)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  {link.emoji} {link.label}
                </div>
              ))}

              <div style={{ height: 1, background: '#F0EEF8', margin: '4px 4px' }} />
              <div style={s.ddItem(true)} onClick={() => { onLogout(); setDdOpen(false); }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--rose)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                🚪 Sign Out
              </div>
            </div>
          )}

          <button
            style={{ display: 'flex', flexDirection: 'column', gap: 5, cursor: 'pointer', padding: 6, border: 'none', background: 'none' }}
            onClick={() => setMobileOpen(!mobileOpen)}>
            {[0,1,2].map(i => <span key={i} style={{ width: 22, height: 2.5, background: 'var(--navy)', borderRadius: 99, display: 'block' }} />)}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div style={{ ...s.mobileMenu, display: 'flex' }}>
          {navLinks.map(link => (
            <span key={link.id}
              style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--dark)', padding: '11px 14px', borderRadius: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
              onClick={() => { onSectionClick(link.id); setMobileOpen(false); }}>
              {link.emoji} {link.label}
            </span>
          ))}
          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#C0405A', padding: '11px 14px', borderRadius: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
            onClick={onLogout}>
            🚪 Sign Out
          </span>
        </div>
      )}
    </>
  );
}
