import React from 'react';

const STYLE = `
@keyframes cs-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
@keyframes cs-blink{0%,90%,100%{transform:scaleY(1)}95%{transform:scaleY(0.08)}}
@keyframes cs-ear{0%,80%,100%{transform:rotate(0deg)}85%{transform:rotate(-12deg)}90%{transform:rotate(8deg)}95%{transform:rotate(-5deg)}}
@keyframes cs-shield{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
@keyframes cs-spin{to{transform:rotate(360deg)}}
@keyframes cs-sparkle{0%,100%{opacity:0;transform:scale(0)}50%{opacity:1;transform:scale(1)}}
.cs-float{animation:cs-float 3.2s ease-in-out infinite}
.cs-blink{animation:cs-blink 4s ease-in-out infinite;transform-origin:center}
.cs-ear-l{animation:cs-ear 5s ease-in-out infinite;transform-origin:68px 88px}
.cs-ear-r{animation:cs-ear 5s ease-in-out infinite .35s;transform-origin:142px 88px}
.cs-shield{animation:cs-shield 2.6s ease-in-out infinite;transform-origin:105px 185px}
.cs-spin{animation:cs-spin 7s linear infinite;transform-origin:105px 92px}
.cs-sp1{animation:cs-sparkle 2.1s ease-in-out infinite 0s}
.cs-sp2{animation:cs-sparkle 2.1s ease-in-out infinite .75s}
.cs-sp3{animation:cs-sparkle 2.1s ease-in-out infinite 1.5s}
`;

let styleInjected = false;
function injectStyle() {
  if (styleInjected || typeof document === 'undefined') return;
  const el = document.createElement('style');
  el.textContent = STYLE;
  document.head.appendChild(el);
  styleInjected = true;
}

export function GuardianSVG({ size = 210, style = {} }) {
  injectStyle();
  return (
    <svg viewBox="0 0 210 270" width={size} height={Math.round(size * 270/210)} style={style} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="cs-body" cx="38%" cy="32%" r="62%">
          <stop offset="0%" stopColor="#A8A0F8"/>
          <stop offset="100%" stopColor="#7C6FCD"/>
        </radialGradient>
        <radialGradient id="cs-face" cx="38%" cy="32%" r="62%">
          <stop offset="0%" stopColor="#FFF0E8"/>
          <stop offset="100%" stopColor="#FFD8C0"/>
        </radialGradient>
        <radialGradient id="cs-tummy" cx="50%" cy="38%" r="60%">
          <stop offset="0%" stopColor="#ECEAFF"/>
          <stop offset="100%" stopColor="#CBC4F8"/>
        </radialGradient>
      </defs>

      <ellipse cx="105" cy="266" rx="46" ry="7" fill="#7C6FCD" opacity="0.13"/>

      <g className="cs-float">
        <g className="cs-sp1">
          <polygon points="28,58 30,52 32,58 38,60 32,62 30,68 28,62 22,60" fill="#FFD700" opacity="0.9"/>
        </g>
        <g className="cs-sp2">
          <polygon points="174,84 176,78 178,84 184,86 178,88 176,94 174,88 168,86" fill="#FF9EBC" opacity="0.85"/>
        </g>
        <g className="cs-sp3">
          <polygon points="40,148 42,143 44,148 50,150 44,152 42,157 40,152 34,150" fill="#A8F0D0" opacity="0.85"/>
        </g>

        <g className="cs-ear-l">
          <ellipse cx="68" cy="80" rx="17" ry="22" fill="#8A7FD8"/>
          <ellipse cx="68" cy="82" rx="10" ry="14" fill="#FFB3C8"/>
        </g>
        <g className="cs-ear-r">
          <ellipse cx="142" cy="80" rx="17" ry="22" fill="#8A7FD8"/>
          <ellipse cx="142" cy="82" rx="10" ry="14" fill="#FFB3C8"/>
        </g>

        <ellipse cx="105" cy="185" rx="54" ry="62" fill="url(#cs-body)"/>
        <ellipse cx="105" cy="188" rx="34" ry="42" fill="url(#cs-tummy)" opacity="0.85"/>

        <g className="cs-shield">
          <path d="M105 165 L122 172 L122 185 Q122 196 105 202 Q88 196 88 185 L88 172 Z" fill="#5DCAA5" opacity="0.92"/>
          <path d="M105 167 L120 174 L120 184 Q120 193 105 199" fill="none" stroke="rgba(255,255,255,0.32)" strokeWidth="1.5"/>
          <polyline points="96,183 102,190 115,175" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
        </g>

        <ellipse cx="56" cy="178" rx="15" ry="24" fill="#8A7FD8" transform="rotate(-16 56 178)"/>
        <circle cx="48" cy="194" r="11" fill="#A8A0F8"/>
        <ellipse cx="154" cy="178" rx="15" ry="24" fill="#8A7FD8" transform="rotate(16 154 178)"/>
        <circle cx="162" cy="194" r="11" fill="#A8A0F8"/>

        <ellipse cx="86" cy="238" rx="19" ry="13" fill="#7A6FC8"/>
        <ellipse cx="124" cy="238" rx="19" ry="13" fill="#7A6FC8"/>
        <ellipse cx="84" cy="248" rx="21" ry="11" fill="#6A5FB8"/>
        <ellipse cx="126" cy="248" rx="21" ry="11" fill="#6A5FB8"/>

        <circle cx="105" cy="115" r="56" fill="url(#cs-body)"/>
        <ellipse cx="105" cy="121" rx="36" ry="40" fill="url(#cs-face)"/>

        <ellipse cx="72" cy="128" rx="12" ry="8" fill="#FFB3A0" opacity="0.52"/>
        <ellipse cx="138" cy="128" rx="12" ry="8" fill="#FFB3A0" opacity="0.52"/>
        <circle cx="69" cy="132" r="2" fill="#E88888" opacity="0.45"/>
        <circle cx="75" cy="136" r="1.5" fill="#E88888" opacity="0.38"/>
        <circle cx="135" cy="132" r="2" fill="#E88888" opacity="0.45"/>
        <circle cx="141" cy="136" r="1.5" fill="#E88888" opacity="0.38"/>

        <g className="cs-blink">
          <ellipse cx="90" cy="116" rx="13" ry="14" fill="white"/>
          <ellipse cx="120" cy="116" rx="13" ry="14" fill="white"/>
          <circle cx="92" cy="117" r="9" fill="#2D3A5F"/>
          <circle cx="122" cy="117" r="9" fill="#2D3A5F"/>
          <circle cx="95" cy="113" r="3.5" fill="white"/>
          <circle cx="90" cy="120" r="1.8" fill="white" opacity="0.65"/>
          <circle cx="125" cy="113" r="3.5" fill="white"/>
          <circle cx="120" cy="120" r="1.8" fill="white" opacity="0.65"/>
        </g>

        <ellipse cx="105" cy="132" rx="4.5" ry="3.5" fill="#E89070"/>
        <path d="M91 140 Q105 152 119 140" fill="none" stroke="#C87050" strokeWidth="2.8" strokeLinecap="round"/>

        <g className="cs-spin">
          <polygon points="105,89 107.5,96 115,96 109,100 111.5,107 105,103 98.5,107 101,100 95,96 102.5,96" fill="#FFD700" opacity="0.96"/>
        </g>
      </g>
    </svg>
  );
}

