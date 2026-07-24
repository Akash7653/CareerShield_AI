import React, { useState, lazy, Suspense } from 'react';
import Navbar from './Navbar';
import HeroSection from './HeroSection';
import ShieldScore from './ShieldScore';
import FeaturesGrid from './FeaturesGrid';
import ChatSection from './ChatSection';
import { HowSection, SafetySection, CtaSection } from './Sections';

// Lazy load heavy components
const ToolModal = lazy(() => import('./ToolModal'));
const LiveInterview = lazy(() => import('./LiveInterview'));
const ChatPage = lazy(() => import('./ChatPage'));
const UserDashboard = lazy(() => import('./UserDashboard'));

export default function MainApp({ user, setUser, token, onLogout, showToast }) {
  const [activeTool, setActiveTool] = useState(null);
  const [showLiveInterview, setShowLiveInterview] = useState(false);
  const [showChatPage, setShowChatPage] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

  const scrollTo = (id) => {
    if (id === 'guardian') {
      setShowChatPage(true);
      return;
    }
    if (id === 'dashboard') {
      setShowDashboard(true);
      return;
    }
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const openTool = (toolId) => {
    if (toolId === 'mockinterview') {
      setShowLiveInterview(true);
    } else if (toolId === 'chat' || toolId === 'guardian') {
      setShowChatPage(true);
    } else {
      setActiveTool(toolId);
    }
  };
  const closeTool = () => setActiveTool(null);

  // Full-page overlays
  if (showDashboard) {
    return (
      <Suspense fallback={<div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'var(--body-bg)' }}>Loading...</div>}>
        <UserDashboard user={user} token={token} onClose={() => setShowDashboard(false)} />
      </Suspense>
    );
  }

  if (showChatPage) {
    return (
      <Suspense fallback={<div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'var(--body-bg)' }}>Loading...</div>}>
        <ChatPage token={token} onClose={() => setShowChatPage(false)} />
      </Suspense>
    );
  }

  if (showLiveInterview) {
    return (
      <Suspense fallback={<div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'var(--body-bg)' }}>Loading...</div>}>
        <LiveInterview token={token} onClose={() => setShowLiveInterview(false)} />
      </Suspense>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      <Navbar user={user} onLogout={onLogout} onSectionClick={scrollTo} />
      <main>
        <HeroSection user={user} onStartJourney={() => scrollTo('superpowers')} onViewScore={() => scrollTo('shield-score')} />
        <div id="shield-score">
          <ShieldScore user={user} onImproveScore={() => scrollTo('superpowers')} />
        </div>
        <FeaturesGrid onOpenTool={openTool} />
        <ChatSection token={token} onOpenFullChat={() => setShowChatPage(true)} />
        <HowSection />
        <SafetySection onCheckScam={() => openTool('scam')} />
        <CtaSection onGetStarted={() => scrollTo('superpowers')} />
      </main>

      {activeTool && (
        <Suspense fallback={<div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'var(--body-bg)' }}>Loading...</div>}>
          <ToolModal toolId={activeTool} token={token} onClose={closeTool} showToast={showToast} setUser={setUser} />
        </Suspense>
      )}
    </div>
  );
}