export function GuardianMini({ size = 36 }) {
  injectStyle();
  return (
    <svg viewBox="0 0 80 90" width={size} height={Math.round(size * 90/80)} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="cs-mb" cx="38%" cy="32%" r="62%">
          <stop offset="0%" stopColor="#A8A0F8"/>
          <stop offset="100%" stopColor="#7C6FCD"/>
        </radialGradient>
      </defs>
      <ellipse cx="40" cy="88" rx="18" ry="4" fill="#7C6FCD" opacity="0.12"/>
      <g className="cs-float">
        <ellipse cx="25" cy="26" rx="8" ry="11" fill="#8A7FD8"/>
        <ellipse cx="25" cy="28" rx="5" ry="7" fill="#FFB3C8"/>
        <ellipse cx="55" cy="26" rx="8" ry="11" fill="#8A7FD8"/>
        <ellipse cx="55" cy="28" rx="5" ry="7" fill="#FFB3C8"/>
        <ellipse cx="40" cy="70" rx="22" ry="22" fill="url(#cs-mb)"/>
        <ellipse cx="40" cy="71" rx="13" ry="14" fill="#ECEAFF" opacity="0.82"/>
        <path d="M40 63 L47 66 L47 72 Q47 77 40 79 Q33 77 33 72 L33 66 Z" fill="#5DCAA5" opacity="0.9"/>
        <polyline points="36,71 39,75 44,68" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <ellipse cx="20" cy="68" rx="7" ry="12" fill="#8A7FD8" transform="rotate(-14 20 68)"/>
        <ellipse cx="60" cy="68" rx="7" ry="12" fill="#8A7FD8" transform="rotate(14 60 68)"/>
        <ellipse cx="31" cy="88" rx="9" ry="6" fill="#6A5FB8"/>
        <ellipse cx="49" cy="88" rx="9" ry="6" fill="#6A5FB8"/>
        <circle cx="40" cy="38" r="22" fill="url(#cs-mb)"/>
        <ellipse cx="40" cy="41" rx="15" ry="16" fill="#FFF0E8"/>
        <ellipse cx="24" cy="44" rx="5" ry="3" fill="#FFB3A0" opacity="0.5"/>
        <ellipse cx="56" cy="44" rx="5" ry="3" fill="#FFB3A0" opacity="0.5"/>
        <ellipse cx="32" cy="39" rx="5.5" ry="6" fill="white"/>
        <ellipse cx="48" cy="39" rx="5.5" ry="6" fill="white"/>
        <circle cx="33" cy="40" r="3.5" fill="#2D3A5F"/>
        <circle cx="49" cy="40" r="3.5" fill="#2D3A5F"/>
        <circle cx="34.5" cy="38" r="1.5" fill="white"/>
        <circle cx="50.5" cy="38" r="1.5" fill="white"/>
        <ellipse cx="40" cy="46" rx="2.2" ry="1.8" fill="#E89070"/>
        <path d="M33 51 Q40 57 47 51" fill="none" stroke="#C87050" strokeWidth="2" strokeLinecap="round"/>
        <polygon points="40,20 41.5,25 47,25 42.5,28 44,33 40,30 36,33 37.5,28 33,25 38.5,25" fill="#FFD700" opacity="0.92"/>
      </g>
    </svg>
  );
}
